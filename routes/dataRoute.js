import express from "express"
import { getPieChart, save } from '../controller/dataController.js'
const route = express.Router();

route.post("/save",save)
route.get("/getPieChart",getPieChart)

export default route;