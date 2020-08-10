import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import { IUserSchema } from '../models/User'
import { State } from '../interfaces/state.enum'

const mustConfirmEmail = (userState: State, states: IUserSchema['state'][]) => {
    return userState === State.UNCONFIRMED &&
        !states.includes(State.UNCONFIRMED)
}

const hasAlreadyConfirmedEmail = (userState: State, states: IUserSchema['state'][]) => {
    return states.length === 1 &&
        states.includes(State.UNCONFIRMED) &&
        userState !== State.UNCONFIRMED
}

const isInAcceptedState = (userState: State, states: IUserSchema['state'][]) => {
    return states.includes(userState)
}

/**
 * Function that verifies if the user is in one of the accepted states.
 * @param states an array of states that the user must be in
 */
const checkUserState = (states: IUserSchema['state'][]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userState = res.locals.user.state
            if (mustConfirmEmail(userState, states)) {
                return createResponse(res, 403, 'User has not confirmed the email address.')
            }

            if (hasAlreadyConfirmedEmail(userState, states)) {
                return createResponse(res, 403, 'The user has already confirmed the email address.')
            }

            if (!isInAcceptedState(userState, states)) {
                return createResponse(res, 403, `User is ${userState}. It should be: ${states.join(', ')}.`)
            }
            return next()
        } catch (err) { return next(err) }
    }
}

export default checkUserState
