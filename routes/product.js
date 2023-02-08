var express = require("express");
var router = express.Router();

const { product } = require("../models");

/*
Add products (allowed: 'staff', 'admin')

name: String,
thumbnailUrl: String,
description: String,
price: Number,
stock: Number,
*/
router.post("/", async (req, res) => {
  const userRole = req.userRole;
  if (
    !userRole ||
    (!userRole.includes("staff") && !userRole.includes("admin"))
  ) {
    return res.sendStatus(403);
  }

  const name = req.body.name;
  const thumbnailUrl = req.body.thumbnailUrl;
  const description = req.body.description;
  const price = req.body.price;
  const stock = req.body.stock;
  if (!name || !thumbnailUrl || !description || !price || !stock) {
    return res.sendStatus(400);
  }

  let newProduct;
  try {
    newProduct = await product.create({
      name: name,
      thumbnailUrl: thumbnailUrl,
      description: description,
      price: price,
      stock: stock,
      dateAdded: new Date().toJSON(),
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }

  return res.status(200).json(newProduct);
});

/*
Get all products

query value: searchVal, skip, limit, sort
supported sort type: 'dateAdded_asc', 'dateAdded_desc' , 'name_asc', 'name_desc'
*/
router.get("/", async (req, res) => {
  const searchVal = req.query.searchVal ? req.query.searchVal : "";
  const skip = req.query.skip ? req.query.skip : null;
  const limit = req.query.limit ? req.query.limit : null;
  const sort = req.query.sort
    ? { [req.query.sort.split("_")[0]]: req.query.sort.split("_")[1] }
    : { dateAdded: "desc" };

  let products;
  try {
    products = await product
      .find({ name: new RegExp(`${searchVal}`, "i") })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }

  return res.status(200).json(products);
});

module.exports = router;
