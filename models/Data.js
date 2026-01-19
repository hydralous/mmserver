const mongoose = require('mongoose');

const computerInfoSchema = new mongoose.Schema({
  hostname: { type: String, required: true },
  username: { type: String, required: true },
  ip: { type: String, required: true },
  mac: { type: String, required: true },
});

const dataSchema = new mongoose.Schema({
  hash: { type: String, required: true },
  computerInfo: { type: [computerInfoSchema], required: true },
  path: { type: String, required: true },
  data: { type: String, required: true },
});

const DataModel = mongoose.model('Data', dataSchema);

module.exports = DataModel;
