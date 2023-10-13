import { computed, defineComponent, h, resolveComponent } from "vue"
import { useI18n } from "vue-i18n"
import { useFields } from "@/pages/designer/share/useFields"
import type { OptionItem } from "@/pages/designer/share/type"

export default defineComponent({
  name: "DatePickerTypeSetting",
  setup() {
    const { t } = useI18n()
    const optionsData = computed(() => ["date", "datetime", "range", "rangetime"].map((v) => ({
      label: v,
      value: v
    })))
    const staticText = computed(() => ({
      fieldName: t("ATTR_NAME.TYPE")
    }))

    const { updateSelectedFieldPropertyValue, getSelectedField } = useFields()
    const propertyValue = computed(() => {
      return getSelectedField()?.props.type || "date"
    })
    function onChange({ value }: OptionItem) {
      updateSelectedFieldPropertyValue("props.type", value)
      // 改变format
      updateSelectedFieldPropertyValue("props.format", /time/.test(value.toString()) ? "YYYY-MM-DD hh:mm:ss" : "YYYY-MM-DD")
    }
    return { optionsData, staticText, propertyValue, onChange}
  },
  render() {
    return h("div", { class: "row _center" }, [
      h("div", { class: "row__prefix" }, [this.staticText.fieldName]),
      h("div", { class: "row__content" }, [
        h(resolveComponent("YuumiSelect"), {
          modelValue: this.propertyValue,
          options: this.optionsData,
          onChange: this.onChange
        })
      ])
    ])
  }
})