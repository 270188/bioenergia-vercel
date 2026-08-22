const products = require("../../data/products.json");

module.exports = (req, res) => {
  const { category, q } = req.query;

  let result = products;
  if (category && category !== "todos") {
    result = result.filter((p) => p.category === category);
  }
  if (q) {
    const term = String(q).toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }

  res.status(200).json(result);
};
