import { app } from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDb.db.js"; 

dotenv.config(
    {
        path : './.env'
    }
)

connectDB()
.then(
    () => {
        console.log('DATABASE CONNECTION SUCCESSFULL');
        app.listen(process.env.PORT, () => {
            console.log(`LISTENING ON PORT ${process.env.PORT}`);
        })
    }
).catch(
    () => {
        console.log('CONNECTION FAILED');
    }
)