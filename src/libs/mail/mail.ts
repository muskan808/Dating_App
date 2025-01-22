import nodemailer from "nodemailer";
import { env } from "../../env";
import { SentMessageInfo, Options } from "nodemailer/lib/smtp-transport";
const options = {
  host: env.mail.host,
  port: env.mail.port,
  // secure: env.mail.port === 465 ? true : false,
  service: env.mail.service,
  auth: {
    user: env.mail.username,
    pass: env.mail.password,
  },
};

let transporter: any;
export const initializeMail = () => {
  transporter = nodemailer.createTransport(options);
}

export const sendMail = (toEmail:string, subject: string, text?: string, html?: string, attachments?:any)=>{
  return new Promise(async (resolve, reject) => {
    try {
      let mailOptions = {
        from: env.mail.from_address,
        to: toEmail,
        subject: subject,
        text,
        html
      };
      
      transporter.sendMail(mailOptions, (error:any, info:any) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
      });
      resolve(true);
    } catch (error: any) {
      reject(error);
    }
  })

}
export default transporter;
