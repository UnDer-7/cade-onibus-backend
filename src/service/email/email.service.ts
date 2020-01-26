import Mail from 'nodemailer/lib/mailer';
import { createTransport, SentMessageInfo } from 'nodemailer';

export default abstract class EmailService {
  private readonly transport: Mail;
  private readonly emailUser: string | undefined;

  protected constructor({
                          emailUser,
                          emailPassword,
                          service = 'gmail',
  }: emailServiceOptions) {
    this.transport = createTransport({
      service,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
    this.emailUser = emailUser;
  }

  protected async sendEmail({ to, subject, html}: emailOptions): Promise<SentMessageInfo> {
    const options: Mail.Options = {
      from: this.emailUser,
      to,
      subject,
      html,
      priority: 'high',
    };

    return await this.transport.sendMail(options)
  }
}

interface emailOptions {
  to: string,
  subject: string,
  html: string
}

interface emailServiceOptions {
  emailUser: string | undefined;
  emailPassword: string | undefined;
  service?: string | undefined;
}
