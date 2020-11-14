import convertAudioToWav from '../src/utils/convertAudioToWav.util'
import path from 'path'
import { promises as fs } from 'fs'

describe('test converting audio file to wav', () => {
    let newFilePath: string

    const testAudio = {
        webm: path.join(process.cwd(), 'test', 'media', 'test-audio.webm'),
        aac: path.join(process.cwd(), 'test', 'media', 'test-audio.aac'),
        ogg: path.join(process.cwd(), 'test', 'media', 'test-audio.ogg')
    }

    test.each(['webm', 'aac', 'ogg'])('should convert %s to wav', async format => {
        newFilePath = await convertAudioToWav(testAudio[format])
        expect(newFilePath).toMatch(/\.wav$/)
        const fileStats = await fs.stat(newFilePath)
        expect(fileStats).toBeDefined()
    })

    afterEach(async () => {
        await fs.unlink(newFilePath)
    })
})
