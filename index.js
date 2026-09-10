const functions = require('@google-cloud/functions-framework');
const nodemailer = require('nodemailer');

// Transporter configurado para Zoho Mail con tus credenciales
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "sergiotoscano.art@gmail.com",
    pass: process.env.SMTP_PASS || "FtmxS34D3YMz",
  },
});

functions.http('solvraEmailService', async (req, res) => {
  // Manejo de CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Identificamos el endpoint a través de la URL o del body
  const action = req.path || req.body.action;

  try {
    // 1. ENDPOINT: /request-implementation
    if (action.includes('request-implementation') || req.body.appName) {
      const { name, company, email, appName, usersCount, need, comments } = req.body;

      await transporter.sendMail({
        from: '"Solvra Apps" <sergiot@solvra.com.ar>',
        to: "sergiot@solvra.com.ar",
        subject: `🚀 Nueva Solicitud de Implementación: ${appName} - ${company}`,
        html: `
          <h2>Solicitud de Implementación</h2>
          <p><strong>Aplicación:</strong> ${appName}</p>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Empresa:</strong> ${company}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Cantidad de Usuarios:</strong> ${usersCount}</p>
          <p><strong>Necesidad:</strong> ${need}</p>
          <p><strong>Comentarios:</strong> ${comments || 'Sin comentarios'}</p>
        `,
      });

      return res.json({ ok: true, message: "Correo enviado con éxito" });
    }

    // 2. ENDPOINT: /suggestions
    if (action.includes('suggestions') || req.body.idea) {
      const { name, email, company, category, idea } = req.body;

      if (!name || !email || !idea) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      await transporter.sendMail({
        from: '"Solvra Co-Creation" <sergiot@solvra.com.ar>',
        to: "sergiot@solvra.com.ar",
        subject: `💡 Nueva Idea de Co-Creación: ${category} - ${name}`,
        html: `
          <h2>Nueva Propuesta de Aplicación (Co-Creation)</h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Empresa:</strong> ${company || 'No especificada'}</p>
          <p><strong>Categoría:</strong> ${category}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />
          <p><strong>Descripción de la Idea:</strong></p>
          <p style="background-color: #f9f9f9; padding: 12px; border-radius: 8px;">${idea}</p>
        `,
      });

      return res.json({ ok: true, message: "Sugerencia enviada correctamente" });
    }

    return res.status(400).json({ error: "Acción o payload no reconocido" });

  } catch (error) {
    console.error("Error al procesar el correo:", error);
    return res.status(500).json({ error: "Error interno al enviar el correo" });
  }
});