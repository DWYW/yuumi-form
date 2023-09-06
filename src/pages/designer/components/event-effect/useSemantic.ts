import { useI18n } from "vue-i18n"
import { EventEffectConditionSchema, EventEffectSchema } from "@/pages/designer/useEventEffect"
import { useOptions } from "./useOpions"
import type { FieldItem } from "@/pages/designer/share"

interface UseSemanticOption {
  getFieldWithUID: (uid: string) => FieldItem | undefined
}

export function useSemantic({ getFieldWithUID }: UseSemanticOption) {
  const { t } = useI18n()
  const { switchOptions, getMatchName, getPropertyName, getRequiredName, getDisabledName, getReadonlyName, getVisibleName } = useOptions()

  function propertyValueSemantic(value: any, property: string, options: any[] = []) {
    // true => "1" false => "0"
    let res = typeof value === "boolean" ? Number(value).toString(): value

    switch (property) {
      case "value":
        if (options.length > 0) {
          const option = options.find((item) => item.value === res)
          if (option) {
            res = option.label
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
    const field = getFieldWithUID(condition.fieldId)
    if (!field) return ""

    return t("MESSAGE.CONDITION_SEMANTIC", {
      fieldName: field.name,
      propertyName: getPropertyName(condition.property).toLowerCase(),
      matchName: getMatchName(condition.match).toLowerCase(),
      propertyValue: propertyValueSemantic(condition.value, condition.property, field.type === "switch" ? switchOptions.value : field.options),
    })
  }

  function effectSemantic(effect: EventEffectSchema) {
    const field = getFieldWithUID(effect.fieldId)
    if (!field) return null

    const conditionText = effect.conditions.map((condition) => {
      return conditionSemantic(condition)
    }).filter((item) => !!item).join(` ${t("RELATION.AND")} `)


    return t("MESSAGE.EFFECT_SEMANTIC", {
      condition: `${t("RELATION.IF")} ${conditionText}`,
      fieldName: field.name,
      propertyName: getPropertyName(effect.property).toLowerCase(),
      propertyValue: propertyValueSemantic(effect.value, effect.property, field.type === "switch" ? switchOptions.value : field.options)
    })
  }

  return { conditionSemantic, effectSemantic }
}