import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import * as nodemailer from 'nodemailer';

@Processor('email-queue')
export class EmailProcessor {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });
  }

  @Process('sendWelcomeEmail')
  async handleWelcomeEmail(job: Job<{ email: string; userId: number }>) {
    const { email, userId } = job.data;

    await this.transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to My App!',
      text: `Hello User #${userId}, welcome aboard 🚀 to talha ki app`,
    });

    console.log(`✅ Welcome email sent to ${email}`);
  }

  @Process('sendPasswordResetEmail')
  async handlePasswordResetEmail(job: Job<{ email: string; token: string }>) {
    const { email, token } = job.data;

    await this.transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      text: `Click here to reset your password: https://myapp.com/reset?token=${token}`,
    });

    console.log(`✅ Password reset email sent to ${email}`);
  }
}
