import { NextFunction, Request, Response } from 'express'
import constants from '../config/constants.config'
import noteDrawingsQuery from '../queries/note.drawings.query'
import { DrawingBody } from '../types/RequestBodies'
import createResponse from '../utils/createResponse.util'
import getAuthUser from '../utils/getAuthUser.util'
import stringToBoolean from '../utils/stringToBoolean.util'
import { uploadFileToCloudStorage } from '../utils/cloudFileStorage.util'

const addDrawing = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const {
            background_color: backgroundColor,
            background_pattern: backgroundPattern,
            brush_color: brushColor,
            brush_size: brushSize,
            brush_type: brushType,
            variable_pen_pressure: variablePenPressure
        } = req.body as DrawingBody
        const file = req.file

        if (!file) return createResponse(res, 400, 'File not sent.')
        const url = await uploadFileToCloudStorage(
            file.path, getAuthUser(res).id, id, 'image', constants.nodeEnv
        )

        const newNote = await noteDrawingsQuery.addDrawing(
            id,
            {
                backgroundColor,
                backgroundPattern,
                brushColor,
                brushSize,
                brushType,
                url,
                variablePenPressure: stringToBoolean(variablePenPressure) || false
            }
        )
        if (!newNote) return createResponse(res, 400, 'Couldn\'t add drawing.')
        const insertedDrawing = newNote.drawings[newNote.drawings.length - 1]
        return createResponse(res, 201, 'Drawing added.', {
            drawing: insertedDrawing.getPublicInfo()
        })
    } catch (err) { return next(err) }
}

const editDrawing = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, drawingID } = req.params
        const {
            background_color: backgroundColor,
            background_pattern: backgroundPattern,
            brush_color: brushColor,
            brush_size: brushSize,
            brush_type: brushType,
            variable_pen_pressure: variablePenPressure
        } = req.body as DrawingBody
        const file = req.file

        if (!file) return createResponse(res, 400, 'File not sent.')
        const url = await uploadFileToCloudStorage(
            file.path, getAuthUser(res).id, id, 'image', constants.nodeEnv
        )

        const newNote = await noteDrawingsQuery.editDrawing(
            id,
            drawingID,
            {
                backgroundColor,
                backgroundPattern,
                brushColor,
                brushSize,
                brushType,
                url,
                variablePenPressure: stringToBoolean(variablePenPressure) || false
            }
        )
        const updatedDrawing = newNote?.drawings.find(d => d.id === drawingID)
        if (!newNote || !updatedDrawing) return createResponse(res, 400, 'Couldn\'t edit drawing.')
        return createResponse(res, 200, 'Drawing edited.', {
            drawing: updatedDrawing.getPublicInfo()
        })
    } catch (err) { return next(err) }
}

const deleteDrawing = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, drawingID } = req.params

        const newNote = await noteDrawingsQuery.deleteDrawing(id, drawingID)
        return newNote
            ? createResponse(res, 200, 'Drawing deleted.')
            : createResponse(res, 400, 'Couldn\'t delete drawing.')
    } catch (err) { return next(err) }
}

export default { addDrawing, editDrawing, deleteDrawing }
