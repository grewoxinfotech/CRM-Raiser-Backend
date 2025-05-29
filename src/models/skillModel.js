import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import generateId from "../middlewares/generatorId.js";

const Skill = sequelize.define("skill", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
       defaultValue: () => generateId()
    },
    skillName: {
        type: DataTypes.STRING,
        allowNull: false
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


Skill.beforeCreate(async (skill) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingSkill = await Skill.findOne({ where: { id: newId } });
        if (!existingSkill) {
            isUnique = true;
        }
    }
    skill.id = newId;
});

export default Skill;