import { computed, defineComponent, h, ref, resolveComponent } from "vue"
import { useI18n } from "vue-i18n"
import { createMessage } from "yuumi-ui-vue"
import { deepCopy } from "@/common/helper"
import { format, string2date } from "@/common/moment"
import { useSchema } from "../useSchema"
import { EventEffectSchema, EventEffectConditionSchema, useEventEffect, Value } from "../useEventEffect"
import { useOptions } from "./event-effect/useOpions"
import { useSemantic } from "./event-effect/useSemantic"
import type { Ref, VNode } from "vue"
import type { FieldItemProps } from "../share"

interface RenderValueComponentOption {
  multiple?: boolean
  range?: boolean
}

export default defineComponent({
  name: "EventEffect",
  setup() {
    const { t } = useI18n()
    const staticText = computed(() => ({
      add: t("HANDLER.ADD"),
      field: t("ATTR_NAME.FIELD"),
      property: t("ATTR_NAME.PROPERTY"),
      matchType: t("OPTION.MATCH_TYPE"),
      condition: t("TITLE.CONDITION"),
      conditionAddMsg: t("MESSAGE.CONDITION_ADD"),
      effect: t("TITLE.EFFECT"),
      confirm: t("HANDLER.CONFIRM"),
      completeCondition: t("MESSAGE.COMPLETE_CONDITION"),
      completeEffect: t("MESSAGE.COMPLETE_EFFECT")
    }))
    const { getFields, getFieldWithUID } = useSchema()
    const { fieldOptions, propertyOptions, operatorOptions, switchOptions, requiredOptions, disabledOptions, readonlyOptions, visibleOptions } = useOptions()
    const { effectSemantic } = useSemantic({ getFieldWithUID })
    const { createEventEffect, getEventEffects, addEventEffect, updateEventEffect, deleteEventEffect } = useEventEffect()
    const effects = computed(() => getEventEffects())
    function effectUpdateOrAdd(data: EventEffectSchema) {
      const index = effects.value.findIndex((item) => item.uid === data.uid)
      // 深拷贝，防止后续操作导致的意外问题
      const _value = deepCopy(data)
      index < 0 ? addEventEffect(_value) : updateEventEffect(_value)
    }

    const effect: Ref<EventEffectSchema> = ref(createEventEffect())
    function addCondition() {
      effect.value.conditions.push(new EventEffectConditionSchema())
    }
    function deleteCondition(index: number) {
      effect.value.conditions.splice(index, 1)
    }
    function resetEffect(value?: EventEffectSchema) {
      // 深拷贝，防止后续操作导致的意外问题
      effect.value = value ? deepCopy(value) : createEventEffect()
    }

    return {
      staticText,
      fieldOptions,
      propertyOptions,
      operatorOptions,
      switchOptions,
      requiredOptions,
      disabledOptions,
      readonlyOptions,
      visibleOptions,
      getFields,
      getFieldWithUID,
      effects,
      effectUpdateOrAdd,
      deleteEventEffect,
      effectSemantic,
      effect,
      addCondition,
      deleteCondition,
      resetEffect
    }
  },
  render() {
    const { staticText, fieldOptions, propertyOptions, operatorOptions, switchOptions, disabledOptions, readonlyOptions, requiredOptions, visibleOptions, effect } = this
    const fields = this.getFields()

    const renderCustomValueComponent = (value: Value, onUpdate: (v: Value) => void) => {
      return h(resolveComponent("YuumiInput"), {
        class: "_expand",
        clearable: true,
        modelValue: value,
        "onUpdate:modelValue": onUpdate
      })
    }

    const renderOptionValueComponent = (value: Value, onUpdate: (v: Value) => void) => {
      return (options: any[], multiple?: boolean) => {
        return h(resolveComponent("YuumiSelect"), {
          class: "_expand",
          clearable: true,
          modelValue: value,
          "onUpdate:modelValue": onUpdate,
          options: options,
          multiple: multiple
        })
      }
    }

    const renderBooleanValueComponent = (value: Value, onUpdate: (v: Value) => void) => {
      return (options: {label: string;value: string;}[]) => {
        return h(resolveComponent("YuumiSelect"), {
          class: "_expand",
          clearable: true,
          modelValue: typeof value === "string" ? value : Number(value).toString(),
          "onUpdate:modelValue": (v: string) => onUpdate(v === "1"),
          options
        })
      }
    }

    const renderTimePicerValueComponent = (value: Value, onUpdate: (v: Value) => void) => {
      return (props: FieldItemProps, option?: RenderValueComponentOption) => {
        const rule = props.format || "hh:mm:ss"
        // 条件不能选择区间
        const range = props.range && option?.range
        const modelValue = value instanceof Array ? value.map((item) => string2date(item.toString(), rule)) : (value ? string2date(value.toString(), rule) : undefined)

        return h(resolveComponent("YuumiTimePicker"), {
          class: "_expand",
          clearable: true,
          modelValue: modelValue,
          "onUpdate:modelValue": (v: Date) => {
            if (v instanceof Array) {
              onUpdate(v.map((item) => format(item, rule)))
            } else {
              onUpdate(v ? format(v, rule) : "")
            }
          },
          range
        })
      }
    }

    const renderDatePicerValueComponent = (value: Value, onUpdate: (v: Value) => void) => {
      return (props: FieldItemProps, option?: RenderValueComponentOption) => {
        // 条件不能选择区间
        const type = option?.range ? (props.type || "date") : (props.type || "date").replace("range", "")
        const rule = props.format || /time/.test(type) ? "YYYY-MM-DD hh:mm:ss" : "YYYY-MM-DD"
        const modelValue = value instanceof Array ? value.map((item) => string2date(item.toString(), rule)) : (value ? string2date(value.toString(), rule) : undefined)
        return h(resolveComponent("YuumiDatePicker"), {
          class: "_expand",
          clearable: true,
          modelValue: modelValue,
          "onUpdate:modelValue": (v: Date) => {
            if (v instanceof Array) {
              onUpdate(v.map((item) => format(item, rule)))
            } else {
              onUpdate(v ? format(v, rule) : "")
            }
          },
          type
        })
      }
    }

    const renderValueComponent = (updateValue: (v: Value|undefined) => void) => {
      return (data: { fieldId: string, property: string, value: Value }, option?: RenderValueComponentOption) => {
        const field = fields.find((item) => item.uid === data.fieldId)
        if (!field) return h(resolveComponent("YuumiSelect"), { class: "_expand" })

        switch (data.property) {
          case "value":
            const componentRender: {[x:string]: () => VNode} = {
              select: () => renderOptionValueComponent(data.value, updateValue)(field.options, field.props.multiple && option?.multiple),
              radio: () => renderOptionValueComponent(data.value, updateValue)(field.options),
              checkbox: () => renderOptionValueComponent(data.value, updateValue)(field.options, option?.multiple),
              switch: () => renderBooleanValueComponent(data.value, updateValue)(switchOptions),
              timepicker: () => renderTimePicerValueComponent(data.value, updateValue)(field.props, option),
              datepicker: () => renderDatePicerValueComponent(data.value, updateValue)(field.props, option),
              default: () => renderCustomValueComponent(data.value, updateValue)
            }

            return componentRender[field.type] ? componentRender[field.type]() : componentRender.default()
          case "disabled":
            return renderBooleanValueComponent(data.value, updateValue)(disabledOptions)
          case "readonly":
            return renderBooleanValueComponent(data.value, updateValue)(readonlyOptions)
          case "visible":
            return renderBooleanValueComponent(data.value, updateValue)(visibleOptions)
          case "required":
            return renderBooleanValueComponent(data.value, updateValue)(requiredOptions)
          default:
            return h(resolveComponent("YuumiSelect"), { class: "_expand" })
        }
      }
    }

    const renderAddConditionWarning = () => {
      return h(resolveComponent("YuumiWarning"), null, () => staticText.conditionAddMsg)
    }

    const renderConditions = () => {
      const { deleteCondition } = this

      return h("div", { class: "conditions" }, effect.conditions.map((condition, index) => {
        return h("div", { class: "condition-item" }, [
          h(resolveComponent("YuumiSelect"), {
            modelValue: condition.fieldId,
            "onUpdate:modelValue": (v: string) => {
              condition.fieldId = v
            },
            onChange: () => {
              condition.value = ""
            },
            options: fieldOptions
          }),
          h(resolveComponent("YuumiSelect"), {
            modelValue: condition.property,
            "onUpdate:modelValue": (v: any) => {
              condition.property = v
            },
            onChange: () => {
              condition.value = ""
            },
            options: propertyOptions
          }),
          h(resolveComponent("YuumiSelect"), {
            modelValue: condition.match,
            "onUpdate:modelValue": (v: any) => {
              condition.match = v
            },
            options: operatorOptions
          }),
          renderValueComponent((v) => {
            condition.value = typeof v === 'boolean' ? v : (v || "")
          })(condition),
          h(resolveComponent("YuumiIcon"), {
            icon: "line-delete",
            onClick: () => deleteCondition(index)
          })
        ])
      }))
    }

    const renderConditionsEditor = () => {
      return effect.conditions.length ? renderConditions() : renderAddConditionWarning()
    }

    const renderEffectEditor = () => {
      return h("div", { class: "effect" }, [
        h(resolveComponent("YuumiSelect"), {
          modelValue: effect.fieldId,
          "onUpdate:modelValue": (v: string) => {
            effect.fieldId = v
          },
          onChange: () => {
            effect.value = ""
          },
          options: fieldOptions
        }),
        h(resolveComponent("YuumiSelect"), {
          modelValue: effect.property,
          "onUpdate:modelValue": (v: any) => {
            effect.property = v
          },
          onChange: () => {
            effect.value = ""
          },
          options: propertyOptions
        }),
        renderValueComponent((v) => {
          effect.value = typeof v === 'boolean' ? v : (v || "")
        })(effect, { multiple: true, range: true }),
      ])
    }

    const renderEffectEditorBtns = () => {
      const { effectUpdateOrAdd, resetEffect } = this

      return h("div", { class: "effect__confirm" }, [
        h(resolveComponent("YuumiButton"), {
          theme: "primary",
          onClick: () => {
            if (!effect.fieldId || !effect.property) {
              return createMessage({ message: staticText.completeEffect, theme: "warn" })
            }

            if (effect.conditions.length === 0 || effect.conditions.some((c) => !c.fieldId || !c.property || !c.match)) {
              return createMessage({ message: staticText.completeCondition, theme: "warn" })
            }

            effectUpdateOrAdd(effect)
            resetEffect()
          }
        }, () => staticText.confirm)
      ])
    }

    const renderEffects = () => {
      const { effects, deleteEventEffect, effectSemantic, resetEffect } = this

      return h("div", { class: "effects-list" }, effects.map((item) => {
        return h("div", { class: "list-item" }, [
          h("span", null, [effectSemantic(item)]),
          h(resolveComponent("YuumiIcon"), { icon: "line-edit", onClick: () => resetEffect(item) }),
          h(resolveComponent("YuumiIcon"), { icon: "line-delete", onClick: () => deleteEventEffect(item.uid) }),
        ])
      }))
    }

    return h(resolveComponent("YuumiScrollbar"), null, () => [
      h("div", { class: "effect-editor" }, [
        h("div", { class: "setting__title" }, [
          h("span", { class: "title__name" }, [staticText.condition]),
          h(resolveComponent("YuumiIcon"), {
            icon: "flat-add",
            onClick: this.addCondition
          })
        ]),
        renderConditionsEditor(),
        h("div", { class: "setting__title" }, [
          h("span", { class: "title__name" }, [staticText.effect])
        ]),
        renderEffectEditor(),
        renderEffectEditorBtns()
      ]),
      renderEffects()
    ])
  }
})