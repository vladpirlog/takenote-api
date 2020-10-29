import Comment from '../models/Comment'
import Note from '../models/Note'
import { ICommentSchema } from '../types/Comment'
import { INoteSchema } from '../types/Note'

const getComment = (
    noteID: INoteSchema['id'],
    commentID: ICommentSchema['id']
) => {
    return Note.findOne({ id: noteID, 'comments.items.id': commentID }).exec()
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
    return Note.findOneAndUpdate(
        { id: noteID, 'comments.items.id': commentID },
        { $set: { 'comments.items.$.text': newText } },
        { new: true }
    )
}

const deleteComment = (
    noteID: INoteSchema['id'],
    commentID: ICommentSchema['id']
) => {
    return Note.findOneAndUpdate(
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
    getComment, addComment, editComment, deleteComment, setCommentsSectionState
}
