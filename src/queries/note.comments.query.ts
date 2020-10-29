import Comment from '../models/Comment'
import Note from '../models/Note'
import { ICommentSchema } from '../types/Comment'
import { INoteSchema } from '../types/Note'

const getAllComments = async (
    noteID: INoteSchema['id']
) => {
    const note = await Note.findOne({ id: noteID }).select('comments').exec()
    return note?.comments
}

const getComment = async (
    noteID: INoteSchema['id'],
    commentID: ICommentSchema['id']
) => {
    const note = await Note.findOne({ id: noteID, 'comment.items.id': commentID })
        .select('comments').exec()
    return note?.comments.items.find(c => c.id === commentID)
}

const addComment = (
    noteID: INoteSchema['id'],
    comment: Pick<ICommentSchema, 'subject' | 'text'>
) => {
    return Note.findOneAndUpdate(
        { id: noteID },
        { $push: { 'comments.items': new Comment(comment) } },
        { new: true }
    )
}

const editComment = (
    noteID: INoteSchema['id'],
    commentID: ICommentSchema['id'],
    newText: string
) => {
    return Note.findByIdAndUpdate(
        { id: noteID, 'comments.items.id': commentID },
        { $set: { 'comments.items.$.text': newText } },
        { new: true }
    )
}

const deleteComment = (
    noteID: INoteSchema['id'],
    commentID: ICommentSchema['id']
) => {
    return Note.findByIdAndUpdate(
        { id: noteID, 'comments.items.id': commentID },
        { $pull: { 'comments.items': { id: commentID } } },
        { new: true }
    )
}

const setCommentsSectionState = (
    noteID: INoteSchema['id'],
    enabled: boolean
) => {
    return Note.findOneAndUpdate(
        { id: noteID },
        { 'comments.enabled': enabled },
        { new: true }
    ).exec()
}

export default {
    getAllComments, getComment, addComment, editComment, deleteComment, setCommentsSectionState
}
