import { computed, defineComponent, h } from "vue"
import { useI18n } from "vue-i18n"
import NameSetting from "./NameSetting"
import SizeSetting from "./SizeSetting"
import DisabledSetting from "./DisabledSetting"
import ReadonlySetting from "./ReadonlySetting"

export default defineComponent({
  name: "SwitchFieldSetting",
  setup() {
    const { t } = useI18n()
    const staticText = computed(() => {
      return {
        title: t("TITLE.BASE_SETTING")
      }
    })

    return { staticText }
  },
  render() {
    return [
      h("div", { class: "setting__title" }, this.staticText.title),
      h(NameSetting),
      h(SizeSetting),
      h(DisabledSetting),
      h(ReadonlySetting)
    ]
  }
})