import { sequelizeDB } from "./connection";
import "./models/models-index";

sequelizeDB.sync({ force: true }).then(() => {
    console.log("\nBase de datos sincronizada!\n");
});
