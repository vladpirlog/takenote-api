import User, { IUserSchema, State } from '../models/User'
import createNewToken from '../utils/createNewToken.util'
import bcrypt from 'bcrypt'
import { MongooseUpdateQuery } from 'mongoose'
import { ITokenSchema } from '../models/Token'
import removeUndefinedProps from '../utils/removeUndefinedProps.util'

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
    const newUser = new User({ ...props, confirmationToken: createNewToken('confirmation') })
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
    let updateQuery: MongooseUpdateQuery<IUserSchema>
    if (type === 'reset') updateQuery = { resetToken: createNewToken('reset') }
    else updateQuery = { confirmationToken: createNewToken('confirmation') }

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
const set2faData = (userID: IUserSchema['id'], data: {
    active?: IUserSchema['twoFactorAuth']['active'],
    nextCheck?: IUserSchema['twoFactorAuth']['nextCheck'],
    secret?: IUserSchema['twoFactorAuth']['secret'],
    backupCodes?: IUserSchema['twoFactorAuth']['backupCodes']
}) => {
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
