import createID from '../src/utils/createID.util'
import constants from '../src/config/constants.config'

describe('id creation testing', () => {
    test('create note id', () => {
        const id = createID('note')
        expect(id).toHaveLength(constants.idInfo.note.length +
            constants.idInfo.note.prefix.length)
        expect(/^n[a-zA-Z0-9_-]{24}$/.test(id)).toBeTruthy()
    })

    test('create user id', () => {
        const id = createID('user')
        expect(id).toHaveLength(constants.idInfo.user.length +
            constants.idInfo.user.prefix.length)
        expect(/^u[a-zA-Z0-9_-]{24}$/.test(id)).toBeTruthy()
    })

    test('create jwt id', () => {
        const id = createID('jwt')
        expect(id).toHaveLength(constants.idInfo.jwt.length +
            constants.idInfo.jwt.prefix.length)
        expect(/^j[a-zA-Z0-9_-]{24}$/.test(id)).toBeTruthy()
    })

    test('create permission id', () => {
        const id = createID('permission')
        expect(id).toHaveLength(constants.idInfo.permission.length +
            constants.idInfo.permission.prefix.length)
        expect(/^p[a-zA-Z0-9_-]{24}$/.test(id)).toBeTruthy()
    })

    test('create attachment id', () => {
        const id = createID('attachment')
        expect(id).toHaveLength(constants.idInfo.attachment.length +
            constants.idInfo.attachment.prefix.length)
        expect(/^a[a-zA-Z0-9_-]{24}$/.test(id)).toBeTruthy()
    })

    test('create share id', () => {
        const id = createID('share')
        expect(id).toHaveLength(constants.idInfo.share.length +
            constants.idInfo.share.prefix.length)
        expect(/^s[a-zA-Z0-9_-]{24}$/.test(id)).toBeTruthy()
    })

    test('create reset token id', () => {
        const id = createID('reset')
        expect(id).toHaveLength(constants.idInfo.reset.length +
            constants.idInfo.reset.prefix.length)
        expect(/^rs[a-zA-Z0-9_-]{24}$/.test(id)).toBeTruthy()
    })

    test('create forgot token id', () => {
        const id = createID('forgot')
        expect(id).toHaveLength(constants.idInfo.forgot.length +
            constants.idInfo.forgot.prefix.length)
        expect(/^fr[a-zA-Z0-9_-]{24}$/.test(id)).toBeTruthy()
    })

    test('create confirmation token id', () => {
        const id = createID('confirmation')
        expect(id).toHaveLength(constants.idInfo.confirmation.length +
            constants.idInfo.confirmation.prefix.length)
        expect(/^cn[a-zA-Z0-9_-]{24}$/.test(id)).toBeTruthy()
    })

    test('create log id', () => {
        const id = createID('log')
        expect(id).toHaveLength(constants.idInfo.log.length +
            constants.idInfo.log.prefix.length)
        expect(/log[a-zA-Z0-9_-]{32}$/.test(id)).toBeTruthy()
    })
})
