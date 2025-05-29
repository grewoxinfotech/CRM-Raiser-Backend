try {
    // Get client's current storage usage
    const prefix = `Raiser CRM/clients/${req.user.username}/`;
    let totalSize = 0;
    let continuationToken = null;
} catch (error) {
    console.error('Error in checkStorageLimit middleware:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
} 