const products = require("../data/products.json");

module.exports = (req, res) => {
  const categories = [...new Set(products.map((p) => p.category))];
  res.status(200).json(categories);
};
