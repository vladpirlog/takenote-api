import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import getAuthUser from '../utils/getAuthUser.util'
import State from '../enums/State.enum'

/**
 * Function that verifies if the user is in one of the accepted states.
 * @param states an array of states that the user must be in
 */
const checkUserState = (states: State[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (states.includes(getAuthUser(res).state)) {
                return next()
            }
            return createResponse(res, 403)
        } catch (err) { return next(err) }
    }
}

export default checkUserState
