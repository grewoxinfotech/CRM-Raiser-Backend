import createLabel, { seedDefaultLabels } from "./createLabel.js";
import getAllLabel from "./getAllLabel.js";
import updateLabel from "./updateLabel.js";
import deleteLabel from "./deleteLabel.js";
import responseHandler from "../../utils/responseHandler.js";

// Create a function to seed labels for a client
const seedLabelsForClient = async (req, res) => {
    try {
        const clientId = req.params.clientId;
        const labelTypes = ['source', 'status', 'tag', 'contract_type', 'category', 'followup'];

        const results = await Promise.all(labelTypes.map(async (type) => {
            const labels = await seedDefaultLabels(
                clientId,    // related_id
                clientId,    // client_id
                'system',    // created_by
                type        // label type
            );
            return { type, count: labels.length };
        }));

        return responseHandler.success(res, "Labels seeded successfully", results);
    } catch (error) {
        return responseHandler.error(res, error?.message);
    }
};
export {
    createLabel,
    getAllLabel,
    updateLabel,
    deleteLabel,
    seedLabelsForClient
};
