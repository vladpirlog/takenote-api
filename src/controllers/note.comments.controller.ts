import { NextFunction, Request, Response } from 'express'
import noteCommentsQuery from '../queries/note.comments.query'
import userQuery from '../queries/user.query'
import createResponse from '../utils/createResponse.util'
import getAuthUser from '../utils/getAuthUser.util'
import stringToBoolean from '../utils/stringToBoolean.util'

const getAllComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const comments = await noteCommentsQuery.getAllComments(id)

        return comments
            ? createResponse(res, 200, 'Comments fetched.', { comments })
            : createResponse(res, 400)
    } catch (err) { return next(err) }
}

const getComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, commentID } = req.params

        const comment = await noteCommentsQuery.getComment(id, commentID)

        return comment
            ? createResponse(res, 200, 'Comment fetched.', { comment })
            : createResponse(res, 400)
    } catch (err) { return next(err) }
}

const addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { text } = req.body

        const user = await userQuery.getById(getAuthUser(res).id)
        if (!user) return createResponse(res, 400)

        const comment = await noteCommentsQuery.addComment(id, {
            subject: { id: user?.id, username: user?.username, email: user?.email },
            text
        })

        return comment
            ? createResponse(res, 201, 'Comment created.', { comment })
            : createResponse(res, 400)
    } catch (err) { return next(err) }
}

const editComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, commentID } = req.params
        const { text } = req.body

        const oldComment = await noteCommentsQuery.getComment(id, commentID)

        if (getAuthUser(res).id !== oldComment?.subject.id) {
            return createResponse(res, 401)
        }

        const comment = await noteCommentsQuery.editComment(id, commentID, text)

        return comment
            ? createResponse(res, 200, 'Comment edited.', { comment })
            : createResponse(res, 400)
    } catch (err) { return next(err) }
}

const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, commentID } = req.params

        const comment = await noteCommentsQuery.getComment(id, commentID)

        if (getAuthUser(res).id !== comment?.subject.id) {
            return createResponse(res, 401)
        }

        const ok = await noteCommentsQuery.deleteComment(id, commentID)

        return ok
            ? createResponse(res, 200, 'Comment deleted.')
            : createResponse(res, 400)
    } catch (err) { return next(err) }
}

const setCommentSectionState = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { enabled } = req.query

        const enabledAsBoolean = stringToBoolean(enabled as string)
        if (!enabledAsBoolean) return createResponse(res, 400)

        const ok = await noteCommentsQuery.setCommentsSectionState(id, enabledAsBoolean)

        return ok
            ? createResponse(res, 200, 'Comments section state changed.')
            : createResponse(res, 400)
    } catch (err) { return next(err) }
}

export default {
    getAllComments, getComment, addComment, editComment, deleteComment, setCommentSectionState
}
