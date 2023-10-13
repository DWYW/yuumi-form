import { ref} from "vue"
import { setPropertyValue } from "@/common/helper"
import type { Ref } from "vue"
import type { FormConfig } from "./type"

class FormConfigSchema implements FormConfig{
  labelAlign: "left" | "center" | "right" = "right"
  constructor() { }
}

const form: Ref<FormConfig> = ref(new FormConfigSchema())

export function useForm() {
  function updateFormConfigPropertyValue(path: string, value: any) {
    setPropertyValue(form.value, path, value)
  }

  return {
    getFormConfig: (): FormConfig => form.value,
    updateFormConfigPropertyValue
  }
}