import { useI18n } from "vue-i18n"
import { EventEffectConditionSchema, EventEffectSchema } from "./useEventEffect"
import { useOptions } from "./useOpions"
import type { FieldItem } from "./type"

interface UseSemanticOption {
  getField: (uid: string) => FieldItem | undefined
  getFieldRemoteOptions: (uid: string) => any[]
}

export function useSemantic({ getField, getFieldRemoteOptions }: UseSemanticOption) {
  const { t } = useI18n()
  const { switchOptions, getMatchName, getPropertyName, getRequiredName, getDisabledName, getReadonlyName, getVisibleName } = useOptions()

  function propertyValueSemantic(value: any, property: string, options: any[] = []) {
    // true => "1" false => "0"
    let res = typeof value === "boolean" ? Number(value).toString(): value

    switch (property) {
      case "value":
        if (options.length > 0) {
          if (value instanceof Array) {
            res = res.map((target: any) => {
              const option = options.find((item) => item.value === target)
              if (option) {
                return option.label
              }
            })
          } else {
            const option = options.find((item) => item.value === res)
            if (option) {
              res = option.label
            }
          }
        }
        break
      case "required":
        res = getRequiredName(res)
        break
      case "disabled":
        res = getDisabledName(res)
        break
      case "readonly":
        res = getReadonlyName(res)
        break
      case "visible":
        res = getVisibleName(res)
        break
    }

    return res
  }

  function conditionSemantic(condition: EventEffectConditionSchema) {
    const field = getField(condition.fieldId)
    if (!field) return ""

    const optionsData = field.optionsSource === "remote" ? getFieldRemoteOptions(field.uid) : field.options
    return t("MESSAGE.CONDITION_SEMANTIC", {
      fieldName: field.name,
      propertyName: getPropertyName(condition.property).toLowerCase(),
      matchName: getMatchName(condition.match).toLowerCase(),
      propertyValue: propertyValueSemantic(condition.value, condition.property, field.type === "switch" ? switchOptions.value : optionsData),
    })
  }

  function effectSemantic(effect: EventEffectSchema) {
    const field = getField(effect.fieldId)
    if (!field) return null
    const optionsData = field.optionsSource === "remote" ? getFieldRemoteOptions(field.uid) : field.options

    const conditionText = effect.conditions.map((condition) => {
      return conditionSemantic(condition)
    }).filter((item) => !!item).join(` ${t("RELATION.AND")} `)

    return t("MESSAGE.EFFECT_SEMANTIC", {
      condition: `${t("RELATION.IF")} ${conditionText}`,
      fieldName: field.name,
      propertyName: getPropertyName(effect.property).toLowerCase(),
      propertyValue: propertyValueSemantic(effect.value, effect.property, field.type === "switch" ? switchOptions.value : optionsData)
    })
  }

  return { conditionSemantic, effectSemantic }
}