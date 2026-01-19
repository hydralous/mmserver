const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const DataModel = require('./models/Data'); // Adjust the path to the model
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware to parse incoming JSON
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/dbname")
  .then(() => {})
  .catch((err) => {});

// POST endpoint to save the data
app.post('/api/data', async (req, res) => {
  const { hash, computerInfo, path, data } = req.body;

  if (!hash || !computerInfo || !data || !path) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingData = await DataModel.findOne({ hash });

    if (existingData) {
      return;
    }
    const newData = new DataModel({
      hash,
      computerInfo,
      path,
      data,
    });

    const savedData = await newData.save();
  } catch (err) {
  }
});

module.exports = app;
