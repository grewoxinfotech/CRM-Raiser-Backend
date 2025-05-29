import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Email = sequelize.define("Email", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: () => generateId(),
  },
  from: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  html: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "inbox", // Changed from null to "inbox" to fix invalid default value error
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isStarred: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isImportant: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isTrash: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  scheduleDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: null,
  },
  scheduleTime: {
    type: DataTypes.TIME,
    allowNull: true,
    defaultValue: null,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "pending", // Changed from null to "pending" since it's non-nullable
  },
  client_id: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  created_by: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  updated_by: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
});

Email.beforeCreate(async (email) => {
  let isUnique = false;
  let newId;
  while (!isUnique) {
    newId = generateId();
    const existingEmail = await Email.findOne({ where: { id: newId } });
    if (!existingEmail) {
      isUnique = true;
    }
  }
  email.id = newId;
});

Email.beforeSave(async (email) => {
  if (email.changed("isTrash") && email.isTrash) {
    email.type = "trash";
  }

  if (email.changed("isTrash") && !email.isTrash && email.type === "trash") {
    email.type = email.previous("type") || "inbox";
  }
});

export default Email;
