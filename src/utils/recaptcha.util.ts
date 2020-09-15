import axios from 'axios'
import constants from '../config/constants.config'
import querystring from 'querystring'

const verify = async (code: string, ip?: string): Promise<boolean> => {
    try {
        const body = querystring.stringify({
            secret: constants.authentication.recaptcha.secretKey,
            response: code,
            remoteip: ip || ''
        })
        const res = await axios.post(constants.authentication.recaptcha.verificationEndpoint, body)
        return res.data.success
    } catch (err) { return false }
}

export default { verify }
