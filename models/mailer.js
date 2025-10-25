import nodemailer from 'nodemailer';
import {envGet} from '../config.js'


var transporter = nodemailer.createTransport({
  host: envGet('MAILER_HOST'),
  port: envGet('MAILER_PORT'),
  auth: {
    user: envGet('MAILER_USERNAME'),
    pass: envGet('MAILER_PASSWORD')
  }
});

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000);
}



const sendEmail = async (mail) => {
    const otp = generateSixDigitCode().toString().padStart(6, '0');

    // const mailOptions = {
    //     from: 'info@demomailtrap.co',
    //     to: mail,
    //     subject: 'Email Verification from Safeclick',
    //     text: `Your OTP is: ${otp}`,
    //     html: `
    //     <div style="max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; font-family: Arial, sans-serif; background-color: #f9f9f9; text-align: center;">
    //         <h2 style="color: #333;">Email Verification</h2>
    //         <p style="font-size: 16px; color: #555;">Use the following OTP to complete your verification:</p>
    //         <div style="font-size: 32px; font-weight: bold; color: #2c3e50; margin: 20px 0; letter-spacing: 4px;">
    //             ${otp}
    //         </div>
    //         <p style="font-size: 14px; color: #888;">This code will expire in 10 minutes.</p>
    //     </div>
    //     `
    // };

    // try {
    //     const info = await transporter.sendMail(mailOptions);
    //     console.log('Email sent successfully:', info.messageId);
    //     return otp;
    // } catch (error) {
    //     console.error('Failed to send email:', error);
    //     return null;
    // }
    return otp
};


export {sendEmail}