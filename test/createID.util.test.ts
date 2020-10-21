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

    test('create confirmation token id', () => {
        const id = createID('confirmation')
        expect(id).toHaveLength(constants.idInfo.confirmation.length +
            constants.idInfo.confirmation.prefix.length)
        expect(/^cn[a-zA-Z0-9_-]{24}$/.test(id)).toBeTruthy()
    })

    test('create tfa cookie token', () => {
        const id = createID('tfa')
        expect(id).toHaveLength(constants.idInfo.tfa.length +
            constants.idInfo.tfa.prefix.length)
        expect(/tfa[a-zA-Z0-9_-]{48}$/.test(id)).toBeTruthy()
    })
})
