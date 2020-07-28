/**
 * A function that extracts the unix epoch time from a date; the return value is expressed in seconds
 * @param date a date to extract unix time from; if it's missing, the current date will be used
 */
const getUnixTime = (date?: Date) => {
    if (date) return Math.floor(date.getTime() / 1000)
    return Math.floor(new Date().getTime() / 1000)
}

export default getUnixTime
