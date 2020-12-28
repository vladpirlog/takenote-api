import { Permission } from '../enums/Permission.enum'
import { Role } from '../enums/Role.enum'

export const RoleToPermissionsMap = {
    owner: {
        note: [
            Permission.NOTE_EDIT_COMMON_PROPERTIES,
            Permission.NOTE_EDIT_PERSONAL_PROPERTIES,
            Permission.NOTE_VIEW,
            Permission.NOTE_DELETE,
            Permission.NOTE_MOVE,
            Permission.NOTE_ATTACHMENT_ADD,
            Permission.NOTE_ATTACHMENT_DELETE,
            Permission.NOTE_DRAWING_ADD,
            Permission.NOTE_DRAWING_DELETE,
            Permission.NOTE_COMMENT_ADD,
            Permission.NOTE_COMMENT_DELETE,
            Permission.NOTE_COMMENTS_CHANGE_STATE,
            Permission.NOTE_COLLABORATOR_ADD,
            Permission.NOTE_COLLABORATOR_DELETE,
            Permission.NOTE_SHARING_EDIT
        ],
        notepad: [
            Permission.NOTEPAD_VIEW,
            Permission.NOTEPAD_DELETE,
            Permission.NOTEPAD_ADD_NOTES,
            Permission.NOTEPAD_EDIT_COMMON_PROPERTIES,
            Permission.NOTEPAD_COLLABORATOR_ADD,
            Permission.NOTEPAD_COLLABORATOR_DELETE,
            Permission.NOTEPAD_SHARING_EDIT
        ]
    },
    primary_collaborator: {
        note: [
            Permission.NOTE_EDIT_COMMON_PROPERTIES,
            Permission.NOTE_EDIT_PERSONAL_PROPERTIES,
            Permission.NOTE_VIEW,
            Permission.NOTE_COMMENT_ADD,
            Permission.NOTE_COMMENTS_CHANGE_STATE,
            Permission.NOTE_ATTACHMENT_ADD,
            Permission.NOTE_ATTACHMENT_DELETE,
            Permission.NOTE_DRAWING_ADD,
            Permission.NOTE_DRAWING_DELETE,
            Permission.NOTE_COLLABORATOR_ADD,
            Permission.NOTE_COLLABORATOR_DELETE,
            Permission.NOTE_SHARING_EDIT
        ],
        notepad: [
            Permission.NOTEPAD_VIEW,
            Permission.NOTEPAD_ADD_NOTES,
            Permission.NOTEPAD_EDIT_COMMON_PROPERTIES,
            Permission.NOTEPAD_SHARING_EDIT,
            Permission.NOTEPAD_COLLABORATOR_ADD,
            Permission.NOTEPAD_COLLABORATOR_DELETE
        ]
    },
    secondary_collaborator: {
        note: [
            Permission.NOTE_EDIT_COMMON_PROPERTIES,
            Permission.NOTE_EDIT_PERSONAL_PROPERTIES,
            Permission.NOTE_VIEW,
            Permission.NOTE_COMMENT_ADD,
            Permission.NOTE_ATTACHMENT_ADD,
            Permission.NOTE_ATTACHMENT_DELETE,
            Permission.NOTE_DRAWING_ADD,
            Permission.NOTE_DRAWING_DELETE
        ],
        notepad: [
            Permission.NOTEPAD_VIEW
        ]
    },
    observer: {
        note: [
            Permission.NOTE_EDIT_PERSONAL_PROPERTIES,
            Permission.NOTE_VIEW
        ],
        notepad: [
            Permission.NOTEPAD_VIEW
        ]
    }
}

export const getPermissionsFromRoles = (
    entityType: 'note' | 'notepad',
    roles: Role[]
) => {
    const permissionsSet = new Set<Permission>()
    roles.forEach(r => RoleToPermissionsMap[r][entityType].forEach(p => permissionsSet.add(p)))
    return Array.from(permissionsSet)
}
