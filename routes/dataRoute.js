import express from "express"
import { getAllTransactions, getBarChart, getData, getPieChart, save, statistics } from '../controller/dataController.js'
const route = express.Router();

route.post("/save",save)
route.get("/getAllTransactions", getAllTransactions)
route.get("/getStatistics", statistics)
route.get("/getBarChart",getBarChart)
route.get("/getPieChart",getPieChart)
route.get("/getAllData",getData)

export default route;