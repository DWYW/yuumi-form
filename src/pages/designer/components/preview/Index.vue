<template>
  <div class="preview">
    <div class="preview__main flex-box--column">
      <div class="box__content">
        <YuumiScrollbar>
          <FormComponent
            ref="form"
            :form="schema"
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
import { useSchema } from "@/pages/designer/useSchema"
import { useEventEffect } from "@/pages/designer/useEventEffect"
import FormComponent from "./Form.vue"

const emit = defineEmits(["close", "submit"])
const { getForm, getFields } = useSchema()
const { getEventEffects } = useEventEffect()
const schema = computed(() => {
  return Object.assign({
    effects: getEventEffects(),
    fields: getFields()
  }, getForm())
})

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
</style>