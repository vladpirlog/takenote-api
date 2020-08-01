/**
 * Returns an object stripped of the keys which were explicitily defined as 'undefined'.
 * @param obj an object which may contain undefined values
 */
const removeUndefinedProps = (obj: any) => {
    Object.keys(obj).forEach(key => {
        if (obj[key] === undefined) { delete obj[key] }
    })
    return obj
}

export default removeUndefinedProps
