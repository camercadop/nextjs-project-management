import nodemailer from 'nodemailer'

const createTransporter = async () => {
    if (process.env.NODE_ENV === 'production') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER!,
                pass: process.env.GMAIL_PASS!,
            },
        })
    }

    const testAccount = await nodemailer.createTestAccount()
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    })
}

export const sendMail = async (
    to: string,
    subject: string,
    emailContents: string
): Promise<void> => {
    const transporter = await createTransporter()
    const info = await transporter.sendMail({
        from: `"${process.env.APP_NAME || 'App'}" <${process.env.GMAIL_USER || 'noreply@test.com'}>`,
        to,
        subject,
        html: emailContents,
    })

    if (process.env.NODE_ENV !== 'production') {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
    }
}
