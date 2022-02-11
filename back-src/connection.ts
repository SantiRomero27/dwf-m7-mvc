import { Sequelize, DataTypes } from "sequelize";
import "../dev";

// Create a DB instance
const sequelizeDB = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});

export { sequelizeDB, DataTypes };
