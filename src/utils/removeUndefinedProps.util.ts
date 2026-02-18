/**
 * Returns an object stripped of the keys which were explicitily defined as 'undefined'.
 * @param obj an object which may contain undefined values
 */
const removeUndefinedProps = <T extends object>(obj: T): Partial<T> => {
    Object.keys(obj).forEach(key => {
        if ((obj as { [x: string]: unknown })[key] === undefined) { delete (obj as { [x: string]: unknown })[key] }
    })
    return obj
}

export default removeUndefinedProps
