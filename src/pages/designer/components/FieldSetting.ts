import { computed, defineComponent, h, resolveComponent } from "vue"
import { useFields } from "../share/useFields"
import InputEditor from "./field-setting/Input"
import SelectEditor from "./field-setting/Select"
import RadioEditor from "./field-setting/Radio"
import CheckboxEditor from "./field-setting/Checkbox"
import SwtichEditor from "./field-setting/Switch"
import TimePickerEditor from "./field-setting/TimePicker"
import DatePickerEditor from "./field-setting/DatePicker"
import ButtonEditor from "./field-setting/Button"
import type { VNode } from "vue"

export default defineComponent({
  name: "FieldSetting",
  setup() {
    const { getSelectedField } = useFields()
    const fieldType = computed(() => {
      return getSelectedField()?.type
    })

    return { fieldType }
  },
  render() {
    const { fieldType } = this
    if (!fieldType) return null

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

    return renderRuler[fieldType] ? h(
      resolveComponent("YuumiScrollbar"),
      null,
      () => renderRuler[fieldType]()
    ) : null
  }
})