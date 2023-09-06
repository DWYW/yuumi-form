import { EventEffectConditionSchema, EventEffectSchema, Property, Match } from "@/pages/designer/useEventEffect"

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

  function effectExec({ fieldId, property, value }: EventEffectSchema): void {
    if (!property) return
    setter(property)(fieldId, value)
  }

  return {
    conditionValidate,
    effectExec
  }
}