module.exports = (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { name, email, phone, message } = req.body || {};
  if (!name || !message) {
    return res.status(400).json({ error: "Nombre y mensaje son obligatorios" });
  }

  const entry = {
    name,
    email: email || null,
    phone: phone || null,
    message,
    createdAt: new Date().toISOString()
  };

  // En Vercel las funciones no tienen disco persistente, así que este mensaje
  // queda visible en Project -> Logs. Para guardarlo de forma permanente,
  // conecta aquí una base de datos (Vercel Postgres/KV, Airtable, Google Sheets, etc.)
  // o envíalo por email/WhatsApp con un servicio como Resend o Twilio.
  console.log("[Bioenergía] Nuevo contacto:", JSON.stringify(entry));

  res.status(201).json({ ok: true, message: "Mensaje recibido" });
};
