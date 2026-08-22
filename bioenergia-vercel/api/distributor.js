// Datos de la distribuidora. Puedes moverlos a variables de entorno en Vercel
// (Project Settings -> Environment Variables) si prefieres no dejarlos fijos en el código.
const DISTRIBUTOR = {
  name: "Nancy León Arambulo",
  role: "Distribuidora Independiente Nipponflex",
  phone: process.env.DISTRIBUTOR_PHONE || "+14143345519",
  whatsapp: process.env.DISTRIBUTOR_WHATSAPP || "14143345519"
};

module.exports = (req, res) => {
  res.status(200).json(DISTRIBUTOR);
};
