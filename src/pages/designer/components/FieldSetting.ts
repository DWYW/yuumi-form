import { computed, defineComponent, h, resolveComponent } from "vue"
import InputEditor from "./field-setting/Input"
import SelectEditor from "./field-setting/Select"
import RadioEditor from "./field-setting/Radio"
import CheckboxEditor from "./field-setting/Checkbox"
import SwtichEditor from "./field-setting/Switch"
import TimePickerEditor from "./field-setting/TimePicker"
import DatePickerEditor from "./field-setting/DatePicker"
import ButtonEditor from "./field-setting/Button"
import type { VNode } from "vue"
import { useSchema } from "../useSchema"

export default defineComponent({
  name: "FieldSetting",
  setup() {
    const { getSelectedField } = useSchema()
    const field = computed(() => getSelectedField())
    return { field }
  },
  render() {
    if (!this.field) return null
    const { type } = this.field

    const renderRuler: { [x: string]: () => VNode } = {
      input: () => h(InputEditor),
      select: () => h(SelectEditor),
      radio: () => h(RadioEditor),
      checkbox: () => h(CheckboxEditor),
      switch: () => h(SwtichEditor),
      timepicker: () => h(TimePickerEditor),
      datepicker: () => h(DatePickerEditor),
      button: () => h(ButtonEditor)
    }

    return renderRuler[type] ? h(
      resolveComponent("YuumiScrollbar"),
      null,
      () => renderRuler[type]()
    ) : null
  }
})