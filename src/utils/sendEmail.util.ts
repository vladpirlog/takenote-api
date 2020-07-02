import { IUserSchema } from '../models/User'
import nodemailer from 'nodemailer'
import constants from '../config/constants'
import url from 'url'

/**
 * Async sends an email to a given user, informing it about a certain type of token
 * @param user object of type IUserSchema, containing user info
 * @param type the type of token in the email
 */
const sendToken = async (
    user: IUserSchema,
    type: 'reset' | 'forgot' | 'confirmation'
) => {
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

    if (type === 'reset') {
        const completeURL = url.format({
            query: {
                token: user.resetToken.token
            },
            protocol: 'http', // TODO: change to https
            host: constants.domain.baseDomain,
            pathname: '/rpassword'
        })

        await transporter.sendMail({
            from: `"TakeNote" ${constants.email.user}`,
            to: user.email,
            subject: `TakeNote Account Password Reset - ${user.username}`,
            text: `Go to this URL to reset your password: ${completeURL}`,
            html: `<h3>Click the button below to reset your TakeNote password</h3><button><a href=${completeURL} target="_blank">Reset Password</a></button><p>Button not working? Go to this URL: ${completeURL}</p>`
        })
    } else if (type === 'forgot') {
        const completeURL = url.format({
            query: {
                token: user.forgotToken.token
            },
            protocol: 'http', // TODO: change to https
            host: constants.domain.baseDomain,
            pathname: '/fpassword'
        })

        await transporter.sendMail({
            from: `"TakeNote" ${constants.email.user}`,
            to: user.email,
            subject: `TakeNote Account Password Reset - ${user.username}`,
            text: `Go to this URL to reset your password: ${completeURL}`,
            html: `<h3>Click the button below to reset your TakeNote password</h3><button><a href=${completeURL} target="_blank">Reset Password</a></button><p>Button not working? Go to this URL: ${completeURL}</p>`
        })
    } else {
        const completeURL = url.format({
            query: {
                token: user.confirmationToken.token
            },
            protocol: 'http', // TODO: change to https
            host: constants.domain.baseDomain,
            pathname: '/confirm'
        })
        await transporter.sendMail({
            from: `"TakeNote" ${constants.email.user}`,
            to: user.email,
            subject: `TakeNote Account Confirmation - ${user.username}`,
            text: `Go to this URL to confirm your account: ${completeURL}`,
            html: `<h3>Click the button below to confirm your TakeNote account</h3><button><a href=${completeURL} target="_blank">Confirm</a></button><p>Button not working? Go to this URL: ${completeURL}</p>`
            // TODO: create better template
        })
    }
}

const sendDeletingNotice = async (user: IUserSchema) => {
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

    await transporter.sendMail({
        from: `"TakeNote" ${constants.email.user}`,
        to: user.email,
        subject: `TakeNote Account Account Deletion - ${user.username}`,
        text: 'Your account is scheduled for deletion. You can abort this process in the next 7 days.',
        html: 'Your account is scheduled for deletion. You can abort this process in the next 7 days.'
    })
}

const sendRecoverNotice = async (user: IUserSchema) => {
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

    await transporter.sendMail({
        from: `"TakeNote" ${constants.email.user}`,
        to: user.email,
        subject: `TakeNote Account Account Recovery - ${user.username}`,
        text: 'Your account has been recovered, alongside all the data associated with it.',
        html: 'Your account has been recovered, alongside all the data associated with it.'
    })
}

export default { sendToken, sendDeletingNotice, sendRecoverNotice }
