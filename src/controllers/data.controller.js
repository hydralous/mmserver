const dataService = require('../services/data.service');

// POST endpoint to save the data
const saveData = async (req, res) => {
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

    await newData.save();
  } catch (err) {
  }
};

const getAllData = async (req, res) => {
    const data = await dataService.groupByHostname();
    return res.json(data);
}

module.exports = {
    saveData,
    getAllData
}