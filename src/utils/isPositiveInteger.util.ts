const isPositiveInteger = (str?: string) => {
    const n = Math.floor(Number(str))
    return n !== Infinity && String(n) === str && n >= 0
}

export default isPositiveInteger
