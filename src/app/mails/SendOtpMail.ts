import { env } from "../../env";
import { sendMail } from "../../libs/mail/mail";


import handlebars from 'handlebars'

export const sendOtpMailToUsers = async (job: any): Promise<void> => {
    const { subject, email, text, data, emailTemplate } = job;
    try {
        const template = handlebars.compile(emailTemplate)

        const messageBody = (template(data))
        console.log("env.mail.from_address", env.mail.from_address);

        await sendMail(
            email,
            subject,
            text,
            messageBody
        )
    } catch (error: any) {
        Promise.reject(error.message);
    }
}