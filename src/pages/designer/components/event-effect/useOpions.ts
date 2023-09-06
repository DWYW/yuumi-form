import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useSchema } from "@/pages/designer/useSchema"

export function useOptions() {
  const { t } = useI18n()
  const { getFields } = useSchema()

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
    getReadonlyName
  }
}