/**
 * Permissions beginning with `NOTE` are note-related permissions.
 *
 * Permissions beginning with `NOTEPAD` are notepad-related permissions.
 */
export enum Permission {
    NOTE_EDIT_COMMON_PROPERTIES = 'note_edit_common_properties',
    NOTE_EDIT_PERSONAL_PROPERTIES = 'note_edit_personal_properties',
    NOTE_VIEW = 'note_view',
    NOTE_DELETE = 'note_delete',
    NOTE_MOVE = 'note_move',

    NOTE_ATTACHMENT_ADD = 'note_attachment_add',
    NOTE_ATTACHMENT_DELETE = 'note_attachment_delete',
    NOTE_ATTACHMENT_VIEW = 'note_attachment_view',

    NOTE_DRAWING_ADD = 'note_drawing_add',
    NOTE_DRAWING_DELETE = 'note_drawing_delete',
    NOTE_DRAWING_VIEW = 'note_drawing_view',

    NOTE_COMMENT_ADD = 'note_comment_add',
    NOTE_COMMENT_DELETE = 'note_comment_delete',
    NOTE_COMMENT_VIEW = 'note_comment_view',

    NOTE_COMMENTS_CHANGE_STATE = 'note_comments_change_state',

    NOTE_COLLABORATOR_ADD = 'note_collaborator_add',
    NOTE_COLLABORATOR_DELETE = 'note_collaborator_delete',
    NOTE_COLLABORATOR_VIEW = 'note_collaborator_view',

    NOTE_SHARING_EDIT = 'note_sharing_edit',
    NOTE_SHARING_VIEW = 'note_sharing_view',

    NOTEPAD_VIEW = 'notepad_view',
    NOTEPAD_DELETE = 'notepad_delete',
    NOTEPAD_ADD_NOTES = 'notepad_add_notes',
    NOTEPAD_EDIT_COMMON_PROPERTIES = 'notepad_edit_common_properties',

    NOTEPAD_COLLABORATOR_ADD = 'notepad_collaborator_add',
    NOTEPAD_COLLABORATOR_DELETE = 'notepad_collaborator_delete',
    NOTEPAD_COLLABORATOR_VIEW = 'notepad_collaborator_view',

    NOTEPAD_SHARING_EDIT = 'notepad_sharing_edit',
    NOTEPAD_SHARING_VIEW = 'notepad_sharing_view'
}
