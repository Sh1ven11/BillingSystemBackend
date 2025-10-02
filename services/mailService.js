import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Change to 587
  secure: false, // Must be false for port 587 (uses STARTTLS)
  requireTLS: true, // Force STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});