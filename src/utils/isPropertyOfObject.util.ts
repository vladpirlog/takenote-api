const isPropertyOfObject = (property: string, obj: Object) => {
    return Object.keys(obj).includes(property)
}

export default isPropertyOfObject
