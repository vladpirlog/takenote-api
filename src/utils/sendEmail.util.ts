import { IUserSchema } from '../models/User'
import nodemailer from 'nodemailer'
import constants from '../config/constants'
import url from 'url'
import Mail from 'nodemailer/lib/mailer'

/**
 * Async sends an email to a given user, informing it about a certain type of token
 * @param user object of type IUserSchema, containing user info
 * @param type the type of token in the email
 */
const sendToken = async (
    user: IUserSchema,
    type: 'reset' | 'forgot' | 'confirmation'
) => {
    let info: {token: string, pathname: string}
    if (type === 'reset') info = { token: user.resetToken.token, pathname: '/rpassword' }
    else if (type === 'forgot') info = { token: user.forgotToken.token, pathname: '/fpassword' }
    else info = { token: user.confirmationToken.token, pathname: '/confirm' }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        auth: {
            user: constants.email.user,
            pass: constants.email.pass
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    const completeURL = url.format({
        query: {
            token: info.token
        },
        protocol: 'http', // TODO: change to https
        host: constants.domain.baseDomain,
        pathname: info.pathname
    })

    const emailSubject: string = type === 'confirmation'
        ? `TakeNote Account Confirmation - ${user.username}`
        : `TakeNote Account Password Reset - ${user.username}`

    const emailText: string = type === 'confirmation'
        ? `Go to this URL to confirm your account: ${completeURL}`
        : `Go to this URL to reset your password: ${completeURL}`

    const emailHTML : string = type === 'confirmation'
        ? `<h3>Click the button below to confirm your TakeNote account</h3><button><a href=${completeURL} target="_blank">Confirm</a></button><p>Button not working? Go to this URL: ${completeURL}</p>`
        : `<h3>Click the button below to reset your TakeNote password</h3><button><a href=${completeURL} target="_blank">Reset Password</a></button><p>Button not working? Go to this URL: ${completeURL}</p>`

    await transporter.sendMail({
        from: `"TakeNote" ${constants.email.user}`,
        to: user.email,
        subject: emailSubject,
        text: emailText,
        html: emailHTML
    })
}

/**
 * Async sends an email to a given user, informing it about account deletion or recovery
 * @param user object of type IUserSchema, containing user info
 * @param type the type of notice to send
 */
const sendNotice = async (user: IUserSchema, type: 'delete' | 'recover') => {
    const mailOptions: Mail.Options = {
        from: `"TakeNote" ${constants.email.user}`,
        to: user.email,
        subject: type === 'delete'
            ? `TakeNote Account Account Deletion - ${user.username}`
            : `TakeNote Account Account Recovery - ${user.username}`,
        text: type === 'delete'
            ? 'Your account is scheduled for deletion. You can abort this process in the next 7 days.'
            : 'Your account has been recovered, alongside all the data associated with it.',
        html: type === 'delete'
            ? 'Your account is scheduled for deletion. You can abort this process in the next 7 days.'
            : 'Your account has been recovered, alongside all the data associated with it.'
    }
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        auth: {
            user: constants.email.user,
            pass: constants.email.pass
        },
        tls: {
            rejectUnauthorized: false
        }
    })
    await transporter.sendMail(mailOptions)
}

export default { sendToken, sendNotice }
