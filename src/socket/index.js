import { Server } from 'socket.io';
import User from '../models/userModel.js';
import { uploadChatFile, deleteChatFile } from '../utils/chatFileUpload.js';
import { FRONTEND_URL, s3 } from '../config/config.js';;
import { Op } from 'sequelize';


function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: FRONTEND_URL,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    const onlineUsers = new Set();
    const userStatus = new Map();

    io.on('connection', async (socket) => {

        socket.on('user_connected', (userId) => {
            if (!userId) return;

            socket.userId = userId;
            socket.join(userId);
            onlineUsers.add(userId);
            userStatus.set(userId, {
                isOnline: true,
                lastSeen: new Date().toISOString()
            });

            io.emit('users_status', {
                activeUsers: Array.from(onlineUsers),
                userStatus: Object.fromEntries(userStatus)
            });
        });

        socket.on('disconnect', () => {
            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                userStatus.set(socket.userId, {
                    isOnline: false,
                    lastSeen: new Date().toISOString()
                });

                io.emit('users_status', {
                    activeUsers: Array.from(onlineUsers),
                    userStatus: Object.fromEntries(userStatus)
                });
            }
        });

        // Handle errors silently unless critical
        socket.on('error', (error) => {
            if (error.critical) {
                console.error('Critical socket error:', error);
            }
        });

        // Remove unnecessary logs from event handlers
        socket.on('get_conversations', async ({ userId }) => {
            try {
                const user = await User.findOne({ where: { id: userId } });
                if (user) {
                    // Check if conversations is already an object
                    let conversations = user.conversations;
                    if (typeof conversations === 'string') {
                        try {
                            conversations = JSON.parse(conversations);
                        } catch (e) {
                            conversations = {};
                        }
                    } else if (!conversations) {
                        conversations = {};
                    }

                    socket.emit('conversations_received', conversations);
                }
            } catch (error) {
                console.error('Error in get_conversations:', error.message);
            }
        });

        socket.on('send_message', async (data) => {
            try {
                const { sender_id, receiver_id, message, id } = data;
                const [sender, receiver] = await Promise.all([
                    User.findOne({ where: { id: sender_id } }),
                    User.findOne({ where: { id: receiver_id } })
                ]);

                if (!sender || !receiver) {
                    throw new Error('User not found');
                }

                const newMessage = {
                    id: id || `${Date.now()}-${sender_id}`,
                    sender_id,
                    message,
                    timestamp: new Date().toISOString()
                };

                try {
                    let senderConvos = typeof sender.conversations === 'string'
                        ? JSON.parse(sender.conversations || '{}')
                        : sender.conversations || {};

                    let receiverConvos = typeof receiver.conversations === 'string'
                        ? JSON.parse(receiver.conversations || '{}')
                        : receiver.conversations || {};

                    if (!senderConvos[receiver_id]) senderConvos[receiver_id] = [];
                    if (!receiverConvos[sender_id]) receiverConvos[sender_id] = [];

                    // Add messages with initial status
                    senderConvos[receiver_id].push({
                        ...newMessage,
                        status: 'sent',
                        delivered_at: null,
                        read_at: null
                    });

                    receiverConvos[sender_id].push({
                        ...newMessage,
                        status: 'delivered',
                        delivered_at: new Date().toISOString(),
                        read_at: null
                    });

                    await Promise.all([
                        sender.update({ conversations: JSON.stringify(senderConvos) }),
                        receiver.update({ conversations: JSON.stringify(receiverConvos) })
                    ]);

                    // Emit to sender with sent status
                    io.to(sender_id).emit('receive_message', {
                        user_id: receiver_id,
                        message: {
                            ...newMessage,
                            status: 'sent',
                            delivered_at: null,
                            read_at: null
                        }
                    });

                    // Emit to receiver with delivered status
                    io.to(receiver_id).emit('receive_message', {
                        user_id: sender_id,
                        message: {
                            ...newMessage,
                            status: 'delivered',
                            delivered_at: new Date().toISOString(),
                            read_at: null
                        }
                    });

                    // If receiver is online, mark as delivered immediately
                    if (onlineUsers.has(receiver_id)) {
                        io.to(sender_id).emit('message_status_updated', {
                            message_id: newMessage.id,
                            sender_id,
                            receiver_id,
                            status: 'delivered',
                            delivered_at: new Date().toISOString()
                        });
                    }

                } catch (updateError) {
                    console.error('Error updating conversations:', updateError);
                    throw new Error('Failed to save messages');
                }

            } catch (error) {
                console.error('Error in send_message:', error.message);
                socket.emit('send_error', { message: error.message });
            }
        });

        socket.on('mark_messages_read', async ({ sender_id, receiver_id }) => {
            try {
                const [sender, receiver] = await Promise.all([
                    User.findOne({ where: { id: sender_id } }),
                    User.findOne({ where: { id: receiver_id } })
                ]);

                if (sender && receiver) {
                    let senderConvos = typeof sender.conversations === 'string'
                        ? JSON.parse(sender.conversations || '{}')
                        : sender.conversations || {};

                    let receiverConvos = typeof receiver.conversations === 'string'
                        ? JSON.parse(receiver.conversations || '{}')
                        : receiver.conversations || {};

                    const currentTime = new Date().toISOString();
                    let hasUpdates = false;

                    // Update messages in sender's conversations
                    if (senderConvos[receiver_id]) {
                        senderConvos[receiver_id] = senderConvos[receiver_id].map(msg => {
                            if (msg.sender_id === sender_id && msg.status !== 'read') {
                                hasUpdates = true;
                                return {
                                    ...msg,
                                    status: 'read',
                                    read_at: currentTime
                                };
                            }
                            return msg;
                        });
                    }

                    // Update messages in receiver's conversations
                    if (receiverConvos[sender_id]) {
                        receiverConvos[sender_id] = receiverConvos[sender_id].map(msg => {
                            if (msg.sender_id === sender_id && msg.status !== 'read') {
                                hasUpdates = true;
                                return {
                                    ...msg,
                                    status: 'read',
                                    read_at: currentTime
                                };
                            }
                            return msg;
                        });
                    }

                    if (hasUpdates) {
                        await Promise.all([
                            sender.update({ conversations: JSON.stringify(senderConvos) }),
                            receiver.update({ conversations: JSON.stringify(receiverConvos) })
                        ]);

                        // Emit detailed status update to both users
                        io.to(sender_id).to(receiver_id).emit('message_status_updated', {
                            sender_id,
                            receiver_id,
                            status: 'read',
                            read_at: currentTime
                        });

                        // Also emit updated conversations
                        io.to(sender_id).emit('conversations_received', senderConvos);
                        io.to(receiver_id).emit('conversations_received', receiverConvos);
                    }
                }
            } catch (error) {
                console.error('Error in mark_messages_read:', error.message);
            }
        });

        socket.on('typing', ({ sender_id, receiver_id, isTyping }) => {
            try {
                if (!sender_id || !receiver_id) return;

                // Only emit to the receiver, not back to the sender
                socket.to(receiver_id).emit('user_typing', {
                    userId: sender_id,
                    isTyping: isTyping
                });
            } catch (error) {
                console.error('Error in typing event:', error.message);
            }
        });

        socket.on('delete_message', async (data) => {
            try {
                const { message_id, conversation_id, sender_id, is_group } = data;

                if (is_group) {
                    // Handle group message deletion
                    const users = await User.findAll({
                        where: {
                            id: {
                                [Op.in]: members
                            }
                        }
                    });

                    for (const user of users) {
                        let userConvos = JSON.parse(user.conversations || '{}');
                        if (userConvos[conversation_id]?.messages) {
                            userConvos[conversation_id].messages = userConvos[conversation_id].messages.filter(
                                msg => msg.id !== message_id
                            );
                            await user.update({ conversations: JSON.stringify(userConvos) });
                        }
                    }

                    // Notify all group members
                    io.to(conversation_id).emit('message_deleted', {
                        message_id,
                        conversation_id
                    });
                } else {
                    // Handle direct message deletion
                    const [sender, receiver] = await Promise.all([
                        User.findOne({ where: { id: sender_id } }),
                        User.findOne({ where: { id: conversation_id } })
                    ]);

                    if (!sender || !receiver) {
                        throw new Error('Users not found');
                    }

                    let senderConvos = JSON.parse(sender.conversations || '{}');
                    let receiverConvos = JSON.parse(receiver.conversations || '{}');

                    // Remove message from both conversations
                    if (senderConvos[conversation_id]) {
                        senderConvos[conversation_id] = senderConvos[conversation_id].filter(
                            msg => msg.id !== message_id
                        );
                    }

                    if (receiverConvos[sender_id]) {
                        receiverConvos[sender_id] = receiverConvos[sender_id].filter(
                            msg => msg.id !== message_id
                        );
                    }

                    await Promise.all([
                        sender.update({ conversations: JSON.stringify(senderConvos) }),
                        receiver.update({ conversations: JSON.stringify(receiverConvos) })
                    ]);

                    // Notify both users
                    io.to(sender_id).emit('message_deleted', {
                        message_id,
                        conversation_id
                    });

                    io.to(conversation_id).emit('message_deleted', {
                        message_id,
                        conversation_id: sender_id
                    });
                }

            } catch (error) {
                console.error('Error in delete_message:', error.message);
                socket.emit('delete_error', { message: error.message });
            }
        });

        socket.on('edit_message', async (data) => {
            try {
                const { message_id, new_message, conversation_id, sender_id, is_group } = data;

                if (is_group) {
                    // Handle group message editing
                    const users = await User.findAll({
                        where: {
                            id: {
                                [Op.in]: members
                            }
                        }
                    });

                    for (const user of users) {
                        let userConvos = JSON.parse(user.conversations || '{}');
                        if (userConvos[conversation_id]?.messages) {
                            userConvos[conversation_id].messages = userConvos[conversation_id].messages.map(msg =>
                                msg.id === message_id ? { ...msg, message: new_message, edited: true } : msg
                            );
                            await user.update({ conversations: JSON.stringify(userConvos) });
                        }
                    }

                    // Notify all group members
                    io.to(conversation_id).emit('message_edited', {
                        message_id,
                        new_message,
                        conversation_id
                    });
                } else {
                    // Handle direct message editing
                    const [sender, receiver] = await Promise.all([
                        User.findOne({ where: { id: sender_id } }),
                        User.findOne({ where: { id: conversation_id } })
                    ]);

                    if (!sender || !receiver) {
                        throw new Error('Users not found');
                    }

                    let senderConvos = JSON.parse(sender.conversations || '{}');
                    let receiverConvos = JSON.parse(receiver.conversations || '{}');

                    // Update message in both conversations
                    if (senderConvos[conversation_id]) {
                        senderConvos[conversation_id] = senderConvos[conversation_id].map(msg =>
                            msg.id === message_id ? { ...msg, message: new_message, edited: true } : msg
                        );
                    }

                    if (receiverConvos[sender_id]) {
                        receiverConvos[sender_id] = receiverConvos[sender_id].map(msg =>
                            msg.id === message_id ? { ...msg, message: new_message, edited: true } : msg
                        );
                    }

                    await Promise.all([
                        sender.update({ conversations: JSON.stringify(senderConvos) }),
                        receiver.update({ conversations: JSON.stringify(receiverConvos) })
                    ]);

                    // Notify both users
                    io.to(sender_id).emit('message_edited', {
                        message_id,
                        new_message,
                        conversation_id
                    });

                    io.to(conversation_id).emit('message_edited', {
                        message_id,
                        new_message,
                        conversation_id: sender_id
                    });
                }

            } catch (error) {
                console.error('Error in edit_message:', error.message);
                socket.emit('edit_error', { message: error.message });
            }
        });

        socket.on('create_group', async (data) => {
            try {
                const { name, members } = data;

                if (!name || !members || members.length < 2) {
                    throw new Error('Invalid group data');
                }

                const groupId = `group_${Date.now()}`;

                const group = {
                    id: groupId,
                    name,
                    members,
                    created_at: new Date().toISOString(),
                    type: 'group',
                    conversations: []
                };

                // Store group info in each member's conversations
                const users = await User.findAll({
                    where: {
                        id: members
                    }
                });

                for (const user of users) {
                    try {
                        const userConversations = JSON.parse(user.conversations || '{}');

                        // Store group info and empty conversation array
                        userConversations[groupId] = {
                            ...group,  // Store group metadata
                            messages: [] // Initialize empty messages array
                        };

                        await user.update({
                            conversations: JSON.stringify(userConversations)
                        });
                    } catch (error) {
                        console.error(`Error updating user ${user.id} conversations:`, error);
                    }
                }

                // Notify all members about the new group
                members.forEach(memberId => {
                    io.to(memberId).emit('group_created', group);
                });

                // Also emit updated conversations to all members
                members.forEach(memberId => {
                    socket.to(memberId).emit('conversations_received', {
                        groupId,
                        group
                    });
                });

            } catch (error) {
                console.error('Error in create_group:', error.message);
            }
        });

        socket.on('upload_chat_files', async (data) => {
            try {
                const { files, sender_id, receiver_id, message } = data;

                // Upload each file
                const uploadedFiles = await Promise.all(
                    files.map(file => uploadChatFile(file, sender_id, receiver_id))
                );

                // Create message with attachments
                const newMessage = {
                    sender_id,
                    message: message || '',
                    timestamp: new Date().toISOString(),
                    attachments: uploadedFiles
                };

                // Update conversations for both users
                const [sender, receiver] = await Promise.all([
                    User.findOne({ where: { id: sender_id } }),
                    User.findOne({ where: { id: receiver_id } })
                ]);

                if (!sender || !receiver) {
                    throw new Error('User not found');
                }

                // Handle conversations similar to text messages
                let senderConvos = typeof sender.conversations === 'string'
                    ? JSON.parse(sender.conversations || '{}')
                    : sender.conversations || {};

                let receiverConvos = typeof receiver.conversations === 'string'
                    ? JSON.parse(receiver.conversations || '{}')
                    : receiver.conversations || {};

                // Add message to conversations
                if (!senderConvos[receiver_id]) senderConvos[receiver_id] = [];
                if (!receiverConvos[sender_id]) receiverConvos[sender_id] = [];

                senderConvos[receiver_id].push({ ...newMessage, status: 'sent' });
                receiverConvos[sender_id].push({ ...newMessage, status: 'delivered' });

                // Save updated conversations
                await Promise.all([
                    sender.update({ conversations: JSON.stringify(senderConvos) }),
                    receiver.update({ conversations: JSON.stringify(receiverConvos) })
                ]);

                // Emit to both users
                io.to(sender_id).emit('receive_message', {
                    user_id: receiver_id,
                    message: { ...newMessage, status: 'sent' }
                });

                io.to(receiver_id).emit('receive_message', {
                    user_id: sender_id,
                    message: { ...newMessage, status: 'delivered' }
                });

            } catch (error) {
                console.error('Error handling file upload:', error);
                socket.emit('upload_error', { message: error.message });
            }
        });

        // Add file deletion handler
        socket.on('delete_message_with_files', async (data) => {
            try {
                const { message_timestamp, sender_id, receiver_id, files } = data;

                // Delete files from S3
                if (files && files.length > 0) {
                    await Promise.all(files.map(async (file) => {
                        try {
                            // Extract key from file URL
                            const key = decodeURIComponent(file.url.split(".com/").pop());

                            const s3Params = {
                                Bucket: s3.config.bucketName,
                                Key: key
                            };

                            // Delete the file
                            await s3.deleteObject(s3Params).promise();

                        } catch (error) {
                            console.error('Error deleting file from S3:', error);
                            // Don't throw here, continue with other files
                        }
                    }));
                }

                // Get both users
                const [sender, receiver] = await Promise.all([
                    User.findOne({ where: { id: sender_id } }),
                    User.findOne({ where: { id: receiver_id } })
                ]);

                if (!sender || !receiver) {
                    throw new Error('User not found');
                }

                // Update conversations
                let senderConvos = typeof sender.conversations === 'string'
                    ? JSON.parse(sender.conversations || '{}')
                    : sender.conversations || {};

                let receiverConvos = typeof receiver.conversations === 'string'
                    ? JSON.parse(receiver.conversations || '{}')
                    : receiver.conversations || {};

                // Remove the message from both conversations
                if (senderConvos[receiver_id]) {
                    senderConvos[receiver_id] = senderConvos[receiver_id].filter(
                        msg => msg.timestamp !== message_timestamp
                    );
                }

                if (receiverConvos[sender_id]) {
                    receiverConvos[sender_id] = receiverConvos[sender_id].filter(
                        msg => msg.timestamp !== message_timestamp
                    );
                }

                // Save updated conversations
                await Promise.all([
                    sender.update({ conversations: JSON.stringify(senderConvos) }),
                    receiver.update({ conversations: JSON.stringify(receiverConvos) })
                ]);

                // Notify both users
                io.to(sender_id).emit('message_deleted', {
                    message_timestamp,
                    conversations: senderConvos
                });

                io.to(receiver_id).emit('message_deleted', {
                    message_timestamp,
                    conversations: receiverConvos
                });

                // Send success response
                socket.emit('delete_success', {
                    message: 'Message and files deleted successfully'
                });

            } catch (error) {
                console.error('Error deleting message with files:', error);
                socket.emit('delete_error', {
                    message: error.message || 'Failed to delete message and files'
                });
            }
        });
    });

    return io;
}

export default initializeSocket;


