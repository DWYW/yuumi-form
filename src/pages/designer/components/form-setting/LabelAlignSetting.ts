import { computed, defineComponent, h, resolveComponent } from "vue"
import { useI18n } from "vue-i18n"
import { useSchema } from "@/pages/designer/useSchema"

export default defineComponent({
  name: "LabelAlignSetting",
  setup() {
    const { t } = useI18n()
    const staticText = computed(() => ({
      fieldName: t("ATTR_NAME.LABEL_ALIGN"),
      alignLeft: t("ALIGN.LEFT"),
      alignCenter: t("ALIGN.CENTER"),
      alignRight: t("ALIGN.RIGHT")
    }))
    const { getForm, updateFormPropertyValue } = useSchema()
    const propertyValue = computed(() => {
      return getForm().labelAlign
    })
    function onChange(value: string) {
      updateFormPropertyValue("labelAlign", value)
    }
    return { staticText, propertyValue, onChange }
  },
  render() {
    const { staticText } = this

    return h("div", { class: "row _center" }, [
      h("div", { class: "row__prefix" }, [staticText.fieldName]),
      h("div", { class: "row__content" }, [
        h(resolveComponent("YuumiRadioGroup"), {
          modelValue: this.propertyValue,
          "onUpdate:modelValue": this.onChange
        }, () => [
          h(resolveComponent("YuumiRadio"), {
            unique: "left",
            style: { marginRight: "16px" }
          }, () => staticText.alignLeft),
          h(resolveComponent("YuumiRadio"), {
            unique: "center",
            style: { marginRight: "16px" }
          }, () => staticText.alignCenter),
          h(resolveComponent("YuumiRadio"), {
            unique: "right"
          }, () => staticText.alignRight)
        ])
      ])
    ])
  }
})