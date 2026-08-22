module.exports = (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { customerName, items, total } = req.body || {};
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "El pedido no tiene productos" });
  }

  const entry = {
    id: Date.now(),
    customerName: customerName || "No especificado",
    items,
    total,
    createdAt: new Date().toISOString()
  };

  // Mismo caveat que en contact.js: esto solo queda en los logs de Vercel.
  // El pedido real ya se manda por WhatsApp desde el frontend; este endpoint
  // es un respaldo/registro adicional, y es el lugar ideal para conectar
  // una base de datos si más adelante quieres un historial permanente.
  console.log("[Bioenergía] Nuevo pedido:", JSON.stringify(entry));

  res.status(201).json({ ok: true, orderId: entry.id });
};
