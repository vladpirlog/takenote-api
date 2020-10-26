import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import { IUserSchema } from '../types/User'
import getAuthUser from '../utils/getAuthUser.util'
import State from '../enums/State.enum'

const mustConfirmEmail = (userState: State, states: IUserSchema['state'][]) => {
    return userState === State.UNCONFIRMED &&
        !states.includes(State.UNCONFIRMED)
}

const isInAcceptedState = (userState: State, states: IUserSchema['state'][]) => {
    return states.includes(userState)
}

/**
 * Function that verifies if the user is in one of the accepted states.
 * @param states an array of states that the user must be in
 */
const checkUserState = (states: State[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userState = getAuthUser(res).state
            if (!userState) return createResponse(res, 403)

            if (mustConfirmEmail(userState, states)) {
                return createResponse(res, 403, 'User has not confirmed the email address.')
            }

            if (!isInAcceptedState(userState, states)) {
                return createResponse(res, 403, `User is ${userState}. It should be: ${states.join(', ')}.`)
            }
            return next()
        } catch (err) { return next(err) }
    }
}

export default checkUserState
