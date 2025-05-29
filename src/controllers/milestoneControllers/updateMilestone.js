import { Op } from "sequelize";
import Activity from "../../models/activityModel.js";
import Milestone from "../../models/milestoneModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Joi from "joi";
import Project from "../../models/projectModel.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            milestone_title: Joi.string().required(),
            milestone_status: Joi.string().required(),
            milestone_cost: Joi.number().required(),
            add_cost_to_project_budget: Joi.string()
                .valid('yes', 'no')
                .optional(), 
            milestone_summary: Joi.string().required(),
            milestone_start_date: Joi.date().required(),
            milestone_end_date: Joi.date().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            let {
                milestone_title,
                milestone_status,
                milestone_cost,
                add_cost_to_project_budget,
                milestone_summary,
                milestone_start_date,
                milestone_end_date
            } = req.body;

            // Convert add_cost_to_project_budget to boolean
            add_cost_to_project_budget = add_cost_to_project_budget === true ||
                add_cost_to_project_budget === 'true' ||
                add_cost_to_project_budget === '1';

            const milestone = await Milestone.findByPk(id);
            if (!milestone) {
                return responseHandler.error(res, "Milestone not found");
            }
            const existingMilestone = await Milestone.findOne({ where: { milestone_title, milestone_status, milestone_cost, add_cost_to_project_budget, milestone_summary, milestone_start_date, milestone_end_date, related_id: milestone.related_id, id: { [Op.not]: id } } });
            if (existingMilestone) {
                return responseHandler.error(res, "Milestone already exists");
            }
            await milestone.update({ milestone_title, milestone_status, milestone_cost, add_cost_to_project_budget, milestone_summary, milestone_start_date, milestone_end_date, updated_by: req.user?.username });
            await Activity.create({
                related_id: milestone.related_id,
                activity_from: "milestone",
                activity_id: milestone.id,
                action: "updated",
                performed_by: req.user?.username,
                activity_message: `Milestone ${milestone.milestone_title} updated successfully`
            });

            if (milestone.add_cost_to_project_budget) {
                const project = await Project.findByPk(milestone.related_id);
                if (project) {
                    const oldCost = parseFloat(milestone.milestone_cost) || 0;
                    const newCost = parseFloat(milestone_cost) || 0;
                    const newBudget = await updateProjectBudget(project, oldCost, newCost, req.user?.username);

                    await Activity.create({
                        related_id: milestone.related_id,
                        activity_from: "project",
                        activity_id: project.id,
                        action: "budget_updated",
                        performed_by: req.user?.username,
                        activity_message: `Project budget updated to ${newBudget} due to milestone ${milestone_title} update`
                    });
                }
            }

            return responseHandler.success(res, "Milestone updated successfully", milestone);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}

const updateProjectBudget = async (project, oldCost, newCost, username) => {
    const currentBudget = parseFloat(project.budget) || 0;
    const newBudget = currentBudget - parseFloat(oldCost) + parseFloat(newCost);

    await project.update({
        budget: newBudget,
        updated_by: username
    });

    return newBudget;
};