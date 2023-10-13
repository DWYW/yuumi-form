<template>
  <div class="preview">
    <div class="preview__main flex-box--column">
      <div class="box__content">
        <YuumiScrollbar>
          <FormComponent
            ref="form"
            :config="formConfig"
            :fields="fields"
            :effects="effects"
          />
        </YuumiScrollbar>
      </div>

      <div class="box__footer">
        <YuumiButton
          v-t="'HANDLER.BACK'"
          @click="onReturn"
        />
        <YuumiButton
          v-t="'HANDLER.SUBMIT'"
          theme="primary"
          @click="onSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useFields } from "@/pages/designer/share/useFields"
import { useForm } from "@/pages/designer/share/useForm"
import { useEventEffect } from "@/pages/designer/share/useEventEffect"
import FormComponent from "./Form"

const emit = defineEmits(["close", "submit"])
const { getFields } = useFields()
const { getFormConfig } = useForm()
const { getEventEffects } = useEventEffect()
const formConfig = computed(() => getFormConfig())
const fields = computed(() => getFields())
const effects = computed(() => getEventEffects())

function onReturn() {
  emit("close")
}

const form = ref()

function onSubmit() {
  const _value = form.value.getFormData()

  if (_value) {
    emit("submit", _value)
  }
}
</script>

<style scoped lang="scss">
.preview {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 1;
  background-color: #ffffff;

  .preview__main {
    max-width: 640px;
    margin: 0 auto;
    height: 100%;
  }
}

.box__footer {
  padding: var(--space-md);
  text-align: center;
  :deep(.yuumi-button):not(:last-child) {
    margin-right: var(--space-md);
  }
}

:deep(.form-row) {
  margin: var(--space-md) 0;

  .row__prefix {
    padding-right: var(--space-md);
    flex-basis: 120px;
    line-height: 2;
  }

  .row__content {
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

  .form-row__msg {
    position: absolute;
    top: 100%;
    left: 0;
    font-size: 12px;
    color: var(--color-danger);
    line-height: 1.5;
  }
}
</style>