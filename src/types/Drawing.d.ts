import { DrawingBackgroundPattern, DrawingBrushType } from '../enums/Drawing.enum'
import { IEntity } from './Entity'

export type PublicDrawingInfo = Pick<IDrawingSchema, 'id' | 'brushColor' | 'brushSize'
| 'createdAt' | 'backgroundColor' | 'backgroundPattern' | 'updatedAt' | 'brushType' | 'url'>

export interface IDrawingSchema extends IEntity {
    url: string
    brushColor: string
    brushSize: number
    brushType: DrawingBrushType
    backgroundPattern: DrawingBackgroundPattern
    backgroundColor: string
    variablePenPressure: boolean

    getPublicInfo(): Readonly<PublicDrawingInfo>
}
