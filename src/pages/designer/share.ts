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

export interface FieldItem {
  uid: string;
  type: string;
  required: boolean;
  requiredMsg?: string;
  name: string;
  defaultValue?: any;
  props: FieldItemProps;
  options: {label: string, value: string|number|boolean}[];
  align?: "left"|"center"|"right";
  style?: {[x:string]: string};
  visiible?: boolean;
}

export interface OptionItem {
  label: string
  value: string|number
}
