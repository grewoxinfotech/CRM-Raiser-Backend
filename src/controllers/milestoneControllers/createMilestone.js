import Activity from "../../models/activityModel.js";
import Milestone from "../../models/milestoneModel.js";
import Project from "../../models/projectModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Joi from "joi";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().optional().allow('', null)
        }),
        body: Joi.object({
            milestone_title: Joi.string().optional().allow('', null),
            milestone_status: Joi.string().optional().allow('', null),
            milestone_cost: Joi.number().optional().allow('', null),
            add_cost_to_project_budget: Joi.string()
                .valid('yes', 'no')
                .optional(),
            milestone_summary: Joi.string().optional().allow('', null),
            milestone_start_date: Joi.date().optional().allow('', null),
            milestone_end_date: Joi.date().optional().allow('', null)
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                milestone_title,
                milestone_status,
                milestone_cost,
                add_cost_to_project_budget,
                milestone_summary,
                milestone_start_date,
                milestone_end_date
            } = req.body;

            const existingMilestone = await Milestone.findOne({
                where: {
                    milestone_title,
                    related_id: id
                }
            });

            if (existingMilestone) {
                return responseHandler.error(res, "Milestone already exists");
            }

            const milestone = await Milestone.create({
                related_id: id,
                milestone_title,
                milestone_status,
                milestone_cost,
                add_cost_to_project_budget,
                milestone_summary,
                milestone_start_date,
                milestone_end_date,
                client_id: req.des?.client_id,
                created_by: req.user?.username,
            });

            if (add_cost_to_project_budget === "yes" && milestone_cost) {
                const project = await Project.findByPk(id);
                if (project) {
                    const currentBudget = parseFloat(project.budget) || 0;
                    const newBudget = currentBudget + parseFloat(milestone_cost);

                    await project.update({
                        budget: newBudget,
                        updated_by: req.user?.username
                    });

                    await Activity.create({
                        related_id: id,
                        activity_from: "project",
                        activity_id: project.id,
                        action: "budget_updated",
                        performed_by: req.user?.username,
                        activity_message: `Project budget updated from ${currentBudget} to ${newBudget} due to milestone ${milestone_title}`
                    });
                }
            }

            await Activity.create({
                related_id: id,
                activity_from: "milestone",
                activity_id: milestone.id,
                action: "created",
                performed_by: req.user?.username,
                activity_message: `Milestone ${milestone_title} created successfully${add_cost_to_project_budget === "yes" ? ' and added to project budget' : ''}`
            });

            return responseHandler.success(res, "Milestone created successfully", milestone);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}