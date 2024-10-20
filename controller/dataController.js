import axios from "axios";
import Data from "../model/dataMode.js";

export const save = async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = response.data;
    await Data.deleteMany({});
    const savedData = await Data.insertMany(data);

    res.status(200).json(savedData);
  } catch (error) {
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const { search = '', page = 1, perPage = 10 } = req.query;
    const parsedPrice = parseFloat(search);
    const query = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        ...(isNaN(parsedPrice) ? [] : [{ price: parsedPrice }]),
      ],
    };
    const transactions = await Data.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));
    const total = await Data.countDocuments(query);
    res.json({ transactions, total });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const statistics = async (req, res) => {
  const { month } = req.query;

  const monthNumber = parseInt(month);
  if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return res.status(400).json({ error: 'Invalid month. Please provide a value between 1 and 12.' });
  }

  try {
    const startDate = new Date(`2021-${month.padStart(2, '0')}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const totalSales = await Data.aggregate([
      { $match: { dateOfSale: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$price' },
          totalItems: { $sum: 1 },
          soldItems: { $sum: { $cond: ['$sold', 1, 0] } },
        },
      },
    ]);

    if (totalSales.length === 0) {
      return res.json({
        totalSaleAmount: 0,
        soldItems: 0,
        notSoldItems: 0,
      });
    }

    const notSoldItems = totalSales[0].totalItems - totalSales[0].soldItems;
    res.status(200).json({
      totalSaleAmount: totalSales[0].totalAmount,
      soldItems: totalSales[0].soldItems,
      notSoldItems: notSoldItems,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getBarChart = async (req, res) => {
  const { month } = req.query;

  if (!month || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).json({ error: 'Invalid month provided. Please provide a value between 1 and 12.' });
  }

  try {
    const startDate = new Date(`2021-${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const priceRanges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '101-200', min: 101, max: 200 },
      { range: '201-300', min: 201, max: 300 },
      { range: '301-400', min: 301, max: 400 },
      { range: '401-500', min: 401, max: 500 },
      { range: '501-600', min: 501, max: 600 },
      { range: '601-700', min: 601, max: 700 },
      { range: '701-800', min: 701, max: 800 },
      { range: '801-900', min: 801, max: 900 },
      { range: '901-above', min: 901, max: Infinity },
    ];

    const results = await Promise.all(
      priceRanges.map(async (range) => {
        const count = await Data.countDocuments({
          price: { $gte: range.min, $lte: range.max },
          dateOfSale: { $gte: startDate, $lte: endDate },
        });
        return { range: range.range, count };
      })
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getPieChart = async (req, res) => {
  const { month } = req.query;

  const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1;
  if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return res.status(400).json({ error: 'Invalid month provided. Please provide a value between 1 and 12.' });
  }

  try {
    const categoryData = await Data.aggregate([
      { $match: { $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.status(200).json(categoryData.map((cat) => ({
      category: cat._id,
      count: cat.count,
    })));
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getData = async (req, res) => {
  const { month } = req.query;

  if (!month || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).json({ error: 'Month is required and should be between 1 and 12.' });
  }

  try {

    const statisticsData = await statistics({ query: { month } });

    const barChartData = await getBarChart({ query: { month } });
    const pieChartData = await getPieChart({ query: { month } });


    const combinedData = {
      statistics: statisticsData,
      barChart: barChartData,
      pieChart: pieChartData
    };

    return res.status(200).json(combinedData);
  } catch (error) {
    console.error('Error fetching combined data:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
