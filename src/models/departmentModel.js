import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    defaultValue: () => generateId()
  },
  branch: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  client_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_by: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  updated_by: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  }
});

Department.beforeCreate(async (department) => {
  let isUnique = false;
  let newId;
  while (!isUnique) {
    newId = generateId();
    const existingDepartment = await Department.findOne({ where: { id: newId } });
    if (!existingDepartment) {
      isUnique = true;
    }
  }
  department.id = newId;
});

export default Department;