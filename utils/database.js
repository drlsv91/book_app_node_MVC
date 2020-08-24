const { MongoClient } = require('mongodb');
const config = require('../config/default.json');
let _db;

const mongodbConnect = (callback) => {
  MongoClient.connect(config.mongodbURI, { useUnifiedTopology: true })
    .then((client) => {
      _db = client.db();
      callback();
      console.log('Connected');
    })
    .catch((err) => console.log(err));
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw Error('No database is set');
};
module.exports = {
  mongodbConnect,
  getDb,
};
