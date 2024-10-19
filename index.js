import express from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import route from "./routes/dataRoute.js"
import cors from "cors"

const app = express();
app.use(cors());
app.use(bodyParser.json());
dotenv.config();
const PORT = process.env.PORT || 5000
const MONGOURL = process.env.MONGO_URL;

mongoose.connect(MONGOURL).then(()=>{
    console.log("Database is connect succesfully")
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`)
    })

}).catch((error)=> console.log(error));


app.use("/api/product",route);

