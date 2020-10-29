/**
 * - OWNER -> can do anything to a note
 * - PRIMARY_COLLABORATOR -> OWNER, except delete the note and comments
 * - SECONDARY_COLLABORATOR -> PRIMARY_COLLABORATOR, except editing collaborators or sharing
 * - OBSERVER -> can only view note, comments, attachments, collaborators and sharing
 */
export enum NoteRole {
    OWNER = 'owner',
    PRIMARY_COLLABORATOR = 'primary_collaborator',
    SECONDARY_COLLABORATOR = 'secondary_collaborator',
    OBSERVER = 'observer',
}

export enum NotePermission {
    NOTE_EDIT_COMMON_PROPERTIES = 'note_edit_common_properties',
    NOTE_EDIT_PERSONAL_PROPERTIES = 'note_edit_personal_properties',
    NOTE_VIEW = 'note_view',
    NOTE_DELETE = 'note_delete',

    ATTACHMENT_ADD = 'attachment_add',
    ATTACHMENT_DELETE = 'attachment_delete',
    ATTACHMENT_VIEW = 'attachment_view',

    COMMENT_ADD = 'comment_add',
    COMMENT_DELETE = 'comment_delete',
    COMMENT_VIEW = 'comment_view',

    COMMENTS_CHANGE_STATE = 'comments_change_state',

    COLLABORATOR_ADD = 'collaborator_add',
    COLLABORATOR_DELETE = 'collaborator_delete',
    COLLABORATOR_VIEW = 'collaborator_view',

    SHARING_EDIT = 'sharing_edit',
    SHARING_VIEW = 'sharing_view'
}

export const RoleToPermissionsMap = {
    owner: [
        NotePermission.NOTE_EDIT_COMMON_PROPERTIES,
        NotePermission.NOTE_EDIT_PERSONAL_PROPERTIES,
        NotePermission.NOTE_VIEW,
        NotePermission.NOTE_DELETE,
        NotePermission.ATTACHMENT_ADD,
        NotePermission.ATTACHMENT_DELETE,
        NotePermission.ATTACHMENT_VIEW,
        NotePermission.COMMENT_ADD,
        NotePermission.COMMENT_DELETE,
        NotePermission.COMMENT_VIEW,
        NotePermission.COMMENTS_CHANGE_STATE,
        NotePermission.COLLABORATOR_ADD,
        NotePermission.COLLABORATOR_DELETE,
        NotePermission.COLLABORATOR_VIEW,
        NotePermission.SHARING_EDIT,
        NotePermission.SHARING_VIEW
    ],
    primary_collaborator: [
        NotePermission.NOTE_EDIT_COMMON_PROPERTIES,
        NotePermission.NOTE_EDIT_PERSONAL_PROPERTIES,
        NotePermission.NOTE_VIEW,
        NotePermission.COMMENT_ADD,
        NotePermission.COMMENT_VIEW,
        NotePermission.COMMENTS_CHANGE_STATE,
        NotePermission.ATTACHMENT_ADD,
        NotePermission.ATTACHMENT_DELETE,
        NotePermission.ATTACHMENT_VIEW,
        NotePermission.COLLABORATOR_VIEW,
        NotePermission.COLLABORATOR_ADD,
        NotePermission.COLLABORATOR_DELETE,
        NotePermission.SHARING_EDIT,
        NotePermission.SHARING_VIEW
    ],
    secondary_collaborator: [
        NotePermission.NOTE_EDIT_COMMON_PROPERTIES,
        NotePermission.NOTE_EDIT_PERSONAL_PROPERTIES,
        NotePermission.NOTE_VIEW,
        NotePermission.COMMENT_ADD,
        NotePermission.COMMENT_VIEW,
        NotePermission.ATTACHMENT_ADD,
        NotePermission.ATTACHMENT_DELETE,
        NotePermission.ATTACHMENT_VIEW,
        NotePermission.COLLABORATOR_VIEW,
        NotePermission.SHARING_VIEW
    ],
    observer: [
        NotePermission.NOTE_EDIT_PERSONAL_PROPERTIES,
        NotePermission.NOTE_VIEW,
        NotePermission.ATTACHMENT_VIEW,
        NotePermission.COLLABORATOR_VIEW,
        NotePermission.COMMENT_VIEW,
        NotePermission.SHARING_VIEW
    ]
}

export const getPermissionsFromRoles = (roles: NoteRole[]) => {
    const permissionsSet = new Set<NotePermission>()
    roles.forEach(r => RoleToPermissionsMap[r].forEach(p => permissionsSet.add(p)))
    return Array.from(permissionsSet)
}
