import Joi from "joi";
import Lead from "../../models/leadModel.js";
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

            const lead = await Lead.findByPk(id);

            if (!lead) {
                return responseHandler.notFound(res, "Lead not found");
            }

            // Parse existing files if it's a string
            const currentFiles = typeof lead.files === 'string'
                ? JSON.parse(lead.files)
                : lead.files || [];

            // Find the file to delete
            const fileToDelete = currentFiles.find(file => file.filename === filename);

            if (!fileToDelete) {
                return responseHandler.notFound(res, "File not found in lead");
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

            // Remove file from lead's files array
            const updatedFiles = currentFiles.filter(file => file.filename !== filename);

            // Update the lead with the new files list
            await lead.update({
                files: updatedFiles,
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Lead file deleted successfully", {
                files: updatedFiles
            });
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
}; 