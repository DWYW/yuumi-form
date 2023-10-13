import { randomString } from "@/common/helper"
import { Ref, ref } from "vue"

export type Property = "value" | "required" | "visible" | "disabled" | "readonly"
export type Match = "eq" | "gt" | "lt" | "gte" | "lte" | "ne" | "include" | "exclude"
export type Value = string | number | boolean | Array<string | number | boolean>

export class EventEffectConditionSchema {
  uid: string
  fieldId: string
  property: Property | ""
  match: Match | ""
  value: Value

  constructor() {
    this.uid = randomString()
    this.fieldId = ""
    this.property = ""
    this.match = ""
    this.value = ""
  }
}

export class EventEffectSchema {
  uid: string
  fieldId: string
  property: Property | ""
  value: Value
  conditions: EventEffectConditionSchema[]

  constructor() {
    this.uid = randomString()
    this.fieldId = ""
    this.property = ""
    this.value = ""
    this.conditions = []
  }
}

export class EventEffects {
  effects: EventEffectSchema[]

  constructor(value?: EventEffectSchema[]) {
    this.effects = value || []
  }

  addEventEffect(value: EventEffectSchema) {
    this.effects.push(value)
  }

  updateEventEffect(value: EventEffectSchema) {
    const index = this.effects.findIndex((item) => item.uid === value.uid)
    if (index < 0) return
    this.effects[index] = value
  }

  deleteEventEffect(uid: string) {
    const index = this.effects.findIndex((item) => item.uid === uid)
    if (index < 0) return
    this.effects.splice(index, 1)
  }
}

const eventEffects: Ref<EventEffects> = ref(new EventEffects())

export function useEventEffect() {
  return {
    createEventEffect: () => new EventEffectSchema(),
    getEventEffects: () => eventEffects.value.effects,
    addEventEffect: (value: EventEffectSchema) => eventEffects.value.addEventEffect(value),
    updateEventEffect: (value: EventEffectSchema) => eventEffects.value.updateEventEffect(value),
    deleteEventEffect: (uid: string) => eventEffects.value.deleteEventEffect(uid)
  }
}