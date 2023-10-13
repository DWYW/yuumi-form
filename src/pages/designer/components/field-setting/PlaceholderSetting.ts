import { computed, defineComponent, h, resolveComponent } from "vue"
import { useI18n } from "vue-i18n"
import { useFields } from "@/pages/designer/share/useFields"

export default defineComponent({
  name: "PlaceholderSetting",
  setup() {
    const { t } = useI18n()
    const staticText = computed(() => ({
      fieldName: t("ATTR_NAME.PLACEHOLDER")
    }))

    const { updateSelectedFieldPropertyValue, getSelectedField } = useFields()
    const propertyValue = computed(() => {
      return getSelectedField()?.props.placeholder || ""
    })
    function onChange(e: InputEvent) {
      const _value = (<HTMLInputElement>e.target).value
      // 将""转为 undefined，解决不显示默认提示的问题
      updateSelectedFieldPropertyValue("props.placeholder", _value ? _value : void 0)
    }
    return { staticText, propertyValue, onChange }
  },
  render() {
    return h("div", { class: "row _center" }, [
      h("div", { class: "row__prefix" }, [this.staticText.fieldName]),
      h("div", { class: "row__content" }, [
        h(resolveComponent("YuumiInput"), {
          modelValue: this.propertyValue,
          onChange: this.onChange
        })
      ])
    ])
  }
})

