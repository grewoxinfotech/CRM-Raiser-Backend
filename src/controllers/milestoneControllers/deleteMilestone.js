import Activity from "../../models/activityModel.js";
import Milestone from "../../models/milestoneModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Joi from "joi";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const milestone = await Milestone.findByPk(id);
            if (!milestone) {
                return responseHandler.error(res, "Milestone not found");
            }
            await Activity.create({
                related_id: milestone.related_id,
                activity_from: "milestone",
                activity_id: milestone.id,
                action: "deleted",
                performed_by: req.user?.username,
                activity_message: `Milestone ${milestone.milestone_title} deleted successfully`
            });
            await milestone.destroy();
            return responseHandler.success(res, "Milestone deleted successfully", milestone);
        } catch (error) {

            return responseHandler.error(res, error?.message);
        }
    }
}