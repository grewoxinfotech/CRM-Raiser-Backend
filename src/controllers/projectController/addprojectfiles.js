import Joi from "joi";
import Project from "../../models/projectModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import uploadToS3 from "../../utils/uploadToS3.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;
            const uploadedFiles = req.files?.project_files || [];

            if (!uploadedFiles.length) {
                return responseHandler.error(res, "No files uploaded");
            }

            const project = await Project.findByPk(id);

            if (!project) {
                return responseHandler.notFound(res, "Project not found");
            }

            // Parse existing files if it's a string
            const currentFiles = typeof project.files === 'string'
                ? JSON.parse(project.files)
                : project.files || [];

            // Check for duplicate filenames
            const duplicateFiles = uploadedFiles.filter(newFile => 
                currentFiles.some(existingFile => existingFile.filename === newFile.originalname)
            );

            if (duplicateFiles.length > 0) {
                return responseHandler.error(res, `These files already exist in project: ${duplicateFiles.map(f => f.originalname).join(', ')}`);
            }

            // Upload files to S3 and create file entries
            const processedFiles = await Promise.all(
                uploadedFiles.map(async (file) => {
                    const url = await uploadToS3(file, "project-files", file.originalname, req.user?.username);
                    return {
                        filename: file.originalname,
                        url: url
                    };
                })
            );

            // Combine existing files with new files
            const updatedFiles = [...currentFiles, ...processedFiles];

            // Update the project with the new files list
            await project.update({
                files: updatedFiles,
                updated_by: req.user?.username
            });

            return responseHandler.success(res, "Project files added successfully", {
                files: updatedFiles
            });
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};