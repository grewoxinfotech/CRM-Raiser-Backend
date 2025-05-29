import sequelize from "../config/db.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getModels = async () => {
    const modelsDir = path.join(__dirname, '../models');
    const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));

    const models = [];
    for (const file of modelFiles) {
        try {
            const model = await import(`../models/${file}`);
            // Get the actual model from default export if it exists
            const actualModel = model.default || model;

            // Check if it's a Sequelize model and has client_id field
            if (actualModel.rawAttributes && actualModel.rawAttributes.client_id) {
                models.push(actualModel);
            }
        } catch (error) {
            console.error(`Error loading model from ${file}:`, error);
        }
    }
    return models;
};

const cascadeDelete = async (req, res, next) => {
    const originalDestroy = req.destroy;

    req.destroy = async function () {
        const t = await sequelize.transaction();

        try {
            const models = await getModels();
            const clientId = req.params.id;

            // Delete all related records from models that have client_id
            await Promise.all(
                models.map(model => {
                    if (model.rawAttributes && model.rawAttributes.client_id) {
                        return model.destroy({
                            where: { client_id: clientId },
                            transaction: t
                        });
                    }
                    return Promise.resolve(); // Skip models without client_id
                })
            );

            // Call the original destroy method
            const result = await originalDestroy.call(this);

            await t.commit();
            return result;

        } catch (error) {
            await t.rollback();
            throw error;
        }
    };

    next();
};

export default cascadeDelete; 