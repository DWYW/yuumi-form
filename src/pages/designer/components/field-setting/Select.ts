import { computed, defineComponent, h } from "vue"
import { useI18n } from "vue-i18n"
import NameSetting from "./NameSetting"
import ThemeSetting from "./ThemeSetting"
import SizeSetting from "./SizeSetting"
import DisabledSetting from "./DisabledSetting"
import ReadonlySetting from "./ReadonlySetting"
import OptionsSetting from "./OptionsSetting"
import RequiredSetting from "./RequiredSetting"
import PlaceholderSetting from "./PlaceholderSetting"
import ClearableSetting from "./ClearableSetting"

export default defineComponent({
  name: "SelectFieldSetting",
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
      h(ThemeSetting),
      h(SizeSetting),
      h(PlaceholderSetting),
      h(RequiredSetting),
      h(DisabledSetting),
      h(ReadonlySetting),
      h(ClearableSetting),
      h(OptionsSetting)
    ]
  }
})