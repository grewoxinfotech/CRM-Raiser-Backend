import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const FollowupCall = sequelize.define("followup_call", {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: () => generateId(),
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  call_start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  call_start_time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  call_end_time: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  call_duration: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },

  assigned_to: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  call_purpose: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  call_reminder: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  call_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  },
  call_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  call_status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "not_started",
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  related_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  client_id: {
    type: DataTypes.STRING,
    allowNull: false,
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

FollowupCall.beforeCreate(async (followupCall) => {
  let isUnique = false;
  let newId;
  while (!isUnique) {
    newId = generateId();
    const existingFollowupCall = await FollowupCall.findOne({
      where: { id: newId },
    });
    if (!existingFollowupCall) {
      isUnique = true;
    }
  }
  followupCall.id = newId;
});

export default FollowupCall;
