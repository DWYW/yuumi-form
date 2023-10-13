import { string2date } from "@/common/moment"
import type { EventEffectConditionSchema, EventEffectSchema, Property, Match } from "@/pages/designer/share/useEventEffect"
import type { FieldItem } from "@/pages/designer/share/type"

interface UseEventEffectOption {
  getter: (type: Property) => (uid:string) => any,
  setter: (type: Property) => (uid: string, value: any) => void
}

export function useEventEffect({ getter, setter }: UseEventEffectOption) {
  function conditionMatchValidate(value: any, target: any, match: Match): boolean {
    const validateMap: {[K in Match]: () => boolean} = {
      eq: () => value === target,
      gt: () => Number(value) > Number(target),
      lt: () => Number(value) < Number(target),
      gte: () => Number(value) >= Number(target),
      lte: () => Number(value) <= Number(target),
      ne: () => value !== target,
      include: () => new RegExp(target).test(value.toString()),
      exclude: () => !new RegExp(target).test(value.toString())
    }
    return validateMap[match]()
  }

  function conditionValidate(condition: EventEffectConditionSchema): boolean {
    function getValidator (type: Property) {
      return () => {
        const _value = getter(type)(condition.fieldId)
        const _match = condition.match as Match
        return conditionMatchValidate(_value, condition.value, _match)
      }
    }

    const validateMap: {[K in Property]: () => boolean} = {
      value: getValidator("value"),
      required: getValidator("required"),
      visible: getValidator("visible"),
      disabled: getValidator("disabled"),
      readonly: getValidator("readonly")
    }
    return condition.property ? validateMap[condition.property]() : false
  }

  function effectExec({ fieldId, property, value }: EventEffectSchema, field?: FieldItem): void {
    if (!property || !field) return

    if (property === "value") {
      const getters: {[x:string]: () => any} = {
        timepicker: () => string2date(<string>value, field.props.format),
        datepicker: () => string2date(<string>value, field.props.format)
      }
      const _value = getters[field.type] ? getters[field.type]() : value
      setter(property)(fieldId, _value)
    } else {
      setter(property)(fieldId, value)
    }
  }

  return {
    conditionValidate,
    effectExec
  }
}