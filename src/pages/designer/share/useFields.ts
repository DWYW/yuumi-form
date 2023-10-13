import { ref } from "vue"
import { randomString, setPropertyValue } from "@/common/helper"
import type { Ref } from "vue"
import type { FieldItem, FieldItemProps, DynamicOptions } from "./type"

class FieldItemSchema implements FieldItem {
  uid!: string
  name!: string
  type!: string
  options: { label: string, value: string | number | boolean }[] = []
  props!: FieldItemProps
  defaultValue?: any = undefined
  required = false
  visiible: boolean = true
  style: { [x: string]: string } = {}
  align: "left" | "center" | "right" = "left"
  optionsSource: "static"|"remote" = "static"
  dynamicOptions?: DynamicOptions

  constructor(options?: { [x: string]: any }) {
    this.name = options ? (options.name || "") : ""
    this.type = options ? (options.type || "") : ""
    this.uid = randomString()
    this.props = this.generateProps()
    if (this.type === "button") {
      this.align = "center"
    }
  }

  private generateProps() {
    const generateFunMap: { [x: string]: () => FieldItemProps } = {
      button: () => ({ theme: "primary" }),
      timepicker: () => ({ format: "hh:mm:ss", range: false }),
      datepicker: () => ({ format: "YYYY-MM-DD", type: "date" })
    }

    if (!this.type || !generateFunMap[this.type]) {
      return {}
    }

    return generateFunMap[this.type]()
  }
}


const fields: Ref<FieldItem[]> = ref([])
const selectFieldUID: Ref<string> = ref("")

export function useFields() {
  function addField(field: FieldItem, index?: number) {
    fields.value.splice(index || 0, 0, field)
  }

  function deleteField(uid: string) {
    const index = fields.value.findIndex((item) => item.uid === uid)
    if (index > -1) {
      fields.value.splice(index, 1)
    }
  }

  function getField(uid: string) {
    return fields.value.find((item) => item.uid === uid)
  }

  function updatePosition(newIndex: number, oldIndex: number) {
    fields.value.splice(newIndex, 0, fields.value.splice(oldIndex, 1)[0])
  }

  function updateSelectedFieldPropertyValue(path: string, value: any) {
    const field = getField(selectFieldUID.value)
    if (!field) return
    setPropertyValue(field, path, value)
  }

  function selectedFieldAddOption() {
    const field = getField(selectFieldUID.value)
    if (!field) return
    field.options.push({ label: "new option item", value: randomString() })
  }

  function selectedFieldDeleteOption(index: number) {
    const field = getField(selectFieldUID.value)
    if (!field) return
    field.options.splice(index, 1)
  }

  function selectedFieldUpdateOption(detail: { value: string; index:number; type: "key"|"value" }) {
    const field = getField(selectFieldUID.value)
    if (!field) return

    const methods = {
      key: () => setPropertyValue(field, `options[${detail.index}].label`, detail.value),
      value: () => setPropertyValue(field, `options[${detail.index}].value`, detail.value)
    }
    methods[detail.type]()
  }

  function selectedFieldUpdateOptionPosition(newIndex: number, oldIndex: number) {
    const field = getField(selectFieldUID.value)
    if (!field) return
    field.options.splice(newIndex, 0, field.options.splice(oldIndex, 1)[0])
  }

  return {
    setSelectedFieldUID: (uid: string) => selectFieldUID.value = uid,
    getSelectedFieldUID: () => selectFieldUID.value,
    getSelectedField: () => getField(selectFieldUID.value),
    getFields: () => fields.value,
    generateField: (name?: string, type?: string) => new FieldItemSchema({ name, type }),
    addField,
    deleteField,
    getField,
    updatePosition,
    updateSelectedFieldPropertyValue,
    selectedFieldAddOption,
    selectedFieldDeleteOption,
    selectedFieldUpdateOption,
    selectedFieldUpdateOptionPosition
  }
}