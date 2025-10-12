import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email, username, verificationLink) => {
  try {
    await resend.emails.send({
      from: 'Verificación <tu-email@tudominio.com>',
      to: email,
      subject: 'Verifica tu email para activar tu cuenta',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>¡Bienvenido, ${username}!</h2>
          <p>Gracias por registrarte. Para activar tu cuenta, por favor haz clic en el botón de abajo:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
              style="background-color: #151717; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verificar Email
            </a>
          </div>
          <p style="color: #666; font-size: 12px;">Este enlace expirará en 24 horas.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">Si no solicitaste este email, ignóralo.</p>
        </div>
      `
    });

    console.log('Email de verificación enviado a:', email);
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw new Error('No se pudo enviar el email de verificación');
  }
};