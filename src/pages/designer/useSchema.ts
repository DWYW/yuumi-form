import { ref } from "vue"
import { randomString, setPropertyValue } from "@/common/helper"
import type { Ref } from "vue"
import type { FieldItemProps, FieldItem } from "./share"

class FormSchema {
  labelAlign: "left" | "center" | "right" = "right"
  constructor() { }

  updatePropertyValue(path: string, value: any) {
    setPropertyValue(this, path, value)
  }
}

class FieldItemSchema {
  uid!: string
  name!: string
  type!: string
  options!: { label: string, value: string | number | boolean }[]
  props!: FieldItemProps
  defaultValue?: any = undefined
  required = false
  visiible: boolean = true
  style: { [x: string]: string } = {}
  align: "left" | "center" | "right" = "left"

  constructor(options?: { [x: string]: any }) {
    this.name = options ? (options.name || "") : ""
    this.type = options ? (options.type || "") : ""
    this.uid = randomString()
    this.options = this.generateWidgetSchemaOptions()
    this.props = this.generateWidgetSchemaProps()
    if (this.type === "button") {
      this.align = "center"
    }
  }

  generateWidgetSchemaProps() {
    const generateFunMap: { [x: string]: () => FieldItemProps } = {
      button: () => ({ theme: "primary" }),
      timepicker: () => ({ format: "hh:mm:ss", range: false }),
      datepicker: () => ({ format: "YYYY-MM-DD hh:mm:ss", type: "date" })
    }

    if (!this.type || !generateFunMap[this.type]) {
      return {}
    }

    return generateFunMap[this.type]()
  }

  generateWidgetSchemaOptions() {
    const generateDefaultOpotions = () => [
      { label: `option 1`, value: "1" },
      { label: `option 2`, value: "2" }
    ]
    const generateFunMap: { [x: string]: () => { label: string, value: string | number | boolean }[] } = {
      select: generateDefaultOpotions,
      radio: generateDefaultOpotions,
      checkbox: generateDefaultOpotions
    }

    if (!this.type || !generateFunMap[this.type]) {
      return []
    }

    return generateFunMap[this.type]()
  }
}

class FieldsSchema {
  selected = ""
  fields: FieldItem[] = []

  constructor(fields?: FieldItem[]) {
    if (fields) {
      this.fields = fields
    }
  }

  addFieldItem(index: number = 0, data: FieldItem) {
    this.fields.splice(index, 0, data)
  }

  getFieldWithUID(uid: string) {
    return this.fields.find((item) => item.uid === uid)
  }

  deleteFieldWithUID(uid: string) {
    const index = this.fields.findIndex((item) => item.uid === uid)
    if (index > -1) {
      this.fields.splice(index, 1)
    }
  }

  updatePosition(newIndex: number, oldIndex: number) {
    this.fields.splice(newIndex, 0, this.fields.splice(oldIndex, 1)[0])
  }

  updateSelectedFieldPropertyValue(path: string, value: any) {
    const field = this.getFieldWithUID(this.selected)
    if (!field) return
    setPropertyValue(field, path, value)
  }

  selectedFieldAddOption() {
    const field = this.getFieldWithUID(this.selected)
    if (!field) return
    field.options.push({ label: "option item", value: randomString() })
  }

  selectedFieldDeleteOption(index: number) {
    const field = this.getFieldWithUID(this.selected)
    if (!field) return
    field.options.splice(index, 1)
  }

  selectedFieldUpdateOption(detail: { value: string; index:number; type: "key"|"value" }) {
    const field = this.getFieldWithUID(this.selected)
    if (!field) return

    const methods = {
      key: () => setPropertyValue(field, `options[${detail.index}].label`, detail.value),
      value: () => setPropertyValue(field, `options[${detail.index}].value`, detail.value)
    }
    methods[detail.type]()
  }

  selectedFieldUpdateOptionPosition(newIndex: number, oldIndex: number) {
    const field = this.getFieldWithUID(this.selected)
    if (!field) return
    field.options.splice(newIndex, 0, field.options.splice(oldIndex, 1)[0])
  }
}

const fields: Ref<FieldsSchema> = ref(new FieldsSchema())
const form: Ref<FormSchema> = ref(new FormSchema())

export function useSchema() {
  return {
    generateField: (name?: string, type?: string) => new FieldItemSchema({ name, type }),
    addFieldWithIndex: (data: FieldItem, index?: number) => fields.value.addFieldItem(index, data),
    getFields: () => fields.value.fields,
    deleteField: (uid: string) => fields.value.deleteFieldWithUID(uid),
    getSelectedFieldUID: () => fields.value.selected,
    getFieldWithUID: (uid: string) => fields.value.getFieldWithUID(uid),
    setSelectedFieldUID: (uid: string) => fields.value.selected = uid,
    getSelectedField: () => fields.value.getFieldWithUID(fields.value.selected),
    updateFieldPosition: (newIndex: number, oldIndex: number) => fields.value.updatePosition(newIndex, oldIndex),
    updateSelectedFieldPropertyValue: (path: string, value: any) => fields.value.updateSelectedFieldPropertyValue(path, value),
    selectedFieldAddOption: () => fields.value.selectedFieldAddOption(),
    selectedFieldDeleteOption: (index: number) => fields.value.selectedFieldDeleteOption(index),
    selectedFieldUpdateOption: (detail: { value: string; index:number; type: "key"|"value" }) => fields.value.selectedFieldUpdateOption(detail),
    selectedFieldUpdateOptionPosition: (newIndex: number, oldIndex: number) => fields.value.selectedFieldUpdateOptionPosition(newIndex, oldIndex),
    getForm: (): FormSchema => form.value,
    updateFormPropertyValue: (path: string, value: any) => form.value.updatePropertyValue(path, value)
  }
}
