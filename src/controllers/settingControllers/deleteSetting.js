import Joi from "joi";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import Setting from "../../models/settingModel.js";
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

      const setting = await Setting.findByPk(id);

      if (!setting) {
        return responseHandler.notFound(res, "Setting not found");
      }

      // Delete company logo from S3
      if (setting.companylogo) {
        const logoKey = decodeURIComponent(
          setting.companylogo.split(".com/").pop()
        );
        const logoParams = {
          Bucket: s3.config.bucketName,
          Key: logoKey,
        };
        // await s3.deleteObject(logoParams).promise();
      }

      // Delete favicon from S3
      if (setting.favicon) {
        const faviconKey = decodeURIComponent(
          setting.favicon.split(".com/").pop()
        );
        const faviconParams = {
          Bucket: s3.config.bucketName,
          Key: faviconKey,
        };
        await s3.deleteObject(faviconParams).promise();
      }

      await setting.destroy();

      return responseHandler.success(
        res,
        "Setting deleted successfully",
        setting
      );
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
