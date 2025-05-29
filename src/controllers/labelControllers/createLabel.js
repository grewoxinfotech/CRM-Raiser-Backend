import Joi from "joi";
import Tag from "../../models/labelModel.js";
import validator from "../../utils/validator.js";
import responseHandler from "../../utils/responseHandler.js";

// Define all default labels by type
export const defaultLabels = {
  // Source labels - Professional colors
  source: [
    { name: "Email", color: "#2C3E50" },
    { name: "Phone", color: "#34495E" },
    { name: "Website", color: "#16A085" },
    { name: "Social Media", color: "#27AE60" },
    { name: "Referral", color: "#2980B9" },
    { name: "Direct", color: "#8E44AD" },
    { name: "Advertisement", color: "#2C3E50" },
    { name: "Event", color: "#16A085" },
    { name: "Partner", color: "#27AE60" },
    { name: "Other", color: "#34495E" }
  ],

  // Status labels
  status: [
    { name: "New", color: "#1ABC9C" },
    { name: "In Progress", color: "#3498DB" },
    { name: "Pending", color: "#9B59B6" },
    { name: "Completed", color: "#2ECC71" },
    { name: "On Hold", color: "#34495E" },
    { name: "Cancelled", color: "#E74C3C" },
    { name: "Delayed", color: "#95A5A6" },
    { name: "Review", color: "#7F8C8D" },
    { name: "Approved", color: "#27AE60" },
    { name: "Rejected", color: "#C0392B" }
  ],

  // Tag labels
  tag: [
    { name: "High Priority", color: "#C0392B" },
    { name: "Medium Priority", color: "#D35400" },
    { name: "Low Priority", color: "#F39C12" },
    { name: "Urgent", color: "#E74C3C" },
    { name: "Important", color: "#8E44AD" },
    { name: "Follow-up", color: "#16A085" },
    { name: "VIP", color: "#2980B9" },
    { name: "Special", color: "#8E44AD" },
    { name: "Sensitive", color: "#C0392B" },
    { name: "Regular", color: "#27AE60" }
  ],

  // Contract Type labels
  contract_type: [
    { name: "Fixed Price", color: "#2980B9" },
    { name: "Time & Material", color: "#16A085" },
    { name: "Retainer", color: "#D35400" },
    { name: "Project Based", color: "#27AE60" },
    { name: "Milestone Based", color: "#8E44AD" }
  ],

  // Category labels
  category: [
    { name: "Software Development", color: "#2C3E50" },
    { name: "Consulting", color: "#34495E" },
    { name: "Design", color: "#16A085" },
    { name: "Marketing", color: "#27AE60" },
    { name: "Training", color: "#2980B9" },
    { name: "E-commerce", color: "#8E44AD" },
    { name: "Healthcare", color: "#1ABC9C" },
    { name: "Real Estate", color: "#3498DB" },
    { name: "Financial Services", color: "#2ECC71" },
    { name: "Manufacturing", color: "#9B59B6" }
  ],

  // Followup type labels - Updated with new types
  followup: [
    { name: "Phone Call", color: "#1890ff" },
    { name: "Client Meeting", color: "#52c41a" },
    { name: "WhatsApp", color: "#25D366" },
    { name: "Email", color: "#EA4335" },
    { name: "Telegram", color: "#0088cc" },
    { name: "Video Call", color: "#7c3aed" },
  ],
};

// Function to seed default labels by type
export const seedDefaultLabels = async (related_id, client_id, username, type) => {
  try {
    const labelsToCreate = defaultLabels[type] || [];
    const createdLabels = await Promise.all(
      labelsToCreate.map(async (label) => {
        try {
          return await Tag.create({
            name: label.name,
            color: label.color,
            lableType: type,
            related_id,
            client_id,
            created_by: username
          });
        } catch (error) {
          console.error('Error creating label:', error);
          return null;
        }
      })
    );

    return createdLabels.filter(l => l !== null);
  } catch (error) {
    throw error;
  }
};

export default {
  validator: validator({
    params: Joi.object({
      id: Joi.string().required()
    }),
    body: Joi.object({
      name: Joi.string().required(),
      color: Joi.string().optional(),
      lableType: Joi.string().required()
    })
  }),
  handler: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, color, lableType } = req.body;

      // Check if label already exists
      const existingLabel = await Tag.findOne({
        where: { name, lableType }
      });

      if (existingLabel) {
        return responseHandler.error(res, "Label already exists");
      }

      const label = await Tag.create({
        name,
        color,
        lableType,
        related_id: id,
        client_id: req.des?.client_id,
        created_by: req.user?.username
      });

      return responseHandler.success(res, "Label created successfully", label);
    } catch (error) {
      return responseHandler.error(res, error?.message);
    }
  }
};
