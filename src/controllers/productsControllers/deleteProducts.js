import Joi from "joi";
import Product from "../../models/productModel.js";
import responseHandler from "../../utils/responseHandler.js";
import validator from "../../utils/validator.js";
import Activity from "../../models/activityModel.js";
import { s3 } from "../../config/config.js";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);
      if (!product) {
        return responseHandler.error(res, "Product not found");
      }
      let image = product.image;
      if (image) {
        const key = decodeURIComponent(image.split(".com/").pop());
        const s3Params = {
          Bucket: s3.config.bucketName,
          Key: key,
        };
        await s3.deleteObject(s3Params).promise();
      }
      await product.destroy();
      await Activity.create({
        related_id: product.related_id,
        activity_from: "product",
        activity_id: product.id,
        action: "deleted",
        performed_by: req.user?.username,
        activity_message: `Product ${product.name} deleted successfully`,
      });
      return responseHandler.success(
        res,
        "Product deleted successfully",
        product
      );
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
