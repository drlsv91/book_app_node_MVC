const { getDb } = require('../utils/database');
const mongodb = require('mongodb');
function getId(id) {
  return id ? new mongodb.ObjectId(id) : null;
}

class Product {
  constructor(title, price, imageUrl, description, id, userId) {
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
    this._id = getId(id);
    this.userId = userId;
  }

  save() {
    let db = getDb();
    if (this._id) {
      return db
        .collection('products')
        .updateOne({ _id: getId(this._id) }, { $set: this });
    } else {
      return db.collection('products').insertOne(this);
    }
  }

  static fetchAll() {
    let db = getDb();
    return db.collection('products').find().toArray();
  }
  static findById(id) {
    let db = getDb();
    return db.collection('products').findOne({ _id: getId(id) });
  }
  static deleteById(id) {
    let db = getDb();
    return db.collection('products').deleteOne({ _id: getId(id) });
  }
}

module.exports = Product;
