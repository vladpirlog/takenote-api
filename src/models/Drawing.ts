import mongoose, { Schema } from 'mongoose'
import { DrawingBackgroundPattern, DrawingBrushType } from '../enums/Drawing.enum'
import { IDrawingSchema } from '../types/Drawing'
import createID from '../utils/createID.util'

export const DrawingSchema = new Schema<IDrawingSchema>({
    id: {
        type: String,
        required: true,
        default: () => createID('drawing')
    },
    url: {
        type: String,
        required: true
    },
    brushColor: {
        type: String,
        default: '#222222',
        required: true
    },
    brushSize: {
        type: Number,
        default: 6,
        required: true
    },
    brushType: {
        type: String,
        enum: Object.values(DrawingBrushType),
        default: DrawingBrushType.NORMAL,
        required: true
    },
    backgroundPattern: {
        type: String,
        enum: Object.values(DrawingBackgroundPattern),
        default: DrawingBackgroundPattern.NONE,
        required: true
    },
    backgroundColor: {
        type: String,
        default: '#fef9ef',
        required: true
    },
    variablePenPressure: {
        type: Boolean,
        default: true,
        required: true
    }
}, { timestamps: true, id: false })

DrawingSchema.methods.getPublicInfo = function () {
    return Object.freeze({
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        url: this.url,
        brushColor: this.brushColor,
        brushSize: this.brushSize,
        brushType: this.brushType,
        backgroundPattern: this.backgroundPattern,
        backgroundColor: this.backgroundColor,
        variablePenPressure: this.variablePenPressure
    })
}

export default mongoose.model<IDrawingSchema>('Drawing', DrawingSchema)
