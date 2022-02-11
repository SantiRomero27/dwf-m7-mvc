import { sequelizeDB, DataTypes } from "../connection";

// Create the user model
export const User = sequelizeDB.define("user", {
    username: DataTypes.STRING,
    bio: DataTypes.STRING,
    profile_image_URL: DataTypes.STRING,
});
