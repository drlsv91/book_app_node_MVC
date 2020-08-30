const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  password: { type: String, required: true },
  email: { type: String, required: true },
  resetToken: String,
  resetTokenExpiration: String,
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  let updateCartItems = [...this.cart.items];
  // does product exist in my cart

  let productIndx = this.cart.items.findIndex(
    (cp) => cp.productId.toString() === product._id.toString()
  );
  if (productIndx >= 0) {
    let cartProd = this.cart.items[productIndx];
    cartProd.quantity = cartProd.quantity + 1;
    updateCartItems[productIndx] = cartProd;
  } else {
    updateCartItems.push({ productId: product._id, quantity: 1 });
  }

  let updatedCart = {
    items: updateCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (id) {
  const updatedCartItems = this.cart.items.filter(
    (ci) => ci.productId.toString() !== id.toString()
  );
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};
// const { getDb } = require('../utils/database');
// const mongodb = require('mongodb');
// const formatId = (id) => (id ? new mongodb.ObjectId(id) : null);
// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }

//   save() {
//     let db = getDb();
//     return db.collection('users').insertOne(this);
//   }

//   addToCart(product) {
//     const db = getDb();
//     let updateCartItems = [...this.cart.items];
//     // does product exist in my cart

//     let productIndx = this.cart.items.findIndex(
//       (cp) => cp.productId.toString() === product._id.toString()
//     );
//     if (productIndx >= 0) {
//       let cartProd = this.cart.items[productIndx];
//       cartProd.quantity = cartProd.quantity + 1;
//       updateCartItems[productIndx] = cartProd;
//     } else {
//       updateCartItems.push({ productId: formatId(product._id), quantity: 1 });
//     }

//     let updatedCart = {
//       items: updateCartItems,
//     };
//     return db
//       .collection('users')
//       .updateOne({ _id: formatId(this._id) }, { $set: { cart: updatedCart } });
//   }

//   getCart() {
//     let db = getDb();
//     const productIds = this.cart.items.map((prod) => prod.productId);
//     return db
//       .collection('products')
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then((products) => {
//         return products.map((product) => {
//           return {
//             ...product,
//             quantity: this.cart.items.find(
//               (p) => p.productId.toString() === product._id.toString()
//             ).quantity,
//           };
//         });
//       });
//   }

//   deleteItemFromCart(productId) {
//     const db = getDb();
//     let updatedCartItems = this.cart.items.filter(
//       (i) => i.productId.toString() !== productId.toString()
//     );
//     return db
//       .collection('users')
//       .updateOne(
//         { _id: formatId(this._id) },
//         { $set: { cart: { items: updatedCartItems } } }
//       );
//   }
//   addOrder() {
//     const db = getDb();
//     this.getCart()
//       .then((products) => {
//         const orders = {
//           items: products,
//           user: {
//             _id: formatId(this._id),
//             name: this.name,
//           },
//         };
//         return db.collection('orders').insertOne(orders);
//       })
//       .then((res) => {
//         this.cart.items = [];
//         return db
//           .collection('users')
//           .updateOne(
//             { _id: formatId(this._id) },
//             { $set: { cart: { items: [] } } }
//           );
//       })
//       .catch((err) => console.log(err));
//   }
//   getOrders() {
//     const db = getDb();
//     return db
//       .collection('orders')
//       .find({ 'user._id': formatId(this._id) })
//       .toArray();
//   }
//   static findById(id) {
//     let db = getDb();
//     return db.collection('users').findOne({ _id: formatId(id) });
//   }
// }

module.exports = mongoose.model('User', userSchema);
