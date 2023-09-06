import { computed, defineComponent, h } from "vue"
import { useI18n } from "vue-i18n"
import NameSetting from "./NameSetting"
import RequiredSetting from "./RequiredSetting"
import DisabledSetting from "./DisabledSetting"
import OptionsSetting from "./OptionsSetting"

export default defineComponent({
  name: "RadioFieldSetting",
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
      h(RequiredSetting),
      h(DisabledSetting),
      h(OptionsSetting)
    ]
  }
})