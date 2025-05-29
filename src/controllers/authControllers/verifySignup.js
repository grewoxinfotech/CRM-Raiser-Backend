import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import jwt from "jsonwebtoken";
import { EMAIL_FROM, JWT_SECRET } from "../../config/config.js";
import { sendEmail } from "../../utils/emailService.js";
import { getWelcomeEmailTemplate } from "../../utils/emailTemplates.js";
import Role from "../../models/roleModel.js";
import User from "../../models/userModel.js";
import ClientSubscription from "../../models/clientSubscriptionModel.js";
import { seedDefaultLabels } from "../labelControllers/createLabel.js";
import { seedDefaultPipelines } from "../pipelineControllers/createPipeline.js";
import { seedDefaultStages } from "../stageControllers/createStage.js";
import SubscriptionPlan from "../../models/subscriptionPlanModel.js";

const DEFAULT_LABEL_TYPES = [
    'source', 'status', 'tag', 'contract_type', 'category', 'followup', 'label'
];

export default {
    validator: validator({
        body: Joi.object({
            otp: Joi.string().length(6).required()
        })
    }),

    handler: async (req, res) => {
        try {
            const { otp } = req.body;
            const user = req.user;

            const { subscription } = req;

            if (user.type !== 'signup_verification' && user.type !== 'register_verification') {
                return responseHandler.unauthorized(res, "Invalid verification token");
            }

            if (String(user.verificationOTP) !== String(otp)) {
                return responseHandler.unauthorized(res, "Invalid OTP");
            }

            if (Date.now() > user.verificationOTPExpiry) {
                return responseHandler.unauthorized(res, "OTP has expired");
            }

            const role = await Role.findOne({ where: { id: user.role_id } });
            if (!role) {
                return responseHandler.error(res, "Role not found");
            }

            // Create verified user
            const newUser = role.role_name === 'employee' ? await User.create({
                username: user.username,
                email: user.email,
                password: user.password,
                accounttype: user.accounttype,
                role_id: role.id,
                isEmailVerified: true,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                phoneCode: user.phoneCode,
                currency: user.currency,
                address: user.address,
                gender: user.gender,
                joiningDate: user.joiningDate,
                leaveDate: user.leaveDate,
                branch: user.branch,
                department: user.department,
                designation: user.designation,
                salary: user.salary,
                accountholder: user.accountholder,
                accountnumber: user.accountnumber,
                bankname: user.bankname,
                ifsc: user.ifsc,
                banklocation: user.banklocation,
                profilePic: user.profilePic,
                e_signatures: user.e_signatures,
                documents: user.documents,
                links: user.links,
                client_id: user.client_id,
                created_by: user.created_by
            }) : await User.create({
                username: user.username,
                email: user.email,
                password: user.password,
                accounttype: user.accounttype,
                role_id: role.id,
                client_id: user.client_id,
                client_plan_id: user.client_plan_id,
                isEmailVerified: true,
                created_by: user.created_by
            });

            // If type is register_verification, create subscription with new user's ID
            if (user.type === 'register_verification') {
                const plan = await SubscriptionPlan.findByPk(user.client_plan_id);
                if (!plan) {
                    throw new Error("Subscription plan not found");
                }

                const startDateTime = new Date();
                const endDateTime = new Date(startDateTime);
                
                // Extract the duration value and unit
                const durationValue = parseInt(plan.duration);
                const durationUnit = plan.duration.includes('Month') || plan.duration.includes('month') ? 'months' : 'days';
                
                // Add the appropriate duration
                if (durationUnit === 'months') {
                    endDateTime.setMonth(endDateTime.getMonth() + durationValue);
                } else {
                    endDateTime.setDate(endDateTime.getDate() + durationValue);
                }
                
                endDateTime.setHours(23, 59, 59, 999);

                const newSubscription = await ClientSubscription.create({
                    client_id: newUser.id,
                    plan_id: user.client_plan_id,
                    start_time: startDateTime,
                    end_time: endDateTime,
                    start_date: startDateTime,
                    end_date: endDateTime,
                    status: 'trial',
                    current_users_count: 0,
                    current_clients_count: 0,
                    current_storage_used: 0,
                    payment_status: 'unpaid',
                    created_by: 'self-register'
                });

                // Update user with new subscription ID
                await User.update(
                    { client_plan_id: newSubscription.id },
                    { where: { id: newUser.id } }
                );

                // Create default data for the new client
                try {
                    // Create default labels
                    const labelResults = await Promise.all(DEFAULT_LABEL_TYPES.map(async type => {
                        try {
                            const labels = await seedDefaultLabels(
                                newUser.id,    // related_id
                                newUser.id,    // client_id
                                'system',      // created_by
                                type          // label type
                            );
                            console.log(`Created ${labels.length} labels for type ${type}`);
                            return { type, count: labels.length, success: true };
                        } catch (error) {
                            console.error(`Error seeding ${type} labels:`, error);
                            return { type, count: 0, success: false, error: error.message };
                        }
                    }));

                    // Create default pipelines
                    const pipelines = await seedDefaultPipelines(
                        newUser.id,    // client_id
                        'system'       // created_by
                    );
                    console.log(`Created ${pipelines.length} default pipelines`);

                    // Create default stages for each pipeline
                    const stageResults = await Promise.all(pipelines.map(async pipeline => {
                        try {
                            const stages = await seedDefaultStages(
                                pipeline.id,    // pipeline_id
                                newUser.id,     // client_id
                                'system'        // created_by
                            );
                            console.log(`Created ${stages.length} stages for pipeline ${pipeline.pipeline_name}`);
                            return {
                                pipeline_name: pipeline.pipeline_name,
                                stages_count: stages.length,
                                success: true
                            };
                        } catch (error) {
                            console.error(`Error seeding stages for pipeline ${pipeline.pipeline_name}:`, error);
                            return {
                                pipeline_name: pipeline.pipeline_name,
                                stages_count: 0,
                                success: false,
                                error: error.message
                            };
                        }
                    }));

                } catch (error) {
                    console.error('Error in client data seeding:', error);
                    // Continue with user creation even if seeding fails
                }

                // Return early for register_verification
                return responseHandler.success(res, "Registration completed successfully", {
                    success: true,
                    user: newUser
                });
            }

            // If this is a client, seed their data
            if (role.role_name === 'client') {
                // Keep only the subscription increment logic here
                if (subscription) {
                    const clientSubscription = await ClientSubscription.findByPk(subscription.id);
                    if (clientSubscription) {
                        if (role.role_name === 'sub-client') {
                            await clientSubscription.increment('current_clients_count');
                        } else if (!['super-admin', 'client'].includes(role.role_name)) {
                            await clientSubscription.increment('current_users_count');
                        }
                    }
                }
            }

            // After creating the new user, generate a login token
            const token = jwt.sign(
                {
                    id: newUser.id,
                    role: role.role_name,
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Send welcome email
            const welcomeTemplate = getWelcomeEmailTemplate(newUser.username);
            await sendEmail(newUser.email, 'Welcome to CRM!', welcomeTemplate);

            return responseHandler.success(res, "Registration completed successfully", {
                success: true,
                token,
                user: newUser
            });
        } catch (error) {
            console.error('Verification error:', error);
            return responseHandler.internalServerError(res, error);
        }
    }
};
