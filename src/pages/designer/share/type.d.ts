export interface FieldItemProps {
  theme?: string
  size?: string
  outline?: boolean
  splash?: boolean
  round?: boolean
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  clearable?: boolean
  // timepicker
  range?: boolean
  // datepicker
  type?: string
  multiple?: boolean
  format?: string
}

export interface DynamicOptions {
  url: string
  method: string
  contentType: string
  headersSetter?: string,
  responseParse?: string
}

export interface FieldItem {
  uid: string
  name: string
  type: string
  props: FieldItemProps
  required: boolean
  options: {label: string, value: string|number|boolean}[]
  requiredMsg?: string
  defaultValue?: any
  align?: "left"|"center"|"right"
  style?: {[x:string]: string}
  visiible: boolean
  optionsSource: "static"|"remote"
  dynamicOptions?: DynamicOptions
}

export interface OptionItem {
  label: string
  value: string|number
}


export interface FormConfig {
  labelAlign: "left"|"center"|"right"
}