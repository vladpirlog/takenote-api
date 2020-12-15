import Note from '../models/Note'
import { INoteSchema } from '../types/Note'
import { IDrawingSchema } from '../types/Drawing'
import Drawing from '../models/Drawing'

/**
 * Adds an drawing to a note.
 * @param noteID id of the note
 * @param data new drawing properties
 * @returns the newly added drawing or undefined
 */
const addDrawing = async (
    noteID: INoteSchema['id'],
    data: Pick<IDrawingSchema, 'url' | 'brushColor' | 'brushSize' | 'brushType'
| 'variablePenPressure' | 'backgroundColor' | 'backgroundPattern'> & { id?: IDrawingSchema['id'] }
) => {
    const note = await Note.findOneAndUpdate(
        { id: noteID },
        { $push: { drawings: new Drawing(data) } },
        { new: true }
    ).exec()
    return note?.drawings[note.drawings.length - 1]
}

/**
 * Updates a note's drawing.
 * @param noteID id of the note
 * @param drawingID id of the drawing to be updated
 * @param data new drawing properties
 * @returns the updated drawing or undefined
 */
const editDrawing = async (
    noteID: INoteSchema['id'],
    drawingID: IDrawingSchema['id'],
    data: Pick<IDrawingSchema, 'url' | 'brushColor' | 'brushSize' | 'brushType'
| 'variablePenPressure' | 'backgroundColor' | 'backgroundPattern'>
) => {
    const oldNote = await Note.findOneAndUpdate(
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
    return oldNote?.drawings.find(d => d.id === drawingID)
}

/**
 * Removes a drawing from a note.
 * @param noteID id of the note
 * @param drawingID the id of the drawing to be removed
 * @returns the deleted drawing or undefined
 */
const deleteDrawing = async (
    noteID: INoteSchema['id'],
    drawingID: INoteSchema['drawings'][0]['id']
) => {
    const oldNote = await Note.findOneAndUpdate(
        { id: noteID },
        { $pull: { drawings: { id: drawingID } } }
    ).exec()
    return oldNote?.drawings.find(d => d.id === drawingID)
}

export default {
    addDrawing,
    editDrawing,
    deleteDrawing
}
