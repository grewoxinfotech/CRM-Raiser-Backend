import Joi from "joi";
import Setting from "../../models/settingModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";
import uploadToS3 from "../../utils/uploadToS3.js";
import { s3 } from "../../config/config.js";

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      termsandconditions: Joi.string().optional(),
      companyName: Joi.string().required(),
      title: Joi.string().required(),
      merchant_name: Joi.string().optional(),
      merchant_upi_id: Joi.string().optional(),
      bank_name: Joi.string().optional(),
      account_holder_name: Joi.string().optional(),
      account_number: Joi.string().optional(),
      ifsc_code: Joi.string().optional(),
      bank_branch: Joi.string().optional(),
    }),
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        termsandconditions,
        companyName,
        title,
        merchant_name,
        merchant_upi_id,
        bank_name,
        account_holder_name,
        account_number,
        ifsc_code,
        bank_branch,
      } = req.body;

      const setting = await Setting.findByPk(id);
      if (!setting) {
        return responseHandler.error(res, "Setting not found");
      }

      const logo = req.files?.companylogo?.[0];
      const favicon = req.files?.favicon?.[0];

      let logoUrl = setting.companylogo;
      let faviconUrl = setting.favicon;

      if (logo) {
        // Delete old logo from S3
        if (setting.companylogo) {
          const logoKey = decodeURIComponent(
            setting.companylogo.split(".com/").pop()
          );
          const logoParams = {
            Bucket: s3.config.bucketName,
            Key: logoKey,
          };
          await s3.deleteObject(logoParams).promise();
        }
        // Upload new logo
        logoUrl = await uploadToS3(
          logo,
          "client",
          "company-logos",
          req.user?.username
        );
      }

      if (favicon) {
        // Delete old favicon from S3
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
        // Upload new favicon
        faviconUrl = await uploadToS3(
          favicon,
          "client",
          "company-logos",
          req.user?.username
        );
      }

      await setting.update({
        companylogo: logoUrl,
        favicon: faviconUrl,
        companyName,
        title,
        termsandconditions,
        merchant_name,
        merchant_upi_id,
        bank_name,
        account_holder_name,
        account_number,
        ifsc_code,
        bank_branch,
        updated_by: req.user?.username,
      });

      return responseHandler.success(
        res,
        "Setting updated successfully",
        setting
      );
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  },
};
