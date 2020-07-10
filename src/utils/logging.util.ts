import http from 'http'
import { IUserSchema } from '../models/User'
import Log, { ILogSchema } from '../models/Log'
import IIpApiResponse from '../interfaces/ipApiResponse.interface'

/**
 * Creates a log entry in the logs database. Returns a promise.
 * @param ip ip address of the request
 * @param userID the id of the user making the request, or null if the user isn't authenticated
 * @param type the type of action performed: login, register or logout
 * @param successful true if the action was completed without errors
 */
const logging = async (
    ip: string,
    userID: IUserSchema['_id'] | null,
    type: ILogSchema['type'],
    successful: ILogSchema['successful']
) => {
    const targetURL = `http://ip-api.com/json/${ip}`
    const p: Promise<IIpApiResponse> = new Promise((resolve, reject) => {
        http.get(targetURL, res => {
            res.setEncoding('utf8')
            let body = ''
            res.on('error', error => reject(error))
            res.on('data', data => {
                body += data
            })
            res.on('end', () => resolve(JSON.parse(body)))
        })
    })
    const apiResponse = await p
    const newLogProps: any = { ip, type, successful }
    if (userID) newLogProps.userID = userID
    if (apiResponse.status === 'success') {
        newLogProps.location = {
            type: 'Point',
            coordinates: [apiResponse.lon, apiResponse.lat]
        }
    }
    const newLog = new Log(newLogProps)
    return newLog.save()
}

export default logging
