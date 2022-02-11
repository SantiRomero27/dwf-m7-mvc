import { User } from "../models/user";
import { cloudinary } from "../lib/cloudinary";

// Save User controller
async function saveUser(userData) {
    // Get the user data
    const { username, userbio, imageURL } = userData;

    // Create the user if it not exists
    const [newUser, createdFlag] = await User.findOrCreate({
        where: { username },
        defaults: {
            username,
            bio: userbio,
            profile_image_URL: "empty URL",
        },
    });

    // If the user was already created, return just the flag
    if (!createdFlag) {
        return { createdFlag };
    }

    // Save the picture to the cloud
    const profilePicSave = await cloudinary.uploader.upload(imageURL, {
        resource_type: "image",
        discard_original_filename: true,
    });

    // Update the user profile pic
    await User.update(
        { profile_image_URL: profilePicSave.secure_url },
        {
            where: { id: newUser.getDataValue("id") },
        }
    );

    const newUserUpdated = {
        ...newUser.get(),
        profile_image_URL: profilePicSave.secure_url,
    };

    return {
        newUserUpdated,
        createdFlag,
    };
}

// Get user controller
async function getUserById(userId) {
    const foundUser = await User.findByPk(userId);

    return foundUser;
}

export { saveUser, getUserById };
