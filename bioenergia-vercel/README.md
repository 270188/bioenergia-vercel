# Bioenergía — Versión Vercel

Catálogo Nipponflex E-Energy, listo para desplegar en **Vercel**.

**Distribuidora Independiente:** Nancy León Arambulo
**WhatsApp / Teléfono:** +1 414-334-5519

## Estructura (formato Vercel)

```
bioenergia-vercel/
├── api/                     # Backend = funciones serverless (cada archivo = 1 endpoint)
│   ├── products/
│   │   ├── index.js         # GET /api/products  (?category=, ?q=)
│   │   └── [code].js        # GET /api/products/:code
│   ├── categories.js        # GET /api/categories
│   ├── distributor.js       # GET /api/distributor
│   ├── contact.js           # POST /api/contact
│   └── orders.js            # POST /api/orders
├── data/
│   └── products.json        # Catálogo (37 productos, editable)
├── index.html                # Frontend (mismo diseño de la versión anterior)
├── css/styles.css
├── js/app.js                 # Ya apunta a /api/... (no requiere cambios)
├── vercel.json
└── package.json
```

## Cómo desplegar en Vercel

**Opción A — Desde la web de Vercel (sin terminal):**
1. Sube esta carpeta a un repositorio de GitHub (crea uno nuevo y arrastra estos archivos).
2. Entra a https://vercel.com → "Add New Project" → conecta ese repositorio.
3. Vercel detecta automáticamente que es un proyecto "Other" (estático + funciones serverless). No necesitas configurar build command ni output directory: déjalo en blanco/por defecto.
4. Click en "Deploy". En 1-2 minutos tendrás tu URL (ej. `bioenergia.vercel.app`).

**Opción B — Con Vercel CLI:**
```bash
npm i -g vercel
cd bioenergia-vercel
vercel        # sigue las instrucciones (login, nombre de proyecto)
vercel --prod # para publicar en producción
```

## Dominio propio

En el proyecto dentro de Vercel: **Settings → Domains → Add** y agrega tu dominio (ej. `bioenergia.com`). Vercel te da los registros DNS que debes configurar donde compraste el dominio.

## ⚠️ Importante: contacto y pedidos no se guardan en disco

Las funciones de Vercel son *serverless*: no tienen un disco persistente como un servidor tradicional. Por eso:
- `POST /api/contact` y `POST /api/orders` funcionan y responden bien, pero los datos solo quedan visibles temporalmente en **Vercel → tu proyecto → pestaña "Logs"** (mientras la función esté activa), no en un archivo permanente.
- El **pedido en sí ya se envía completo por WhatsApp** desde el navegador del cliente (eso no depende del servidor y siempre funciona).
- Si más adelante quieres un historial permanente de mensajes/pedidos, la forma más simple de agregarlo sin mucha complejidad:
  - **Vercel Postgres** o **Vercel KV** (Storage → Create Database, dentro del mismo proyecto de Vercel), o
  - Un formulario conectado a **Google Sheets** vía Apps Script, o
  - Un servicio de email transaccional como **Resend**, para que cada mensaje/pedido te llegue directo a tu correo.
  Cuando quieras, puedo ayudarte a conectar cualquiera de estas opciones.

## Editar el catálogo

Modifica `data/products.json` (nombre, precio, descripción, categoría, specs) y vuelve a desplegar (`vercel --prod`, o simplemente haz push a GitHub si lo conectaste ahí — Vercel redepliega solo).

## Variables de entorno (opcional)

Si prefieres no dejar tu teléfono fijo en el código, en Vercel ve a **Settings → Environment Variables** y agrega:
- `DISTRIBUTOR_PHONE` = `+14143345519`
- `DISTRIBUTOR_WHATSAPP` = `14143345519`

(`api/distributor.js` ya está preparado para leerlas si existen).
