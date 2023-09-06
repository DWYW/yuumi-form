import { EditorView, basicSetup } from "codemirror"
import { EditorState, Compartment } from "@codemirror/state"
import { json } from "@codemirror/lang-json"

export function useToolbar() {
  /** ----------- show schema config ----------- */
  let editorView: EditorView|null = null

  function destroyEditor() {
    if (!editorView) return
    editorView.destroy()
  }

  function createEditor(el: Element, doc: string) {
    const language = new Compartment()
    editorView = new EditorView({
      state: EditorState.create({
        doc: doc,
        extensions: [
          basicSetup,
          language.of(json()),
          EditorView.editable.of(false)
        ]
      }),
      parent: el
    })
  }

  return {
    createEditor,
    destroyEditor
  }
}