import User, { IUserSchema } from '../models/User'
import createNewToken from '../utils/createNewToken.util'
import bcrypt from 'bcrypt'
import { MongooseUpdateQuery } from 'mongoose'
import { State } from '../interfaces/state.enum'

/**
 * Searches for and returns a user using its id.
 * @param userID id of a user
 */
const getById = (
    userID: IUserSchema['_id']
) => {
    return User.findById(userID).exec()
}

/**
 * Searches for and returns a user using its username, email or both.
 * If both arguments are provided, the first will be treated as the username and the second as email.
 * Otherwise, the first argument will be treated as email or username.
 * @param username username of a user
 * @param email email of a user
 */
const getByUsernameOrEmail = (
    username: IUserSchema['username'] | IUserSchema['email'],
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
    token:
        | IUserSchema['resetToken']['_id']
        | IUserSchema['confirmationToken']['_id'],
    type: 'reset' | 'confirmation' | 'any'
) => {
    if (type === 'reset') {
        return User.findOne({
            'resetToken._id': token
        }).exec()
    } else if (type === 'confirmation') {
        return User.findOne({
            'confirmationToken._id': token
        }).exec()
    } else {
        return User.findOne({
            $or: [
                { 'resetToken._id': token },
                { 'confirmationToken._id': token }
            ]
        }).exec()
    }
}

/**
 * Creates a new user with the properties given.
 * @param props object representing basic user info to be added to the database
 */
const createNewUser = (props: {
    username: IUserSchema['username'];
    email: IUserSchema['email'];
    password: IUserSchema['password'];
    confirmationToken: IUserSchema['confirmationToken'];
}) => {
    const newUser = new User(props)
    return newUser.save()
}

/**
 * Creates a new OAuth user with the properties given.
 * @param props object representing basic user info and OAuth data to be added to the database
 */
const createNewOAuthUser = (props: {
    username: IUserSchema['username'],
    email: IUserSchema['email'],
    oauth: IUserSchema['oauth']
}) => {
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
    userID: IUserSchema['_id'],
    state: IUserSchema['state']
) => {
    return User.findByIdAndUpdate(
        userID,
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
        | IUserSchema['_id'],
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
                { _id: identifier }
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
const setNewPassword = (
    newPassword: string,
    token: IUserSchema['resetToken']['_id']
) => {
    const newSalt = bcrypt.genSaltSync(12)
    const hash = bcrypt.hashSync(newPassword, newSalt)
    return User.findOneAndUpdate(
        {
            'resetToken._id': token
        },
        {
            password: hash,
            salt: newSalt,
            $unset: { resetToken: '' }
        },
        { new: true }
    ).exec()
}

const set2faData = (userID: IUserSchema['_id'], data: {
    active?: IUserSchema['twoFactorAuth']['active'],
    nextCheck?: IUserSchema['twoFactorAuth']['nextCheck'],
    secret?: IUserSchema['twoFactorAuth']['secret'],
    backupCodes?: IUserSchema['twoFactorAuth']['backupCodes']
}) => {
    const updateQuery: any = {}
    if (data.active !== undefined) updateQuery['twoFactorAuth.active'] = data.active
    if (data.nextCheck !== undefined) updateQuery['twoFactorAuth.nextCheck'] = data.nextCheck
    if (data.secret !== undefined) updateQuery['twoFactorAuth.secret'] = data.secret
    if (data.backupCodes !== undefined) updateQuery['twoFactorAuth.backupCodes'] = data.backupCodes

    return User.findByIdAndUpdate(
        userID,
        updateQuery,
        { new: true }
    ).exec()
}

const remove2faData = (userID: IUserSchema['_id']) => {
    return User.findByIdAndUpdate(
        userID,
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
