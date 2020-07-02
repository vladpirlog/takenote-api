import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import { IUserSchema } from '../models/User'
import { State } from '../interfaces/state.enum'

/**
 * Function that verifies if the user is in one of the required states.
 * @param states an array of states that the user must be in
 */
const checkUserState = (states: IUserSchema['state'][]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (
                res.locals.user.state === State.UNCONFIRMED &&
                !states.includes(State.UNCONFIRMED)
            ) {
                return createResponse(
                    res,
                    403,
                    'User has not confirmed the email address.'
                )
            }

            if (
                states.length === 1 &&
                states.includes(State.UNCONFIRMED) &&
                res.locals.user.state !== State.UNCONFIRMED
            ) {
                return createResponse(
                    res,
                    403,
                    'The user has already confirmed the email address.'
                )
            }

            if (!states.includes(res.locals.user.state)) {
                return createResponse(
                    res,
                    403,
                    `User is ${
                        res.locals.user.state
                    }. It should be: ${states.join(', ')}.`
                )
            }
            return next()
        } catch (err) {
            return createResponse(res, 500, err.message, {
                error: err
            })
        }
    }
}

export default checkUserState
