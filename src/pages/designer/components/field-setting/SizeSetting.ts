import { computed, defineComponent, h, resolveComponent } from "vue"
import { useI18n } from "vue-i18n"
import { useSchema } from "@/pages/designer/useSchema"
import type { OptionItem } from "@/pages/designer/share"

export default defineComponent({
  name: "SizeSetting",
  setup() {
    const { t } = useI18n()
    const staticText = computed(() => ({
      fieldName: t("ATTR_NAME.SIZE")
    }))
    const optionsData = computed(() => ["xl", "lg", "md", "sm", "xm"].map((v) => ({
      label: v,
      value: v
    })))
    const { updateSelectedFieldPropertyValue, getSelectedField } = useSchema()
    const propertyValue = computed(() => {
      return getSelectedField()?.props.size || "md"
    })
    function onChange({ value }: OptionItem) {
      updateSelectedFieldPropertyValue("props.size", value)
    }
    return { staticText, optionsData, propertyValue, onChange }
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