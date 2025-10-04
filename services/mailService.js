import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587, // SendGrid standard port for STARTTLS (usually open)
  secure: false, // Use false for port 587
  auth: {
    // IMPORTANT: The username is literally 'apikey'
    user: "apikey", 
    // The password is your actual SendGrid API Key
    pass: process.env.SENDGRID_API_KEY 
  }
});