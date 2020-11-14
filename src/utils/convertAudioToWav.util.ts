import Ffmpeg from 'ffmpeg'

const convertAudioToWav = async (filePath: string) => {
    const initialFile = await new Ffmpeg(filePath)
    const convertedFilePath = await initialFile.save(`${filePath}.wav`)
    return convertedFilePath
}

export default convertAudioToWav
