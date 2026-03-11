"use client"

import { createContext, useContext } from "react"

import type { RichTextEditorProps } from "../types"

type EditorConfig = Pick<
  RichTextEditorProps,
  | "editorClassName"
  | "maxLength"
  | "onImageUpload"
  | "onMentionSearch"
  | "placeholder"
  | "readOnly"
  | "contentOnly"
>

const EditorConfigContext = createContext<EditorConfig>({
  placeholder: "Press / for commands...",
  readOnly: false,
  contentOnly: false,
})

export function EditorConfigProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: EditorConfig
}) {
  return (
    <EditorConfigContext.Provider value={value}>
      {children}
    </EditorConfigContext.Provider>
  )
}

export function useEditorConfig() {
  return useContext(EditorConfigContext)
}



