//Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

//Route Imports
const userRoutes = require("./routes/user.js");
const productRoutes = require("./routes/product.js");
const cartRoutes = require("./routes/cart.js");
const orderRoutes = require("./routes/order.js");

dotenv.config();

//Server setup
const app = express();

//DataBase setup
mongoose.connect(process.env.MONGODB_STRING);

let db = mongoose.connection;
db.on(
  "error",
  console.error.bind(console, "Error in the database connection!")
);
db.once("open", () => console.log("Now connected to MongoDB Atlas."));

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//Backend Main Routes
app.use("/b4/cart", cartRoutes);
app.use("/b4/users", userRoutes);
app.use("/b4/products", productRoutes);
app.use("/b4/orders", orderRoutes);

//Server Gateway Respomse
if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`API is now running at port ${process.env.PORT || 3000}`);
  });
}

module.exports = { app, mongoose };
