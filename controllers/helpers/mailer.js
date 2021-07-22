import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

async function sendEmail(email, code) {
  try {
    const smtpEndpoint = process.env.SMTP_ENDPOINT;
    const port = process.env.SMTP_PORT;
    const senderAddress = process.env.SENDER_EMAIL;
    let toAddress = email;
    const smtpUsername = process.env.SI_EMAIL;
    const smtpPassword = process.env.SI_APIKEY;
    const subject = "MERN SHOP - Verify Your Email";

    const bodyHTML = `
        <!DOCTYPE!>
        <html>
         <body>
          <p>Your authentication code is: </p> <b>${code}</b>
         </body>
        </html>`;

    let transporter = nodemailer.createTransport({
      service: "SendinBlue",
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
    });

    let mailOptions = {
      to: toAddress,
      from: senderAddress,
      subject: subject,
      html: bodyHTML,
    };

    let info = await transporter.sendMail(mailOptions);
    return { error: false };
  } catch (error) {
    console.error(`send-email-error: ${error}`);
    return {
      error: true,
      message: "Cannot send the email",
    };
  }
}

export default sendEmail;
