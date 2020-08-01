import User, { IUserSchema } from '../models/User'
import createNewToken from '../utils/createNewToken.util'
import bcrypt from 'bcrypt'
import { MongooseUpdateQuery } from 'mongoose'

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
        | IUserSchema['forgotToken']['_id']
        | IUserSchema['confirmationToken']['_id'],
    type: 'reset' | 'forgot' | 'confirmation' | 'any'
) => {
    if (type === 'reset') {
        return User.findOne({
            'resetToken._id': token
        }).exec()
    } else if (type === 'forgot') {
        return User.findOne({
            'forgotToken._id': token
        }).exec()
    } else if (type === 'confirmation') {
        return User.findOne({
            'confirmationToken._id': token
        }).exec()
    } else {
        return User.findOne({
            $or: [
                { 'resetToken._id': token },
                { 'forgotToken._id': token },
                { 'confirmationToken._id': token }
            ]
        }).exec()
    }
}

/**
 * Creates a new user with the properties given as argument.
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
    type: 'reset' | 'forgot' | 'confirmation'
) => {
    let updateQuery: MongooseUpdateQuery<IUserSchema>
    if (type === 'reset') updateQuery = { resetToken: createNewToken('reset') }
    else if (type === 'forgot') updateQuery = { forgotToken: createNewToken('forgot') }
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
 * @param identifier id of a user or null; if not null, it provides an additional way of identifying the user
 * @param newPassword the new password to be hashed and salted
 * @param token a reset or forgot token, used to identify the user
 */
const setNewPassword = (
    identifier: IUserSchema['_id'] | null,
    newPassword: string,
    token:
        | IUserSchema['resetToken']['_id']
        | IUserSchema['forgotToken']['_id']
) => {
    const newSalt = bcrypt.genSaltSync(12)
    const hash = bcrypt.hashSync(newPassword, newSalt)
    return User.findOneAndUpdate(
        identifier
            ? { _id: identifier, 'resetToken._id': token }
            : { 'forgotToken._id': token },
        {
            password: hash,
            salt: newSalt,
            $unset: identifier
                ? { resetToken: '' }
                : { forgotToken: '' }
        },
        { new: true }
    ).exec()
}

export default {
    getById,
    getByUsernameOrEmail,
    getByToken,
    createNewUser,
    setUserState,
    setNewToken,
    setNewPassword
}
