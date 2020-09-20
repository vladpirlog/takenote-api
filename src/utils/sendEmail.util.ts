import { IUserSchema } from '../models/User'
import nodemailer from 'nodemailer'
import constants from '../config/constants.config'
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
    const data = {
        reset: { token: user?.resetToken?.id, path: '/rpassword' },
        forgot: { token: user?.forgotToken?.id, path: '/fpassword' },
        confirmation: { token: user?.confirmationToken?.id, path: '/confirm' }
    }

    const completeURL = makeCompleteURL(data[type])
    const tokenMailContent = makeTokenMailContent(
        user,
        completeURL,
        type === 'confirmation'
    )
    const mailOptions = makeMailOptions(user, tokenMailContent)
    const mailTransport = makeMailTransport()

    await mailTransport.sendMail(mailOptions)
}

/**
 * Async sends an email to a given user, informing it about account deletion or recovery
 * @param user object of type IUserSchema, containing user info
 * @param type the type of notice to send
 */
const sendNotice = async (user: IUserSchema, type: 'delete' | 'recover') => {
    const mailTransport = makeMailTransport()
    const noticeMailContent = makeNoticeMailContent(user, type === 'delete')
    const mailOptions = makeMailOptions(user, noticeMailContent)

    await mailTransport.sendMail(mailOptions)
}

/**
 * Makes an object of type Mail, using the credentials in the constants.config file.
 */
const makeMailTransport = () => {
    return nodemailer.createTransport({
        host: constants.email.host,
        port: constants.email.port,
        auth: {
            user: constants.email.user,
            pass: constants.email.pass
        }
    })
}

/**
 * Makes a full URL with the data provided.
 * @param data object with token and path props
 */
const makeCompleteURL = (data: {token: string, path: string}) => {
    return url.format({
        query: {
            token: data.token
        },
        protocol: constants.protocol,
        host: constants.domain.baseDomain,
        pathname: data.path
    })
}

/**
 * Makes an object of type Mail.Options.
 * @param user object representing a user
 * @param mailContent object with subject, text and html props to be included in the email
 */
const makeMailOptions = (user: IUserSchema, mailContent: {
    subject: string,
    text: string,
    html: string
}): Mail.Options => {
    return {
        from: `"TakeNote" ${constants.email.user}`,
        to: user.email,
        subject: mailContent.subject,
        text: mailContent.text,
        html: mailContent.html
    }
}

/**
 * Makes an object with subject, text and html props, representing the content of a token email.
 * @param user object representing a user
 * @param url the URL to be embedded in the message
 * @param forConfirmatin true for an account confirmation message, false for a password reset message
 */
const makeTokenMailContent = (
    user: IUserSchema,
    url: string,
    forConfirmation: boolean
) => {
    if (forConfirmation) {
        return {
            subject: `TakeNote Account Confirmation - ${user.username}`,
            text: `Go to this URL to confirm your account: ${url}`,
            html: `<h3>Click the button below to confirm your TakeNote account</h3><button><a href=${url} target="_blank">Confirm</a></button><p>Button not working? Go to this URL: ${url}</p>`
        }
    }
    return {
        subject: `TakeNote Account Password Reset - ${user.username}`,
        text: `Go to this URL to reset your password: ${url}`,
        html: `<h3>Click the button below to reset your TakeNote password</h3><button><a href=${url} target="_blank">Reset Password</a></button><p>Button not working? Go to this URL: ${url}</p>`
    }
}

/**
 * Makes an object with subject, text and html props, representing the content of a notice email.
 * @param user object representing a user
 * @param forDeletion true for a deletion notice, false for a recovery notice
 */
const makeNoticeMailContent = (user: IUserSchema, forDeletion: boolean) => {
    if (forDeletion) {
        return {
            subject: `TakeNote Account Deletion - ${user.username}`,
            text: 'Your account is scheduled for deletion. You can abort this process in the next 7 days.',
            html: 'Your account is scheduled for deletion. You can abort this process in the next 7 days.'
        }
    }
    return {
        subject: `TakeNote Account Recovery - ${user.username}`,
        text: 'Your account has been recovered, alongside all the data associated with it.',
        html: 'Your account has been recovered, alongside all the data associated with it.'
    }
}

export default { sendToken, sendNotice }
