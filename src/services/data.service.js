const mongoose = require('mongoose');
const DataModel = require('../models/Data'); // Adjust this to your actual model file path

async function groupByHostname() {
  const result = await DataModel.aggregate([
    // Group by hostname
    {
      $group: {
        _id: "$computerInfo.hostname", // Group by hostname
        ip: { $first: "$computerInfo.ip" }, // Take the first IP value (since we're grouping by hostname)
        mac: { $first: "$computerInfo.mac" }, // Take the first MAC value (same reason)
        files: { 
          $push: { // Collect all file data in an array
            path: "$path",
            data: "$data"
          }
        }
      }
    },
    // Project the final format of the grouped data
    {
      $project: {
        hostname: "$_id", // Rename _id to hostname
        ip: 1,
        mac: 1,
        files: 1,
        _id: 0 // Remove the default _id field from the final output
      }
    }
  ]);

  return result;
}

module.exports = {
    groupByHostname
}