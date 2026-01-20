const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors  = require('cors');
const api = require('./routers/index');

dotenv.config();

const app = express();

// Middleware to parse incoming JSON
app.use(bodyParser.json());
app.use(cors());

app.use('/api', api);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/dbname")
  .then(() => {})
  .catch((err) => {});

module.exports = app;
