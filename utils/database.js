const { MongoClient } = require('mongodb');
let _db;

const mongodbConnect = (callback) => {
  MongoClient.connect(
    'mongodb+srv://victor:12345@book-app.xzawr.mongodb.net/shop?retryWrites=true&w=majority',
    { useUnifiedTopology: true }
  )
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
