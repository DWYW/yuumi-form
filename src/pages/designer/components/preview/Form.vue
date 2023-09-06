<template>
  <div class="form">
    <div
      v-for="field in fields"
      :key="field.uid"
      :class="['form-row', { '_required': requiredState[field.uid] }]"
    >
      <component :is="getFieldChildrenComponent(field)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Transition, computed, h, ref, resolveComponent, vShow, watch, withDirectives } from "vue"
import { useI18n } from "vue-i18n"
import { isEmpty } from "@/common/validate"
import { format } from "@/common/moment"
import { EventEffectSchema, Property } from "@/pages/designer/useEventEffect"
import { useEventEffect } from "./useEventEffect"
import type { ComputedRef, ConcreteComponent, PropType, Ref } from "vue"
import type { FieldItem } from "@/pages/designer/share"

const { t } = useI18n()
const staticText = computed(() => ({
  requiredDefaultMsg: t("MESSAGE.REQUIRED")
}))

const { form } = defineProps({
  form: { type: Object as PropType<any>, required: true }
})

const fields: ComputedRef<FieldItem[]> = computed(() => form.fields)
const effects: ComputedRef<EventEffectSchema[]> = computed(() => form.effects)

const formData = ref(fields.value.reduce((res, item) => {
  if (item.type === "switch") {
    res[item.uid] = item.defaultValue || false
  } else {
    res[item.uid] = item.defaultValue
  }
  return res
}, {} as { [x: string]: any }))

const requiredState = ref(fields.value.reduce((res, item) => {
  res[item.uid] = item.required
  return res
}, {} as { [x: string]: boolean }))

const disabledState = ref(fields.value.reduce((res, item) => {
  res[item.uid] = !!item.props.disabled
  return res
}, {} as { [x: string]: boolean }))

const readonlyState = ref(fields.value.reduce((res, item) => {
  res[item.uid] = !!item.props.readonly
  return res
}, {} as { [x: string]: boolean }))

const visibleState = ref(fields.value.reduce((res, item) => {
  res[item.uid] = !!item.visiible
  return res
}, {} as { [x: string]: boolean }))


const validState: Ref<{ [x: string]: boolean }> = ref({})

/** ----------- event effect ----------- */
const activedFieldUid = ref("")
const stateGetters: { [K in Property]: (uid: string) => any } = {
  value: (uid) => formData.value[uid],
  required: (uid) => requiredState.value[uid],
  disabled: (uid) => disabledState.value[uid],
  readonly: (uid) => readonlyState.value[uid],
  visible: (uid) => visibleState.value[uid],
}

const { conditionValidate, effectExec } = useEventEffect({
  getter: (key: Property) => {
    return stateGetters[key]
  },
  setter: (key: Property) => {
    const _map: { [K in Property]: (uid: string, value: any) => void } = {
      value: (uid, value) => {
        if (value !== formData.value[uid]) {
          formData.value[uid] = value
        }
      },
      required: (uid, value) => {
        if (requiredState.value[uid] !== value) {
          requiredState.value[uid] = value
        }
      },
      disabled: (uid, value) => {
        if (disabledState.value[uid] !== value) {
          disabledState.value[uid] = value
        }
      },
      readonly: (uid, value) => {
        if (readonlyState.value[uid] !== value) {
          readonlyState.value[uid] = value
        }
      },
      visible: (uid, value) => {
        if (visibleState.value[uid] !== value) {
          visibleState.value[uid] = value
        }
      },
    }
    return _map[key]
  }
})

const watcher = (type: Property) => {
  const valueGetter = stateGetters[type]

  return () => {
    effects.value.filter((effect) => effect.conditions.some((c) => c.property === type)).forEach((effect) => {
      if (activedFieldUid.value) {
        // 如果不受影响-->跳过
        if (!effect.conditions.some((c) => {
          return c.fieldId === activedFieldUid.value
        })) return
      } else {
        // 如果条件字段没有值-->跳过
        if (effect.conditions.some((c) => {
          return isEmpty(valueGetter(c.fieldId))
        })) return
      }

      if (effect.conditions.every((condition) => conditionValidate(condition))) {
        effectExec(effect)
      }
    })

    activedFieldUid.value = ""
  }
}

watch(() => formData.value, watcher("value"), { deep: true, immediate: true })
watch(() => requiredState.value, watcher("required"), { deep: true, immediate: true })
watch(() => disabledState.value, watcher("disabled"), { deep: true, immediate: true })
watch(() => readonlyState.value, watcher("readonly"), { deep: true, immediate: true })
watch(() => visibleState.value, watcher("visible"), { deep: true, immediate: true })

/** ----------- render ----------- */
const components: { [x: string]: ConcreteComponent | string } = {
  button: resolveComponent("YuumiButton"),
  input: resolveComponent("YuumiInput"),
  select: resolveComponent("YuumiSelect"),
  checkbox: resolveComponent("YuumiCheckbox"),
  timepicker: resolveComponent("YuumiTimePicker"),
  datepicker: resolveComponent("YuumiDatePicker"),
  switch: resolveComponent("YuumiSwitch")
}

function getFieldProps(field: FieldItem): object {
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
    select: () => Object.assign(_value, _props, _disabled, _required, { options: field.options }),
    button: () => Object.assign(_props, _disabled, _required),
    default: () => Object.assign(_value, _props, _disabled, _required)
  }

  return generateFunc[field.type] ? generateFunc[field.type]() : generateFunc.default()
}

const generateMsg = (field: FieldItem) => h(Transition, { name: "message" }, {
  default: () => {
    const _state = validState.value[field.uid]

    return withDirectives(
      h('div', { class: 'form-row__msg' }, field.requiredMsg || staticText.value.requiredDefaultMsg),
      [[vShow, _state === false]]
    )
  }
})

function generateComponentWithType(type: string) {
  const getLabelClassName = () => ["row__prefix", "text--" + form.labelAlign]

  const generateMap: { [x: string]: (...rest: any[]) => any } = {
    button: (filed: FieldItem) => [
      h(components[filed.type],
        getFieldProps(filed),
        () => filed.name)
    ],
    radio: (filed: FieldItem) => ([
      h("div", { class: getLabelClassName() }, [filed.name]),
      h("div", { class: "row__content" }, [
        h(resolveComponent("YuumiRadioGroup"), getFieldProps(filed), () => filed.options.map((item) => {
          return h(resolveComponent("YuumiRadio"), { unique: item.value }, () => item.label)
        })),
        generateMsg(filed)
      ])
    ]),
    checkbox: (filed: FieldItem) => ([
      h("div", { class: getLabelClassName() }, [filed.name]),
      h("div", { class: "row__content" }, [
        h(resolveComponent("YuumiCheckboxGroup"), getFieldProps(filed), () => filed.options.map((item) => {
          return h(resolveComponent("YuumiCheckbox"), { unique: item.value }, () => item.label)
        })),
        generateMsg(filed)
      ])
    ]),
    default: (filed: FieldItem) => [
      h("div", { class: getLabelClassName() }, [filed.name]),
      h("div", { class: "row__content" }, [
        h(components[filed.type], getFieldProps(filed), () => filed.name),
        generateMsg(filed)
      ])
    ]
  }

  return generateMap[type] ? generateMap[type] : generateMap.default
}

function getFieldChildrenComponent(this: any, field: FieldItem) {
  return () => visibleState.value[field.uid] ? generateComponentWithType(field.type).call(this, field) : null
}

/** ----------- expose ----------- */
function getFormData() {
  const _formData: {[x: string]: any} = {}

  const valueFormator = (uid: string) => {
    const field = fields.value.find((item) => item.uid === uid) as FieldItem

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

defineExpose({
  getFormData
})
</script>

<style scoped lang="scss">
.form-row {
  margin: var(--space-md) 0;

  :deep(.row__prefix) {
    padding-right: var(--space-md);
    flex-basis: 120px;
    line-height: 2;
  }

  :deep(.row__content) {
    position: relative;
    display: inline-flex;

    .yuumi-checkbox-group .yuumi-checkbox,
    .yuumi-radio-group .yuumi-radio {
      margin-right: var(--space-md);
    }

    .yuumi-input,
    .yuumi-select,
    .yuumi-time-picker,
    .yuumi-date-picker {
      width: 100%;
    }
  }

  :deep(.form-row__msg) {
    position: absolute;
    top: 100%;
    left: 0;
    font-size: 12px;
    color: var(--color-danger);
    line-height: 1.5;
  }
}
</style>