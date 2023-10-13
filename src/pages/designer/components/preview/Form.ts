import { Transition, computed, defineComponent, h, ref, resolveComponent, resolveDirective, vShow, watch, withDirectives } from "vue"
import { useI18n } from "vue-i18n"
import { useEventEffect } from "./useEventEffect"
import { isEmpty } from "@/common/validate"
import { format } from "@/common/moment"
import type { ConcreteComponent, PropType, Ref } from "vue"
import type { FieldItem } from "@/pages/designer/share/type"
import type { EventEffectSchema, Property } from "@/pages/designer/share/useEventEffect"

export default defineComponent({
  name: "YuumiForm",
  props:{
    config: { type: Object as PropType<any>, default: () => ({}) },
    fields: { type: Array as PropType<FieldItem[]>, default: () => [] },
    effects: { type: Array as PropType<EventEffectSchema[]>, default: () => [] }
  },
  setup(props, { expose }) {
    const { t } = useI18n()
    const staticText = computed(() => ({
      requiredDefaultMsg: t("MESSAGE.REQUIRED")
    }))

    const { fields, effects } = props

    const formData: Ref<{ [x: string]: any }> = ref({})
    const requiredState: Ref<{ [x: string]: boolean }> = ref({})
    const disabledState: Ref<{ [x: string]: boolean }> = ref({})
    const readonlyState: Ref<{ [x: string]: boolean }> = ref({})
    const visibleState: Ref<{ [x: string]: boolean }> = ref({})
    const validState: Ref<{ [x: string]: boolean }> = ref({})
    const optionsData: Ref<{ [x: string]: any[] }> = ref({})
    const loadingState = ref(0)

    // 状态初始化
    fields.forEach((field) => {
      if (field.type === "switch") {
        formData.value[field.uid] = field.defaultValue || false
      } else {
        formData.value[field.uid] = field.defaultValue
      }

      requiredState.value[field.uid] = field.required
      disabledState.value[field.uid] = !!field.props.disabled
      readonlyState.value[field.uid] = !!field.props.readonly
      visibleState.value[field.uid] = !!field.visiible

      if (field.optionsSource === "remote") {
        optionsData.value[field.uid] = []
        getOptionsFromRemote(field)
      } else {
        optionsData.value[field.uid] = field.options
      }
    })

    // 加载远程数据
    function getOptionsFromRemote({ dynamicOptions, uid }: FieldItem) {
      if (!dynamicOptions) return

      loadingState.value++
      let headers = {
        "Content-Type": dynamicOptions.contentType
      }

      if (dynamicOptions.headersSetter) {
        try {
          const setter = new Function("headers", dynamicOptions.headersSetter)
          headers = setter(headers)
        } catch(err) {
          console.warn("headers setter parse failed.")
        }
      }

      return fetch(dynamicOptions.url, {
        method: dynamicOptions.method,
        headers
      }).then((response) => response.json()).then((result) => {
        if (dynamicOptions.responseParse) {
          try {
            const responseParse = new Function("response", dynamicOptions.responseParse)
            result = responseParse(result)
          } catch(err) {
            console.warn("response parse failed.")
          }
        }

        optionsData.value[uid] = result
      }).finally(() => {
        loadingState.value--
      })
    }

    /** ----------- event effect ----------- */
    const activedFieldUid = ref("")
    const stateGetters: { [K in Property]: (uid: string) => any } = {
      value: (uid) => formData.value[uid],
      required: (uid) => requiredState.value[uid],
      disabled: (uid) => disabledState.value[uid],
      readonly: (uid) => readonlyState.value[uid],
      visible: (uid) => visibleState.value[uid],
    }

    function stateSetterCreator (state: Ref<any>) {
      return (uid: string, value: any) => {
        if (value !== state.value[uid]) {
          state.value[uid] = value
        }
      }
    }

    const stateSetters: { [K in Property]: (uid: string, value: any) => void } = {
      value: stateSetterCreator(formData),
      required: stateSetterCreator(requiredState),
      disabled: stateSetterCreator(disabledState),
      readonly: stateSetterCreator(readonlyState),
      visible: stateSetterCreator(visibleState),
    }

    const { conditionValidate, effectExec } = useEventEffect({
      getter: (key: Property) => stateGetters[key],
      setter: (key: Property) => stateSetters[key]
    })

    const generateWatcher = (type: Property) => {
      return () => {
        effects.filter((effect) => effect.conditions.some((c) => c.property === type)).forEach((effect) => {
          if (activedFieldUid.value) {
            // 如果不受影响-->跳过
            if (!effect.conditions.some((c) => {
              return c.fieldId === activedFieldUid.value
            })) return
          } else {
            // 如果条件字段没有值-->跳过
            if (effect.conditions.some((c) => {
              return isEmpty(stateGetters[type](c.fieldId))
            })) return
          }

          if (effect.conditions.every((condition) => conditionValidate(condition))) {
            effectExec(effect, fields.find(item => item.uid === effect.fieldId))
          }
        })

        activedFieldUid.value = ""
      }
    }
    watch(() => formData.value, generateWatcher("value"), { deep: true, immediate: true })
    watch(() => requiredState.value, generateWatcher("required"), { deep: true, immediate: true })
    watch(() => disabledState.value, generateWatcher("disabled"), { deep: true, immediate: true })
    watch(() => readonlyState.value, generateWatcher("readonly"), { deep: true, immediate: true })
    watch(() => visibleState.value, generateWatcher("visible"), { deep: true, immediate: true })

    /** ----------- render ----------- */
    function generateFieldProps(field: FieldItem) {
      const _props = field.props
      const _value = {
        modelValue: formData.value[field.uid],
        "onUpdate:modelValue": (value: any) => {
          formData.value[field.uid] = value

          // 记录当前操作项，用于优化事件响应
          activedFieldUid.value = field.uid

          // 更新项目校验状态
          if (requiredState.value[field.uid]) {
            validState.value[field.uid] = value instanceof Array ? !!value.length : !!value
          }
        }
      }

      const _disabled = { disabled: disabledState.value[field.uid] }
      const _required = { readonly: readonlyState.value[field.uid] }

      const generateFunc: { [x: string]: () => object } = {
        select: () => Object.assign(_value, _props, _disabled, _required, { options: optionsData.value[field.uid] }),
        button: () => Object.assign(_props, _disabled, _required),
        default: () => Object.assign(_value, _props, _disabled, _required)
      }

      return generateFunc[field.type] ? generateFunc[field.type]() : generateFunc.default()
    }

    /** ----------- expose ----------- */
    function getFormData() {
      const _formData: {[x: string]: any} = {}

      const valueFormator = (uid: string) => {
        const field = fields.find((item) => item.uid === uid) as FieldItem

        return (value: any) => {
          if (value instanceof Date) {
            return format(value, field.props.format)
          }

          return value
        }
      }

      // 必填检测
      for(const uid in formData.value) {
        const _isEmpty = isEmpty(formData.value[uid])
        if (requiredState.value[uid]) {
          validState.value[uid] = !_isEmpty
        }

        _formData[uid] = _isEmpty ? "" : valueFormator(uid)(formData.value[uid])
      }

      if (Object.values(validState.value).some((v) => !v)) return
      return _formData
    }

    expose({
      getFormData
    })

    return {
      staticText,
      formData,
      requiredState,
      disabledState,
      readonlyState,
      visibleState,
      validState,
      optionsData,
      generateFieldProps,
      loadingState
    }
  },
  render() {
    const components: { [x: string]: ConcreteComponent | string } = {
      button: resolveComponent("YuumiButton"),
      input: resolveComponent("YuumiInput"),
      select: resolveComponent("YuumiSelect"),
      checkbox: resolveComponent("YuumiCheckbox"),
      timepicker: resolveComponent("YuumiTimePicker"),
      datepicker: resolveComponent("YuumiDatePicker"),
      switch: resolveComponent("YuumiSwitch")
    }

    const fieldMsgRender = (field: FieldItem) => {
      const { staticText, validState } = this

      return h(Transition, { name: "message" }, {
        default: () => {
          const _state = validState[field.uid]

          return withDirectives(
            h('div', { class: 'form-row__msg' }, field.requiredMsg || staticText.requiredDefaultMsg),
            [[vShow, _state === false]]
          )
        }
      })
    }

    const fieldRender = (type: string) => {
      const { config, optionsData, generateFieldProps } = this
      const getLabelClassName = () => ["row__prefix", "text--" + config.labelAlign]

      const generators: { [x: string]: (...rest: any[]) => any } = {
        button: (field: FieldItem) => [
          h(components[type], generateFieldProps(field), () => field.name)
        ],
        radio: (field: FieldItem) => ([
          h("div", { class: getLabelClassName() }, [field.name]),
          h("div", { class: "row__content" }, [
            h(resolveComponent("YuumiRadioGroup"), generateFieldProps(field), () => {
              return optionsData[field.uid].map((item) => {
                return h(resolveComponent("YuumiRadio"), { unique: item.value }, () => item.label)
              })
            }),
            fieldMsgRender(field)
          ])
        ]),
        checkbox: (field: FieldItem) => ([
          h("div", { class: getLabelClassName() }, [field.name]),
          h("div", { class: "row__content" }, [
            h(resolveComponent("YuumiCheckboxGroup"), generateFieldProps(field), () => optionsData[field.uid].map((item) => {
              return h(resolveComponent("YuumiCheckbox"), { unique: item.value }, () => item.label)
            })),
            fieldMsgRender(field)
          ])
        ]),
        default: (field: FieldItem) => [
          h("div", { class: getLabelClassName() }, [field.name]),
          h("div", { class: "row__content" }, [
            h(components[field.type], generateFieldProps(field), () => field.name),
            fieldMsgRender(field)
          ])
        ]
      }

      return generators[type] ? generators[type] : generators.default
    }

    const generateField = (field: FieldItem) => {
      if (!this.visibleState[field.uid]) return null

      return h("div", {
        class: ['form-row', {
          '_required': this.requiredState[field.uid]
        }],
        key: field.uid
      }, fieldRender(field.type)(field))
    }

    return withDirectives(
      h("div", { class: "form" }, this.fields.map((field) => {
        return generateField(field)
      })),
      [[resolveDirective("loading"), this.loadingState !== 0]]
    )
  }
})