"use client"

import { useState } from "react"
import { cn } from "../../../../shadcn/utils"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin"
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin"
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin"
import { TablePlugin } from "@lexical/react/LexicalTablePlugin"

import { ContentEditable } from "../editor-ui/content-editable"
import { ActionsPlugin } from "./actions/actions-plugin"
import { CharacterLimitPlugin } from "./actions/character-limit-plugin"
import { ClearEditorActionPlugin } from "./actions/clear-editor-plugin"
import { CounterCharacterPlugin } from "./actions/counter-character-plugin"
import { EditModeTogglePlugin } from "./actions/edit-mode-toggle-plugin"
import { ImportExportPlugin } from "./actions/import-export-plugin"
import { MarkdownTogglePlugin } from "./actions/markdown-toggle-plugin"
import { MaxLengthPlugin } from "./actions/max-length-plugin"
import { ShareContentPlugin } from "./actions/share-content-plugin"
import { SpeechToTextPlugin } from "./actions/speech-to-text-plugin"
import { TreeViewPlugin } from "./actions/tree-view-plugin"
import { AutoLinkPlugin } from "./auto-link-plugin"
import { AutocompletePlugin } from "./autocomplete-plugin"
import { CodeActionMenuPlugin } from "./code-action-menu-plugin"
import { CodeHighlightPlugin } from "./code-highlight-plugin"
import { ContextMenuPlugin } from "./context-menu-plugin"
import { DragDropPastePlugin } from "./drag-drop-paste-plugin"
import { DraggableBlockPlugin } from "./draggable-block-plugin"
import { AutoEmbedPlugin } from "./embeds/auto-embed-plugin"
import { TwitterPlugin } from "./embeds/twitter-plugin"
import { YouTubePlugin } from "./embeds/youtube-plugin"
import { EmojiPickerPlugin } from "./emoji-picker-plugin"
import { EmojisPlugin } from "./emojis-plugin"
import { FloatingLinkEditorPlugin } from "./floating-link-editor-plugin"
import { FloatingTextFormatToolbarPlugin } from "./floating-text-format-plugin"
import { ImagesPlugin } from "./images-plugin"
import { KeywordsPlugin } from "./keywords-plugin"
import { LayoutPlugin } from "./layout-plugin"
import { LinkPlugin } from "./link-plugin"
import { ListMaxIndentLevelPlugin } from "./list-max-indent-level-plugin"
import { MentionsPlugin } from "./mentions-plugin"
import { AlignmentPickerPlugin } from "./picker/alignment-picker-plugin"
import { BulletedListPickerPlugin } from "./picker/bulleted-list-picker-plugin"
import { CheckListPickerPlugin } from "./picker/check-list-picker-plugin"
import { ComponentPickerMenuPlugin } from "./picker/component-picker-menu-plugin"
import { CodePickerPlugin } from "./picker/code-picker-plugin"
import { ColumnsLayoutPickerPlugin } from "./picker/columns-layout-picker-plugin"
import { DividerPickerPlugin } from "./picker/divider-picker-plugin"
import { EmbedsPickerPlugin } from "./picker/embeds-picker-plugin"
import { HeadingPickerPlugin } from "./picker/heading-picker-plugin"
import { ImagePickerPlugin } from "./picker/image-picker-plugin"
import { NumberedListPickerPlugin } from "./picker/numbered-list-picker-plugin"
import { ParagraphPickerPlugin } from "./picker/paragraph-picker-plugin"
import { QuotePickerPlugin } from "./picker/quote-picker-plugin"
import {
  DynamicTablePickerPlugin,
  TablePickerPlugin,
} from "./picker/table-picker-plugin"
import { TabFocusPlugin } from "./tab-focus-plugin"
import { BlockFormatDropDown } from "./toolbar/block-format-toolbar-plugin"
import { FormatBulletedList } from "./toolbar/block-format/format-bulleted-list"
import { FormatCheckList } from "./toolbar/block-format/format-check-list"
import { FormatCodeBlock } from "./toolbar/block-format/format-code-block"
import { FormatHeading } from "./toolbar/block-format/format-heading"
import { FormatNumberedList } from "./toolbar/block-format/format-numbered-list"
import { FormatParagraph } from "./toolbar/block-format/format-paragraph"
import { FormatQuote } from "./toolbar/block-format/format-quote"
import { BlockInsertPlugin } from "./toolbar/block-insert-plugin"
import { InsertColumnsLayout } from "./toolbar/block-insert/insert-columns-layout"
import { InsertEmbeds } from "./toolbar/block-insert/insert-embeds"
import { InsertHorizontalRule } from "./toolbar/block-insert/insert-horizontal-rule"
import { InsertImage } from "./toolbar/block-insert/insert-image"
import { InsertTable } from "./toolbar/block-insert/insert-table"
import { ClearFormattingToolbarPlugin } from "./toolbar/clear-formatting-toolbar-plugin"
import { CodeLanguageToolbarPlugin } from "./toolbar/code-language-toolbar-plugin"
import { ElementFormatToolbarPlugin } from "./toolbar/element-format-toolbar-plugin"
import { FontBackgroundToolbarPlugin } from "./toolbar/font-background-toolbar-plugin"
import { FontColorToolbarPlugin } from "./toolbar/font-color-toolbar-plugin"
import { FontFamilyToolbarPlugin } from "./toolbar/font-family-toolbar-plugin"
import { FontFormatToolbarPlugin } from "./toolbar/font-format-toolbar-plugin"
import { FontSizeToolbarPlugin } from "./toolbar/font-size-toolbar-plugin"
import { HistoryToolbarPlugin } from "./toolbar/history-toolbar-plugin"
import { LinkToolbarPlugin } from "./toolbar/link-toolbar-plugin"
import { SubSuperToolbarPlugin } from "./toolbar/subsuper-toolbar-plugin"
import { ToolbarPlugin } from "./toolbar/toolbar-plugin"
import { TypingPerfPlugin } from "./typing-pref-plugin"
import { ALL_TRANSFORMERS } from "../transformers"
import { useEditorConfig } from "../context/editor-config-context"
import { Separator } from "../editor-ui/separator"

export function Plugins({}) {
  const {
    editorClassName,
    maxLength,
    placeholder = "Press / for commands...",
    readOnly = false,
    contentOnly = false,
  } = useEditorConfig()
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null)
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false)

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  return (
    <div className="relative">
      {!contentOnly && <ToolbarPlugin>
        {({ blockType }) => (
          <div className="vertical-align-middle sticky top-0 z-10 flex items-center gap-2 overflow-auto border-b p-1">
            <HistoryToolbarPlugin />
            <Separator orientation="vertical" className="!h-7" />
            <BlockFormatDropDown>
              <FormatParagraph />
              <FormatHeading levels={["h1", "h2", "h3"]} />
              <FormatNumberedList />
              <FormatBulletedList />
              <FormatCheckList />
              <FormatCodeBlock />
              <FormatQuote />
            </BlockFormatDropDown>
            {blockType === "code" ? (
              <CodeLanguageToolbarPlugin />
            ) : (
              <>
                <FontFamilyToolbarPlugin />
                <FontSizeToolbarPlugin />
                <Separator orientation="vertical" className="!h-7" />
                <FontFormatToolbarPlugin />
                <Separator orientation="vertical" className="!h-7" />
                <SubSuperToolbarPlugin />
                <LinkToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
                <Separator orientation="vertical" className="!h-7" />
                <ClearFormattingToolbarPlugin />
                <Separator orientation="vertical" className="!h-7" />
                <FontColorToolbarPlugin />
                <FontBackgroundToolbarPlugin />
                <Separator orientation="vertical" className="!h-7" />
                <ElementFormatToolbarPlugin />
                <Separator orientation="vertical" className="!h-7" />
                <BlockInsertPlugin>
                  <InsertHorizontalRule />
                  <InsertImage />
                  <InsertTable />
                  <InsertColumnsLayout />
                  <InsertEmbeds />
                </BlockInsertPlugin>
              </>
            )}
          </div>
        )}
      </ToolbarPlugin>}
      <div className="relative">
        {!readOnly && <AutoFocusPlugin />}
        <RichTextPlugin
          contentEditable={
            <div className="">
              <div className="" ref={onRef}>
                <ContentEditable
                  placeholder={placeholder}
                  className={cn(
                    "ContentEditable__root relative block h-[calc(100vh-570px)] min-h-72 overflow-auto px-8 py-4 focus:outline-none",
                    editorClassName
                  )}
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <ClickableLinkPlugin />
        <CheckListPlugin />
        <HorizontalRulePlugin />
        <TablePlugin />
        <ListPlugin />
        <TabIndentationPlugin />
        <HashtagPlugin />
        <HistoryPlugin />

        <MentionsPlugin />
        <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
        <KeywordsPlugin />
        <EmojisPlugin />
        <ImagesPlugin />

        <LayoutPlugin />

        <AutoEmbedPlugin />
        <TwitterPlugin />
        <YouTubePlugin />

        <CodeHighlightPlugin />
        <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />

        <MarkdownShortcutPlugin
          transformers={ALL_TRANSFORMERS}
        />
        <TypingPerfPlugin />
        <TabFocusPlugin />
        <AutocompletePlugin />
        <AutoLinkPlugin />
        <LinkPlugin />

        <ComponentPickerMenuPlugin
          baseOptions={[
            ParagraphPickerPlugin(),
            HeadingPickerPlugin({ n: 1 }),
            HeadingPickerPlugin({ n: 2 }),
            HeadingPickerPlugin({ n: 3 }),
            TablePickerPlugin(),
            CheckListPickerPlugin(),
            NumberedListPickerPlugin(),
            BulletedListPickerPlugin(),
            QuotePickerPlugin(),
            CodePickerPlugin(),
            DividerPickerPlugin(),
            EmbedsPickerPlugin({ embed: "tweet" }),
            EmbedsPickerPlugin({ embed: "youtube-video" }),
            ImagePickerPlugin(),
            ColumnsLayoutPickerPlugin(),
            AlignmentPickerPlugin({ alignment: "left" }),
            AlignmentPickerPlugin({ alignment: "center" }),
            AlignmentPickerPlugin({ alignment: "right" }),
            AlignmentPickerPlugin({ alignment: "justify" }),
          ]}
          dynamicOptionsFn={DynamicTablePickerPlugin}
        />

        <ContextMenuPlugin />
        <DragDropPastePlugin />
        <EmojiPickerPlugin />

        <FloatingLinkEditorPlugin
          anchorElem={floatingAnchorElem}
          isLinkEditMode={isLinkEditMode}
          setIsLinkEditMode={setIsLinkEditMode}
        />
        <FloatingTextFormatToolbarPlugin
          anchorElem={floatingAnchorElem}
          setIsLinkEditMode={setIsLinkEditMode}
        />

        <ListMaxIndentLevelPlugin />
      </div>
      {!contentOnly && <ActionsPlugin>
        <div className="clear-both flex items-center justify-between gap-2 overflow-auto border-t p-1">
          <div className="flex flex-1 justify-start">
            {typeof maxLength === "number" && maxLength > 0 && (
              <>
                <MaxLengthPlugin maxLength={maxLength} />
                <CharacterLimitPlugin maxLength={maxLength} charset="UTF-16" />
              </>
            )}
          </div>
          <div>
            <CounterCharacterPlugin charset="UTF-16" />
          </div>
          <div className="flex flex-1 justify-end">
            <SpeechToTextPlugin />
            <ShareContentPlugin />
            <ImportExportPlugin />
            <MarkdownTogglePlugin
              shouldPreserveNewLinesInMarkdown={true}
              transformers={ALL_TRANSFORMERS}
            />
            {!readOnly && <EditModeTogglePlugin />}
            {!readOnly && (
              <>
                <ClearEditorActionPlugin />
                <ClearEditorPlugin />
              </>
            )}
            {import.meta.env.DEV && <TreeViewPlugin />}
          </div>
        </div>
      </ActionsPlugin>}
    </div>
  )
}







