import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const FollowupMetting = sequelize.define("followup_metting", {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: () => generateId(),
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  meeting_type: {
    type: DataTypes.ENUM("offline", "online"),
    allowNull: false,
  },
  meeting_status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  meeting_link: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  from_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  from_time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  to_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  to_time: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  host: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  assigned_to: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  reminder: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
  },
  repeat: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
  },
  participants_reminder: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
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

FollowupMetting.beforeCreate(async (followupMetting) => {
  let isUnique = false;
  let newId;
  while (!isUnique) {
    newId = generateId();
    const existingFollowupMetting = await FollowupMetting.findOne({
      where: { id: newId },
    });
    if (!existingFollowupMetting) {
      isUnique = true;
    }
  }
  followupMetting.id = newId;
});

export default FollowupMetting;
