import { EditorState, SerializedEditorState } from "lexical"

export interface MentionOption {
  id?: string
  name: string
  avatar?: string
}

export type MentionSearchHandler = (
  query: string
) => Promise<MentionOption[]>

export type ImageUploadHandler = (file: File) => Promise<string>

export interface RichTextEditorProps {
  editorState?: EditorState
  editorSerializedState?: SerializedEditorState
  onChange?: (editorState: EditorState) => void
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void
  placeholder?: string
  readOnly?: boolean
  maxLength?: number
  onMentionSearch?: MentionSearchHandler
  onImageUpload?: ImageUploadHandler
  className?: string
  editorClassName?: string
}


