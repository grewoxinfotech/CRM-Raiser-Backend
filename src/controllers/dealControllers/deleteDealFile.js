import Joi from "joi";
import Deal from "../../models/dealModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import { s3 } from "../../config/config.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            filename: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const { filename } = req.body;

            const deal = await Deal.findByPk(id);

            if (!deal) {
                return responseHandler.notFound(res, "Deal not found");
            }

            // Parse existing files if it's a string
            const currentFiles = typeof deal.files === 'string'
                ? JSON.parse(deal.files)
                : deal.files || [];

            // Find the file to delete
            const fileToDelete = currentFiles.find(file => file.filename === filename);

            if (!fileToDelete) {
                return responseHandler.notFound(res, "File not found in deal");
            }

            // Delete from S3
            if (fileToDelete.url) {
                // Extract key using the working approach from updateTask.js
                const key = decodeURIComponent(fileToDelete.url.split(".com/").pop());

                const s3Params = {
                    Bucket: s3.config.bucketName,
                    Key: key,
                };

                try {
                    await s3.deleteObject(s3Params).promise();
                } catch (error) {
                    console.error('Error deleting file from S3:', error);
                    return responseHandler.error(res, "Error deleting file from storage");
                }
            }

            // Remove file from deal's files array
            const updatedFiles = currentFiles.filter(file => file.filename !== filename);

            // Update the deal with the new files list
            await deal.update({
                files: updatedFiles,
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Deal file deleted successfully", {
                files: updatedFiles
            });
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}; 