import dotenv from "dotenv";
import ConnectDB from "./db/connection.js";
import express from "express";
import {app} from "./app.js"

dotenv.config({
  path: "./env",
});

ConnectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
/*
import express from "express";
const app = express();


(async () => {
  try {
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`);
      
      app.on("error", (error) => {
          console.log("ERROR : ", error);
          throw error;
      })

      app.listen(process.env.PORT, () => {
          console.log(`App is listening on Port ,${process.env.PORT}`);
      })
  }
  catch (error) {
      console.error("ERROR: ", error);
      throw error;
  }
})();
*/
