import { computed, defineComponent, h, resolveComponent } from "vue"
import { useI18n } from "vue-i18n"
import { useFields } from "@/pages/designer/share/useFields"

export default defineComponent({
  name: "NameSetting",
  setup() {
    const { t } = useI18n()
    const staticText = computed(() => ({
      fieldName: t("ATTR_NAME.FIELD_NAME")
    }))
    const { updateSelectedFieldPropertyValue, getSelectedField } = useFields()
    const propertyValue = computed(() => {
      return getSelectedField()?.name || ""
    })
    function onChange(e: InputEvent) {
      updateSelectedFieldPropertyValue("name", (<HTMLInputElement>e.target).value)
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
