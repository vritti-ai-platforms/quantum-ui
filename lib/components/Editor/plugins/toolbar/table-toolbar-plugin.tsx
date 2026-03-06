"use client"

import { TableIcon } from "lucide-react"

import { useToolbarContext } from "../../context/toolbar-context"
import { InsertTableDialog } from "../table-plugin"
import { Button } from "../../editor-ui/button"

export function TableToolbarPlugin() {
  const { activeEditor, showModal } = useToolbarContext()

  return (
    <Button
      onClick={() =>
        showModal("Insert Table", (onClose) => (
          <InsertTableDialog activeEditor={activeEditor} onClose={onClose} />
        ))
      }
      size={"icon-sm"}
      variant={"outline"}
      className=""
    >
      <TableIcon className="size-4" />
    </Button>
  )
}






