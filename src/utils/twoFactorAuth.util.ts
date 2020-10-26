import speakeasy from 'speakeasy'
import qrcode from 'qrcode'
import { IUserSchema } from '../types/User'
import getUnixTime from './getUnixTime.util'
import constants from '../config/constants.config'
import { nanoid } from 'nanoid'
import { promisify } from 'util'

const generateSecretAndImage = async (email: IUserSchema['email']) => {
    const secret = speakeasy.generateSecret({ name: `TakeNote (${email})` })
    if (!secret.otpauth_url) throw new Error('Couldn\'t create the 2fa secret.')

    const image = await promisify(qrcode.toDataURL)(secret.otpauth_url) as string
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
            active: true, id: nanoid(constants.authentication.backupCodeLength)
        })
    }
    return arr
}

export default { generateSecretAndImage, verifyCode, getNextCheckTime, generateBackupCodes }
