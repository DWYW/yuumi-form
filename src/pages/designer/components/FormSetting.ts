import { defineComponent, h, resolveComponent } from "vue"
import LabelAlignSetting from "./form-setting/LabelAlignSetting"

export default defineComponent({
  name: "FormSetting",
  render() {
    return  h(resolveComponent("YuumiScrollbar"), null, () => [
      h(LabelAlignSetting)
    ])
  }
})