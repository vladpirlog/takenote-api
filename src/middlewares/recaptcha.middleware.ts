import { NextFunction, Request, Response } from 'express'
import constants from '../config/constants.config'
import createResponse from '../utils/createResponse.util'
import recaptchaUtil from '../utils/recaptcha.util'

const recaptcha = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (constants.nodeEnv !== 'production') return next()

        const { 'g-recaptcha-response': recaptchaCode } = req.body
        if (!recaptchaCode) return createResponse(res, 422, 'ReCAPTCHA code missing from body.')

        const ok = await recaptchaUtil.verify(recaptchaCode, req.ip)

        return ok ? next() : createResponse(res, 401)
    } catch (err) { return next(err) }
}

export default recaptcha
