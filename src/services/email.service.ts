import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email-queue') private emailQueue: Queue) { }

  async sendWelcomeEmail(email: string, userId: number) {
    console.log(`📨 Queuing email to ${email}`);
    await this.emailQueue.add('sendWelcomeEmail', { email, userId });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    await this.emailQueue.add('sendPasswordResetEmail', { email, token });
  }
}
