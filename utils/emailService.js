import nodemailer from 'nodemailer';

// Configurar el transportador de email
/*const transporter = nodemailer.createTransport({
    service: 'gmail', // O tu servicio de email
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Usa contraseña de aplicación si usas Gmail
    }
});*/

const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
    });

const sendVerificationEmail = async (email, username, verificationLink) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
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
                
                <p style="color: #666; font-size: 12px;">
                    Este enlace expirará en 24 horas.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                    Si no solicitaste este email, ignóralo.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email de verificación enviado a:', email);
    } catch (error) {
        console.error('Error al enviar email:', error);
        throw new Error('No se pudo enviar el email de verificación');
    }
};

export { sendVerificationEmail };