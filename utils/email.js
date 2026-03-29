import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config(); 

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // false para 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

console.log("EMAIL_HOST:", process.env.EMAIL_HOST);

/* ================= VERIFY CONNECTION ================= */
transporter.verify((error) => {
  if (error) {
    console.error("❌ Error de conexión email:", error);
  } else {
    console.log("✅ Servidor de email listo");
  }
});

/* ================= SEND EMAIL ================= */
export const sendEmail = async (options) => {
  
  try {
    const mailOptions = {
      from: `"GamerStore" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📩 Email enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error enviando email:", error);
    throw error;
  }
};

/* ================= TEMPLATES ================= */
export const getWelcomeTemplate = (username) => {
  return {
    subject: "¡Bienvenido a GamerStore!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">¡Bienvenido a GamerStore!</h1>
        <p>Hola ${username},</p>
        <p>Gracias por registrarte en la mejor tienda de videojuegos.</p>
        <p>Ahora puedes:</p>
        <ul>
          <li>Explorar nuestro catálogo de juegos</li>
          <li>Crear tu lista de deseos</li>
          <li>Escribir reseñas</li>
        </ul>
        <a href="${process.env.FRONTEND_URL}" 
           style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
          Comenzar a explorar
        </a>
      </div>
    `
  };
};
