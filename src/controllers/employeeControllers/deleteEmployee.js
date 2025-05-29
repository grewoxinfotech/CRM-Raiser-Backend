import Joi from "joi";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import User from "../../models/userModel.js";
import { s3 } from "../../config/config.js";

export default {
    validator: validator({
        params: Joi.object({
            id: Joi.string().required()
        })
    }),
    handler: async (req, res) => {
        try {
            const { id } = req.params;

            const employee = await User.findByPk(id);
            if (!employee) {
                return responseHandler.notFound(res, "Employee not found");
            }

            if (employee.profilePic) {
                const key = decodeURIComponent(employee.profilePic.split(".com/").pop());
                const s3Params = {
                    Bucket: s3.config.bucketName,
                    Key: key,
                };
                // await s3.deleteObject(s3Params).promise();
            }

            if (employee.e_signatures) {
                const key = decodeURIComponent(employee.e_signatures.split(".com/").pop());
                const s3Params = {
                    Bucket: s3.config.bucketName,
                    Key: key,
                };
                // await s3.deleteObject(s3Params).promise();
            }

            await employee.destroy();
            return responseHandler.success(res, "Employee deleted successfully", employee);
        } catch (error) {
            return responseHandler.error(res, error?.message);
        }
    }
};
