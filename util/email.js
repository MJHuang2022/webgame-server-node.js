const nodemailer = require("nodemailer");
const config = require("config");

const sendEmail = async (emailInfo) => {
  const transporter = nodemailer.createTransport({
    host: config.get("Email.Host"),
    port: config.get("Email.Port"),
    secure: true,
    auth: {
      user: config.get("Email.User"),
      pass: config.get("Email.Password"),
    },
  });

  const mailOptions = {
    from: `WebGame <${config.get("Email.User")}>`,
    to: emailInfo.email,
    subject: emailInfo.subject,
    text: emailInfo.message
  };

  await transporter.sendMail(mailOptions);
  return;
};

module.exports = { sendEmail };
