import speakeasy from 'speakeasy'
import qrcode from 'qrcode'
import { IUserSchema } from '../models/User'
import getUnixTime from './getUnixTime.util'
import constants from '../config/constants.config'
import { nanoid } from 'nanoid'

const generateSecretAndImage = async (email: IUserSchema['email']) => {
    const secret = speakeasy.generateSecret({ name: `TakeNote (${email})` })
    if (!secret.otpauth_url) throw new Error('Couldn\'t create the 2fa secret.')

    const p: Promise<string> = new Promise((resolve, reject) => {
        qrcode.toDataURL(secret.otpauth_url || '', (err, dataUrl) => {
            if (err) return reject(err)
            return resolve(dataUrl)
        })
    })
    const image = await p
    return { secret: secret.base32, image }
}

const verifyCode = (code: string, secret: string) => {
    return speakeasy.totp.verify({
        secret, encoding: 'base32', token: code
    })
}

const getNextCheckTime = (
    remember?: string
): IUserSchema['twoFactorAuth']['nextCheck'] => {
    if (remember === 'true') {
        return getUnixTime() + constants.authentication.tfaRememberDuration
    }
    return 0
}

const generateBackupCodes = (): IUserSchema['twoFactorAuth']['backupCodes'] => {
    const arr: IUserSchema['twoFactorAuth']['backupCodes'] = []
    for (let _ = 0; _ < constants.authentication.numberOfBackupCodes; ++_) {
        arr.push({
            active: true, _id: nanoid(constants.authentication.backupCodeLength)
        })
    }
    return arr
}

export default { generateSecretAndImage, verifyCode, getNextCheckTime, generateBackupCodes }
