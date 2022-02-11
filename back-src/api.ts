import { saveUser, getUserById } from "./controllers/user-controller";
import * as express from "express";
import * as path from "path";
import * as cors from "cors";
import * as jwt from "jsonwebtoken";
import "../dev";

// Auth Token middleware
async function authTokenMiddleware(req, res, next) {
    // Get the authorization header
    const { authorization } = req.headers;

    // Check if the header exists
    if (!authorization) {
        res.status(400).json({ error: "Falta el header de autorización" });

        return;
    }

    // Get the token
    const authToken = authorization.split(" ")[1];

    // Decrypt the token
    try {
        const userData = jwt.verify(authToken, process.env.SECRET_WEB_TOKEN);

        // Assign the data to the request
        req._user = userData;

        // Go to the next middleware
        next();
    } catch (err) {
        res.status(401).json({ error: "Token inválido" });
    }
}

// Aux variable
const staticPath = path.resolve(__dirname, "../../dist");

// Server config
const app = express();
const PORT = process.env.PORT;
app.use(express.json({ limit: "25mb" }));
app.use(cors());

// Use static files in order to serve the app
app.use(express.static(staticPath));

// Test endpoint
app.get("/test", (req, res) => {
    res.json({
        port: "El puerto del servidor es: " + PORT,
    });
});

// Save the profile
app.post("/profile", async (req, res) => {
    // Check the body
    if (!req.body.username || !req.body.userbio) {
        res.status(400).json({
            message: "Parámetros sin enviar!",
        });

        return;
    }

    // Create the user
    let createdRes: any = await saveUser(req.body);

    // If the user was created, assign the token to the response
    if (createdRes.createdFlag) {
        const webToken = jwt.sign(
            { userId: createdRes.newUserUpdated.id },
            process.env.SECRET_WEB_TOKEN
        );

        createdRes = { ...createdRes, webToken };
    }

    res.status(200).json(createdRes);
});

// Get the user profile
app.get("/profile", authTokenMiddleware, async (req, res) => {
    // Get the userId
    const userId = req._user.userId;

    // Search the user
    const foundUser = await getUserById(userId);

    res.status(200).json({ foundUser });
});

// Serve the index file for parcel
app.get("*", (req, res) => {
    res.sendFile(staticPath + "/index.html");
});

// Listen to requests
app.listen(PORT, () => {
    console.log("> App corriendo en el puerto " + PORT);
});
