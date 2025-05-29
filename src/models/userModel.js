import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import generateId from '../middlewares/generatorId.js';
import Role from './roleModel.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        defaultValue: () => generateId()
    },
    employeeId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    role_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    profilePic: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    phoneCode: {
        type: DataTypes.STRING,
        allowNull: true,    
        defaultValue: null
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        unique: true
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    zipcode: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    joiningDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    leaveDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    branch: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null
    },
    accountholder: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    accountnumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    bankname: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    ifsc: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    gstIn: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    banklocation: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    cv_path: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    links: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    e_signature: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    accounttype: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    client_id: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    client_plan_id: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    documents: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    conversations: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        get() {
            const value = this.getDataValue('conversations');
            if (!value) return {};
            try {
                return typeof value === 'string' ? JSON.parse(value) : value;
            } catch {
                return {};
            }
        },
        set(value) {
            try {
                const convValue = typeof value === 'string' ? value : JSON.stringify(value);
                this.setDataValue('conversations', convValue);
            } catch (error) {
                console.error('Error setting conversations:', error);
                this.setDataValue('conversations', '{}');
            }
        }
    },
    resetPasswordOTP: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    resetPasswordOTPExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    storage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    },
    storage_used: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
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
    },
});

// Add association with Role model
User.belongsTo(Role, {
    foreignKey: 'role_id',
    as: 'Role'
});

User.beforeCreate(async (user) => {
    let isUnique = false;
    let newId;
    while (!isUnique) {
        newId = generateId();
        const existingUser = await User.findOne({
            where: { id: newId }
        });
        if (!existingUser) {
            isUnique = true;
        }
    }
    user.id = newId;
    const Rolename = await Role.findOne({ where: { id: user.role_id } });
    if (!Rolename) {
    }
    if (Rolename.role_name === 'employee') {
        const lastUser = await User.findOne({
            order: [['employeeId', 'DESC']]
        });

        let nextNumber = 1;
        if (lastUser && lastUser.employeeId) {
            const lastNumber = parseInt(lastUser.employeeId.replace('EMP#', ''));
            nextNumber = lastNumber + 1;
        }

        user.employeeId = `EMP#${nextNumber}`;
    }

});

export default User;
