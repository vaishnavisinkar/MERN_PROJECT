import axios from "axios";
import Data from "../model/dataMode.js"

export const save = async(req,res) =>{
    try{
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const data = response.data;
        await Data.deleteMany({});
       const savedData =  await Data.insertMany(data);

        res.status(200).json(savedData);
    }catch(error){
        res.status(500).json({Error : "Internal Server Error"});

    }
}


export const getPieChart = async (req, res) => {
    const { month } = req.query;
    
    try {
      const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1;
      
      const categoryData = await Data.aggregate([
        { $match: { $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] } } },
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]);
  
      res.status(200).json(categoryData.map(cat => ({
        category: cat._id,
        count: cat.count
      })));
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  