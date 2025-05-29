import Joi from "joi";
import Role from "../../models/roleModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

export default {
    // validator: validator({
    //     body: Joi.object({
    //         role_name: Joi.string().required(),
    //         permissions: Joi.object().required() // Accept any structure for permissions
    //     })
    // }),


    // validator: validator({
    //     body: Joi.object({
    //         role_name: Joi.string().required(),
    //         permissions: Joi.object({
    //             hrm: Joi.array().items(
    //                 Joi.object({
    //                     key: Joi.string().required(),
    //                     permissions: Joi.array().items(
    //                         Joi.string().valid('view', 'create', 'update', 'delete')
    //                     ).required()
    //                 })
    //             )
    //         }).allow(null)
    //     })
    // }),




    validator: validator({
        body: Joi.object({
            role_name: Joi.string().required(),
            permissions: Joi.object().required() // Accept any structure for permissions
        })
    }),


    handler: async (req, res) => {
        try {
            const { role_name, permissions } = req.body; // Destructure permissions
            const existingRole = await Role.findOne({ where: { role_name, created_by: req.user?.username } });
            if (existingRole) {
                return responseHandler.error(res, "Role already exists");
            }

            // const client_id = req.user?.id;

            // Save the entire permissions object directly
            const role = await Role.create({
                role_name,
                permissions: permissions, // Save the entire permissions object
                created_by: req.user?.username,
                client_id: req.des?.client_id
            });
            return responseHandler.success(res, 'Role created successfully', role);
        } catch (error) {
            console.error("Error creating role:", error); // Debugging line
            return responseHandler.error(res, error.errors[0]?.message || "An error occurred");
        }
    }
}               