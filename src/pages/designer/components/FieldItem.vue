<template>
  <div
    :class="['form-row', {
      '_required': fieldSchema.required
    }]"
  >
    <component :is="RowChildren" />
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent, watch } from "vue"
import { useSchema } from "../useSchema"
import type { ComputedRef, ConcreteComponent, PropType, VNode } from "vue"
import type { FieldItem } from "../share"

const props = defineProps({
  fieldSchema: { type: Object as PropType<FieldItem>, required: true }
})

const { getForm } = useSchema()
const formConfig = computed(() => getForm())
const modelValue = ref(props.fieldSchema.defaultValue)

/** ----------- 根据type生成VNodes ----------- */
function RowChildren(): VNode {
  return generateWithType(props.fieldSchema.type)
}

const componentProps: ComputedRef<{ [x: string]: any }> = computed(() => {
  const _props = props.fieldSchema.props
  const _modelValue = {
    modelValue: modelValue.value,
    "onUpdate:modelValue": (value: any) => {
      modelValue.value = value
    }
  }

  const generateMap: { [x: string]: () => object } = {
    select: () => (Object.assign(_modelValue, _props, {
      options: props.fieldSchema.options
    })),
    button: () => _props
  }
  return generateMap[props.fieldSchema.type] ?
    generateMap[props.fieldSchema.type]() :
    Object.assign(_modelValue, _props)
})

watch([
  () => componentProps.value.range,
  () => componentProps.value.type
], () => {
  // 清除上一次的值，防止类型切换导致显示错误
  modelValue.value = void 0
})

const typeComponent: { [x: string]: ConcreteComponent | string } = {
  button: resolveComponent("YuumiButton"),
  input: resolveComponent("YuumiInput"),
  select: resolveComponent("YuumiSelect"),
  checkbox: resolveComponent("YuumiCheckbox"),
  timepicker: resolveComponent("YuumiTimePicker"),
  datepicker: resolveComponent("YuumiDatePicker"),
  switch: resolveComponent("YuumiSwitch")
}

const getLabelClassName = () => ["row__prefix", "text--" + formConfig.value.labelAlign]

function generateButton() {
  return [h(typeComponent["button"], componentProps.value, () => props.fieldSchema.name)]
}

function generateRadio() {
  return [
    h("div", { class: getLabelClassName() }, [props.fieldSchema.name]),
    h("div", { class: "row__content" }, [
      h(resolveComponent("YuumiRadioGroup"), componentProps.value, () => props.fieldSchema.options.map((item) => {
        return h(resolveComponent("YuumiRadio"), { unique: item.value }, () => item.label)
      }))
    ])
  ]
}

function generateCheckbox() {
  return [
    h("div", { class: getLabelClassName() }, [props.fieldSchema.name]),
    h("div", { class: "row__content" }, [
      h(resolveComponent("YuumiCheckboxGroup"), componentProps.value, () => props.fieldSchema.options.map((item) => {
        return h(resolveComponent("YuumiCheckbox"), { unique: item.value }, () => item.label)
      }))
    ])
  ]
}

function generateWithType(type: string) {
  const generateMap: { [x: string]: (...rest: any[]) => any } = {
    button: generateButton,
    radio: generateRadio,
    checkbox: generateCheckbox,
    default: (type: string) => [
      h("div", { class: getLabelClassName() }, [props.fieldSchema.name]),
      h("div", { class: "row__content" }, [
        h(typeComponent[type], componentProps.value, () => props.fieldSchema.name)
      ]),
    ]
  }

  return generateMap[type] ? generateMap[type](type) : generateMap.default(type)
}
</script>

<style scoped lang="scss">
.form-row {
  margin: var(--space-md);
  user-select: none;

  :deep(.row__prefix) {
    width: 120px;
    line-height: 2;
  }

  :deep(.row__content) {
    padding: 0 var(--space-md);
  }

  :deep(.yuumi-checkbox-group) .yuumi-checkbox,
  :deep(.yuumi-radio-group) .yuumi-radio {
    margin-right: var(--space-md);
  }
}
</style>