import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER!,
        pass: process.env.GMAIL_PASS!,
    }
})

/**
 * Sends an email using the configured Gmail transporter.
 *
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} emailContents - HTML content of the email.
 * 
 */
export const sendMail = async (
    to: string,
    subject: string,
    emailContents: string
): Promise<void> => {
    const info = await transporter.sendMail({
        from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html: emailContents
    })
}