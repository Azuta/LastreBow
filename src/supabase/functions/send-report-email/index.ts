import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Usaremos Resend para el envío de correos.
// DEBERÁS AÑADIR TU API KEY de Resend en los "Secrets" de tu función en Supabase.
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAIL = 'scared-15@hotmail.com'; // Tu correo de administración

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { reportedUsername, reporterUsername, reporterContactEmail, reportType, reason, commentContent } = await req.json();

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Reporte <onboarding@resend.dev>', // DEBES configurar un dominio verificado en Resend
        to: ADMIN_EMAIL,
        subject: `Nuevo Reporte de Comentario: [${reportType}]`,
        html: `
          <h1>Nuevo Reporte Recibido</h1>
          <p><strong>Reportado por:</strong> ${reporterUsername}</p>
          <p><strong>Usuario Reportado:</strong> ${reportedUsername}</p>
          <p><strong>Email de Contacto del Reportante:</strong> ${reporterContactEmail || 'No proporcionado'}</p>
          <hr>
          <h2>Detalles del Reporte</h2>
          <p><strong>Tipo de Reporte:</strong> ${reportType}</p>
          <p><strong>Razón:</strong></p>
          <p>${reason}</p>
          <p><strong>Contenido del Comentario Reportado:</strong></p>
          <blockquote style="border-left: 2px solid #ccc; padding-left: 1em; margin-left: 1em; color: #666;">
            ${commentContent}
          </blockquote>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error al enviar el correo: ${JSON.stringify(errorData)}`);
    }

    return new Response(JSON.stringify({ message: 'Reporte enviado con éxito.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});