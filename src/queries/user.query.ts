import User from '../models/User'
import { IUserSchema } from '../types/User'
import bcrypt from 'bcrypt'
import { ITokenSchema } from '../types/Token'
import removeUndefinedProps from '../utils/removeUndefinedProps.util'
import State from '../enums/State.enum'
import Token from '../models/Token'
import createID from '../utils/createID.util'
import getUnixTime from '../utils/getUnixTime.util'
import constants from '../config/constants.config'

/**
 * Searches for and returns a user using its id.
 * @param userID id of a user
 */
const getById = (
    userID: IUserSchema['id']
) => {
    return User.findOne({ id: userID }).exec()
}

/**
 * Searches for and returns a user using its username, email or both.
 * If both arguments are provided, the first will be treated as the username and the second as email.
 * Otherwise, the first argument will be treated as email or username.
 * @param username username of a user
 * @param email email of a user
 */
const getByUsernameOrEmail = (
    username?: IUserSchema['username'] | IUserSchema['email'],
    email?: IUserSchema['email']
) => {
    return User.findOne({
        $or: [{ username: username }, { email: email || username }]
    }).exec()
}

/**
 * Searches for and returns a user using a token of a certain type.
 * @param token token belonging to a user
 * @param type the type of token given as argument
 */
const getByToken = (
    token: ITokenSchema['id'],
    type?: 'reset' | 'confirmation'
) => {
    if (type === 'reset') {
        return User.findOne({
            'resetToken.id': token
        }).exec()
    } else if (type === 'confirmation') {
        return User.findOne({
            'confirmationToken.id': token
        }).exec()
    } else {
        return User.findOne({
            $or: [
                { 'resetToken.id': token },
                { 'confirmationToken.id': token }
            ]
        }).exec()
    }
}

/**
 * Creates a new user with the properties given.
 * @param props object representing basic user info to be added to the database
 */
const createNewUser = (props: Pick<IUserSchema, 'username' | 'email' | 'password'>) => {
    const token = new Token({
        id: createID('confirmation'),
        exp: Math.floor(getUnixTime() + constants.token.expires / 1000)
    })
    const newUser = new User({ ...props, confirmationToken: token })
    return newUser.save()
}

/**
 * Creates a new OAuth user with the properties given.
 * @param props object representing basic user info and OAuth data to be added to the database
 */
const createNewOAuthUser = (props: Pick<IUserSchema, 'username' | 'email' | 'oauth'>) => {
    const newUser = new User({
        ...props, state: State.ACTIVE
    })
    return newUser.save()
}

/**
 * Sets a certain state to a given user.
 * @param userID id of a user
 * @param state the state to be set for that user
 */
const setUserState = (
    userID: IUserSchema['id'],
    state: IUserSchema['state']
) => {
    return User.findOneAndUpdate(
        { id: userID },
        { $unset: { confirmationToken: '' }, state: state },
        { new: true }
    ).exec()
}

/**
 * Creates and assigns a certain type of token to a given user.
 * @param identifier email, username or id of a user
 * @param type the type of token to be added to that user
 */
const setNewToken = (
    identifier:
        | IUserSchema['email']
        | IUserSchema['username']
        | IUserSchema['id'],
    type: 'reset' | 'confirmation'
) => {
    const token = new Token({
        id: createID(type),
        exp: Math.floor(getUnixTime() + constants.token.expires / 1000)
    })
    const updateQuery = type === 'reset'
        ? { resetToken: token }
        : { confirmationToken: token }

    return User.findOneAndUpdate(
        {
            $or: [
                { username: identifier },
                { email: identifier },
                { id: identifier }
            ]
        },
        updateQuery,
        { new: true }
    ).exec()
}

/**
 * Searches for a user based on a token and optionally its id, then changes the password to the one given.
 * @param newPassword the new password to be hashed and salted
 * @param token a reset token, used to identify the user
 */
const setNewPassword = async (
    newPassword: string,
    token: ITokenSchema['id']
) => {
    const hash = await bcrypt.hash(newPassword, 12)
    return User.findOneAndUpdate(
        {
            'resetToken.id': token
        },
        {
            password: hash,
            $unset: { resetToken: '' }
        },
        { new: true }
    ).exec()
}

/**
 * Sets new properties on the twoFactorAuth field of a user
 * @param userID id of a user
 * @param data 2fa data to be set
 */
const set2faData = (
    userID: IUserSchema['id'],
    data: Partial<IUserSchema['twoFactorAuth']>
) => {
    return User.findOneAndUpdate(
        { id: userID },
        removeUndefinedProps({
            'twoFactorAuth.active': data.active,
            'twoFactorAuth.nextCheck': data.nextCheck,
            'twoFactorAuth.secret': data.secret,
            'twoFactorAuth.backupCodes': data.backupCodes
        }),
        { new: true }
    ).exec()
}

/**
 * Returns the twoFactorAuth fields to their default values.
 * @param userID id of a user
 */
const remove2faData = (userID: IUserSchema['id']) => {
    return User.findOneAndUpdate(
        { id: userID },
        { twoFactorAuth: { nextCheck: 0, active: false, backupCodes: [] } },
        { new: true }
    ).exec()
}

export default {
    getById,
    getByUsernameOrEmail,
    getByToken,
    createNewUser,
    createNewOAuthUser,
    setUserState,
    setNewToken,
    setNewPassword,
    set2faData,
    remove2faData
}
