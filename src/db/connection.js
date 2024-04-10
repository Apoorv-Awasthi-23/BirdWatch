import { DB_Name } from "../constants.js";
import mongoose from "mongoose"

const ConnectDB = async() => {
    try {
        const connectInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
        
        console.log(`\n MongoDB Connected  --  DB_Host : ${connectInstance.connection.host}`);
    }
    catch (error)
    {
        console.log("MongoDB Connection Error: ", error);
        process.exit(1);
    }
}

export default ConnectDB;