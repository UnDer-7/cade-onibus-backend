import EmailService from './email.service';
import { SentMessageInfo } from 'nodemailer';
import { emailHTL } from '../../templates/email_template';

class ForgotPasswordService extends EmailService {

  constructor() {
    super({
      emailUser: process.env.EMAIL_USER,
      emailPassword: process.env.EMAIL_PASSWORD,
    });
  }

  public async sendForgotPassword(to: string, token: string): Promise<SentMessageInfo> {
    const subject = 'Complete seu pedido de troca de senha';

    return await this.sendEmail({ html: emailHTL(token), subject, to });
  }
}

export default new ForgotPasswordService();
