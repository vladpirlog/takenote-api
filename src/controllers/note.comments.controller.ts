import { NextFunction, Request, Response } from 'express'
import noteCommentsQuery from '../queries/note.comments.query'
import noteCrudQuery from '../queries/note.crud.query'
import userQuery from '../queries/user.query'
import createResponse from '../utils/createResponse.util'
import getAuthUser from '../utils/getAuthUser.util'
import stringToBoolean from '../utils/stringToBoolean.util'

const getAllComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const note = await noteCrudQuery.getOneByID(id)
        if (!note) return createResponse(res, 400)

        const comments = note.comments

        return createResponse(res, 200, 'Comments fetched.', {
            comments: {
                enabled: comments.enabled,
                items: comments.items.map(c => c.getPublicInfo())
            }
        })
    } catch (err) { return next(err) }
}

const getComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, commentID } = req.params

        const note = await noteCommentsQuery.getComment(id, commentID)
        if (!note) return createResponse(res, 400)

        const comment = note.comments?.items.find(c => c.id === commentID)?.getPublicInfo()

        return createResponse(res, 200, 'Comment fetched.', { comment })
    } catch (err) { return next(err) }
}

const addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { text } = req.body

        const user = await userQuery.getById(getAuthUser(res).id)
        if (!user) return createResponse(res, 400)

        const note = await noteCommentsQuery.addComment(id, {
            subject: { id: user?.id, username: user?.username, email: user?.email },
            text
        })
        if (!note) return createResponse(res, 400)

        const comment = note
            .comments?.items[note.comments.items.length - 1]
            .getPublicInfo()

        return createResponse(res, 201, 'Comment created.', { comment })
    } catch (err) { return next(err) }
}

const editComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, commentID } = req.params
        const { text } = req.body

        const note = await noteCommentsQuery.editComment(id, commentID, text)
        if (!note) return createResponse(res, 400)

        const comment = note
            .getPublicInfo(getAuthUser(res).id)
            .comments?.items.find(c => c.id === commentID)

        return createResponse(res, 200, 'Comment edited.', { comment })
    } catch (err) { return next(err) }
}

const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, commentID } = req.params

        const note = await noteCommentsQuery.deleteComment(id, commentID)
        if (!note) return createResponse(res, 400)

        return createResponse(res, 200, 'Comment deleted.')
    } catch (err) { return next(err) }
}

const setCommentSectionState = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { enabled } = req.query

        const enabledAsBoolean = stringToBoolean(enabled as string)
        if (enabledAsBoolean === undefined) return createResponse(res, 400)

        const note = await noteCommentsQuery.setCommentsSectionState(id, enabledAsBoolean)

        return note
            ? createResponse(res, 200, 'Comments section state changed.')
            : createResponse(res, 400)
    } catch (err) { return next(err) }
}

export default {
    getAllComments, getComment, addComment, editComment, deleteComment, setCommentSectionState
}
