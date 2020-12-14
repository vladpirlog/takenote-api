import Note from '../models/Note'
import { INoteSchema } from '../types/Note'
import { IDrawingSchema } from '../types/Drawing'
import Drawing from '../models/Drawing'

/**
 * Adds an drawing to a note.
 * @param noteID id of the note
 * @param data new drawing properties
 */
const addDrawing = (
    noteID: INoteSchema['id'],
    data: Pick<IDrawingSchema, 'url' | 'brushColor' | 'brushSize' | 'brushType'
| 'variablePenPressure' | 'backgroundColor' | 'backgroundPattern'>
) => {
    return Note.findOneAndUpdate(
        { id: noteID },
        { $push: { drawings: new Drawing(data) } },
        { new: true }
    ).exec()
}

/**
 * Updates a note's drawing.
 * @param noteID id of the note
 * @param drawingID id of the drawing to be updated
 * @param data new drawing properties
 */
const editDrawing = (
    noteID: INoteSchema['id'],
    drawingID: IDrawingSchema['id'],
    data: Pick<IDrawingSchema, 'url' | 'brushColor' | 'brushSize' | 'brushType'
| 'variablePenPressure' | 'backgroundColor' | 'backgroundPattern'>
) => {
    return Note.findOneAndUpdate(
        { id: noteID, 'drawings.id': drawingID },
        {
            $set: {
                'drawings.$.url': data.url,
                'drawings.$.brushColor': data.brushColor,
                'drawings.$.brushSize': data.brushSize,
                'drawings.$.brushType': data.brushType,
                'drawings.$.backgroundColor': data.backgroundColor,
                'drawings.$.backgroundPattern': data.backgroundPattern,
                'drawings.$.variablePenPressure': data.variablePenPressure
            }
        },
        { new: true }
    ).exec()
}

/**
 * Removes a drawing from a note.
 * @param noteID id of the note
 * @param drawingID the id of the drawing to be removed
 */
const deleteDrawing = (
    noteID: INoteSchema['id'],
    drawingID: INoteSchema['drawings'][0]['id']
) => {
    return Note.findOneAndUpdate(
        { id: noteID },
        { $pull: { drawings: { id: drawingID } } },
        { new: true }
    ).exec()
}

export default {
    addDrawing,
    editDrawing,
    deleteDrawing
}
