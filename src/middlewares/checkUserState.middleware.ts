import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import State from '../enums/State.enum'

/**
 * Function that verifies if the user is in one of the accepted states.
 * @param states an array of states that the user must be in
 */
const checkUserState = (states: State[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.session.userState) throw new Error('User not logged in.')
            if (states.includes(req.session.userState)) {
                return next()
            }
            return createResponse(res, 403)
        } catch (err) { return next(err) }
    }
}

export default checkUserState
