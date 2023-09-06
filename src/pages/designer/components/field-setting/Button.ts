import { computed, defineComponent, h } from "vue"
import { useI18n } from "vue-i18n"
import ThemeSetting from "./ThemeSetting"
import SizeSetting from "./SizeSetting"
import PlainSetting from "./PlainSetting"
import SplashSetting from "./SplashSetting"
import DisabledSetting from "./DisabledSetting"
import RoundSetting from "./RoundSetting"

export default defineComponent({
  name: "ButtonFieldSetting",
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
      h(ThemeSetting),
      h(SizeSetting),
      h(PlainSetting),
      h(SplashSetting),
      h(DisabledSetting),
      h(RoundSetting)
    ]
  }
})