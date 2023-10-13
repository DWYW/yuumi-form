import { computed, defineComponent, h, resolveComponent } from "vue"
import { useI18n } from "vue-i18n"
import { useFields } from "@/pages/designer/share/useFields"

export default defineComponent({
  name: "RequiredSetting",
  setup() {
    const { t } = useI18n()
    const staticText = computed(() => ({
      fieldName: t("ATTR_NAME.REQUIRED"),
      faultPrompt: t("ATTR_NAME.FAULT_PROMPT"),
    }))
    const { updateSelectedFieldPropertyValue, getSelectedField } = useFields()

    const isRequired = computed(() => {
      return getSelectedField()?.required || false
    })
    function onRequiredChange(value: string) {
      updateSelectedFieldPropertyValue("required", value)
    }

    const requiredMsg = computed(() => {
      return getSelectedField()?.requiredMsg || ""
    })
    function onRequiredMsgChange(e: InputEvent) {
      updateSelectedFieldPropertyValue("requiredMsg", (<HTMLInputElement>e.target).value)
    }

    return { staticText, isRequired, requiredMsg,  onRequiredChange, onRequiredMsgChange }
  },
  render() {
    return [
      h("div", { class: "row _center" }, [
        h("div", { class: "row__prefix" }, [this.staticText.fieldName]),
        h("div", { class: "row__content" }, [
          h(resolveComponent("YuumiSwitch"), {
            size: "xm",
            modelValue: this.isRequired,
            onChange: this.onRequiredChange
          })
        ])
      ]),
      h("div", { class: "row _center" }, [
        h("div", { class: "row__prefix" }, [this.staticText.faultPrompt]),
        h("div", { class: "row__content" }, [
          h(resolveComponent("YuumiInput"), {
            modelValue: this.requiredMsg,
            onChange: this.onRequiredMsgChange
          })
        ])
      ]),
    ]
  }
})