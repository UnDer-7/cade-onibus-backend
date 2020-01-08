import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

class EmailUtil {
  private readonly transport: Mail;

  constructor() {
    this.transport = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  }

  public async senEmail({ para, assunto }: { para: string, assunto: string }): Promise<void> {
    const options: Mail.Options = {
      from: 'cade.tecnologia.mobile@gmail.com',
      to: para,
      subject: assunto,
      html:
        `<div>
            <h1> Hello World</h1>
        </div>
        `,
    };

    await this.transport.sendMail(options)
  }
}

export default new EmailUtil();
