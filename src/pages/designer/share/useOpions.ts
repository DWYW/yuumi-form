import { Ref, computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useFields } from "./useFields"
import type { FieldItem } from "./type"

const fieldsRemoteOptions: Ref<{[K:string]: any[]}> = ref({})

export function useOptions() {
  const { t } = useI18n()
  const { getFields } = useFields()

  const fieldOptions = computed(() => {
    return getFields().map((field) => ({ label: field.name, value: field.uid }))
  })

  const propertyOptions = computed(() => {
    return [
      { label: t("OPTION.VALUE"), value: 'value'},
      { label: t("OPTION.REQUIRED"), value: 'required'},
      { label: t("OPTION.VISIBLE"), value: 'visible'},
      { label: t("OPTION.DISABLED"), value: 'disabled'},
      { label: t("OPTION.READONLY"), value: 'readonly'}
    ]
  })

  const operatorOptions = computed(() => {
    return [
      { label: t("OPTION.EQ"), value: 'eq'},
      { label: t("OPTION.GT"), value: 'gt'},
      { label: t("OPTION.LT"), value: 'lt'},
      { label: t("OPTION.GTE"), value: 'gte'},
      { label: t("OPTION.LTE"), value: 'lte'},
      { label: t("OPTION.NE"), value: 'ne'},
      { label: t("OPTION.INCLUDE"), value: 'include'},
      { label: t("OPTION.EXCLUE"), value: 'exclude'}
    ]
  })

  const switchOptions = computed(() => {
    return [
      { label: t("OPTION.OPEN"), value: "1" },
      { label: t("OPTION.CLOSE"), value: "0" }
    ]
  })

  const requiredOptions = computed(() => [
    { label: t("OPTION.REQUIRED"), value: "1" },
    { label: t("OPTION.NOT_REQUIRED"), value: "0" },
  ])

  const disabledOptions = computed(() => [
    { label: t("OPTION.DISABLED"), value: "1" },
    { label: t("OPTION.AVAILABLE"), value: "0" },
  ])

  const visibleOptions = computed(() => [
    { label: t("OPTION.VISIBLE"), value: "1" },
    { label: t("OPTION.HIDDEN"), value: "0" },
  ])

  const readonlyOptions = computed(() => [
    { label: t("OPTION.READONLY"), value: "1" },
    { label: t("OPTION.READ_WRITE"), value: "0" },
  ])

  const getPropertyName = (value: string) => {
    const option = propertyOptions.value.find((item) => item.value === value)
    return option ? option.label : ""
  }

  const getMatchName = (value: string) => {
    const option = operatorOptions.value.find((item) => item.value === value)
    return option ? option.label : ""
  }

  const getSwitchName = (value: string|boolean) => {
    return Number(value) ? t("OPTION.REQUIRED") : t("OPTION.NOT_REQUIRED")
  }

  const getRequiredName = (value: string|boolean) => {
    return Number(value) ? t("OPTION.OPEN") : t("OPTION.CLOSE")
  }

  const getDisabledName = (value: string|boolean) => {
    return Number(value) ? t("OPTION.DISABLED") : t("OPTION.HIDDEN")
  }

  const getVisibleName = (value: string|boolean) => {
    return Number(value) ? t("OPTION.VISIBLE") : t("OPTION.HIDDEN")
  }

  const getReadonlyName = (value: string|boolean) => {
    return Number(value) ? t("OPTION.READONLY") : t("OPTION.READ_WRITE")
  }

  const getFieldRemoteOptions = (uid: string) => {
    return fieldsRemoteOptions.value[uid] || []
  }

  const deleteFieldRemoteOptions = (uid: string) => {
    delete fieldsRemoteOptions.value[uid]
  }

  const updateFieldRemoteOptions = ({uid, dynamicOptions }: FieldItem): Promise<any> => {
    return Promise.resolve(dynamicOptions).then((option: any) => {
      if (!option.method || !option.url || !option.contentType) return
      let headers = {
        "Content-Type": option.contentType
      }

      if (option.headersSetter) {
        try {
          const setter = new Function("headers", option.headersSetter)
          headers = setter(headers)
        } catch(err) {
          console.warn("headers setter parse failed.")
        }
      }

      return fetch(option.url, {
        method: option.method,
        headers
      }).then((response) => response.json())
        .then((result) => {
          if (option.responseParse) {
            try {
              const responseParse = new Function("response", option.responseParse)
              result = responseParse(result)
            } catch(err) {
              console.warn("response parse failed.")
            }
          }

          fieldsRemoteOptions.value[uid] = result
        })
    })
  }

  return {
    fieldOptions,
    propertyOptions,
    operatorOptions,
    switchOptions,
    requiredOptions,
    disabledOptions,
    visibleOptions,
    readonlyOptions,
    getPropertyName,
    getMatchName,
    getSwitchName,
    getRequiredName,
    getDisabledName,
    getVisibleName,
    getReadonlyName,
    getFieldRemoteOptions,
    deleteFieldRemoteOptions,
    updateFieldRemoteOptions
  }
}