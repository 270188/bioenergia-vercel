const products = require("../../data/products.json");

module.exports = (req, res) => {
  const { code } = req.query;
  const product = products.find((p) => p.code === code);
  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.status(200).json(product);
};
