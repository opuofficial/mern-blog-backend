const mongoose = require('mongoose');

const connectToDB = async () => {
  const dbURI = process.env.MONGODB_URI;

  try {
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
  } catch (err) {
    console.log(`MongoDB connection error: ${err}`);
    throw err;
  }
};

module.exports = connectToDB;
