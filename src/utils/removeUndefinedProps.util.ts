/**
 * Returns an object stripped of the keys which were explicitily defined as 'undefined'.
 * @param obj an object which may contain undefined values
 */
const removeUndefinedProps = <T extends object>(obj: T): Partial<T> => {
    Object.keys(obj).forEach(key => {
        if ((obj as any)[key] === undefined) { delete (obj as any)[key] }
    })
    return obj
}

export default removeUndefinedProps
