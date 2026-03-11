"use client"

import { cn } from "../../../shadcn/utils"
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import type { RichTextEditorProps } from "./types"

import { EditorConfigProvider } from "./context/editor-config-context"
import { nodes } from "./nodes"
import { Plugins } from "./plugins"
import { editorTheme } from "./themes/editor-theme"
import { TooltipProvider } from "./editor-ui/tooltip"

const editorConfig: InitialConfigType = {
  namespace: "RichTextEditor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error)
  },
}

export function RichTextEditor({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
  className,
  editorClassName,
  maxLength = 5000,
  onImageUpload,
  onMentionSearch,
  placeholder = "Press / for commands...",
  readOnly = false,
  contentOnly = false,
}: RichTextEditorProps) {
  const isReadOnly = readOnly || contentOnly
  return (
    <div
      className={cn(
        "bg-background overflow-hidden rounded-lg border shadow",
        className
      )}
    >
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          editable: !isReadOnly,
          ...(editorState ? { editorState } : {}),
          ...(editorSerializedState
            ? { editorState: JSON.stringify(editorSerializedState) }
            : {}),
        }}
      >
        <TooltipProvider>
          <EditorConfigProvider
            value={{
              editorClassName,
              maxLength,
              onImageUpload,
              onMentionSearch,
              placeholder,
              readOnly: isReadOnly,
              contentOnly,
            }}
          >
            <Plugins />
          </EditorConfigProvider>

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState) => {
              onChange?.(editorState)
              onSerializedChange?.(editorState.toJSON())
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  )
}

export type {
  ImageUploadHandler,
  MentionOption,
  MentionSearchHandler,
  RichTextEditorProps,
} from "./types"






