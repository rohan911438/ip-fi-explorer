import nodemailer from 'nodemailer';
import { logger } from './logger.js';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

// Send email function
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const message = {
      from: `IP-Fi Platform <${process.env.SMTP_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.html || options.message
    };

    const info = await transporter.sendMail(message);
    logger.info(`Email sent successfully to ${options.email}`, { messageId: info.messageId });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};

// Email templates
export const emailTemplates = {
  welcome: (username) => ({
    subject: 'Welcome to IP-Fi Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B5CF6;">Welcome to IP-Fi, ${username}!</h1>
        <p>Thank you for joining the future of intellectual property investment.</p>
        <p>You can now:</p>
        <ul>
          <li>Discover and invest in premium IP assets</li>
          <li>Earn royalties from your investments</li>
          <li>Build a diversified IP portfolio</li>
        </ul>
        <a href="${process.env.FRONTEND_URL}/dashboard" 
           style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Get Started
        </a>
        <p>Best regards,<br>The IP-Fi Team</p>
      </div>
    `
  }),
  
  investmentConfirmation: (investment) => ({
    subject: 'Investment Confirmation - IP-Fi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Investment Successful!</h1>
        <p>Your investment has been confirmed.</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Investment Details:</h3>
          <p><strong>Asset:</strong> ${investment.assetTitle}</p>
          <p><strong>Shares:</strong> ${investment.shares}</p>
          <p><strong>Total Investment:</strong> $${investment.totalAmount}</p>
          <p><strong>Transaction ID:</strong> ${investment.transactionId}</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/dashboard" 
           style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Portfolio
        </a>
      </div>
    `
  }),
  
  royaltyPayment: (payment) => ({
    subject: 'Royalty Payment Received - IP-Fi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #F59E0B;">Royalty Payment Received!</h1>
        <p>You've received a royalty payment from your IP investments.</p>
        <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Payment Details:</h3>
          <p><strong>Amount:</strong> $${payment.amount}</p>
          <p><strong>From Asset:</strong> ${payment.assetTitle}</p>
          <p><strong>Payment Date:</strong> ${payment.date}</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/dashboard" 
           style="background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Earnings
        </a>
      </div>
    `
  })
};