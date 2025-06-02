const nodemailer = require("nodemailer")

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent:", info.messageId)
    return info
  } catch (error) {
    console.error("Email sending failed:", error)
    throw error
  }
}

module.exports = { sendEmail }
