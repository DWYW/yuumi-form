<template>
  <div class="designer">
    <aside class="designer__widgets">
      <FormWidgets />
    </aside>

    <main class="designer__main flex-box--column">
      <div class="box__header designer__toolbar">
        <YuumiIcon
          icon="line-eye"
          @click="isPreview = !isPreview"
        >
          {{ $t("HANDLER.PREVIEW") }}
        </YuumiIcon>
        <YuumiIcon
          icon="line-file"
          @click="onPreviewJSONData"
        >
          {{ $t("HANDLER.PREVIEW_JSON") }}
        </YuumiIcon>
      </div>

      <div class="box__content">
        <FormRender />
      </div>
    </main>

    <aside class="designer__setting">
      <YuumiTabs v-model="settingType">
        <YuumiTabItem
          :label="$t('TITLE.WIDGET_SETTING')"
          value=""
        >
          <FieldSetting />
        </YuumiTabItem>

        <YuumiTabItem
          :label="$t('TITLE.FORM_SETTING')"
          value="formSetting"
        >
          <FormSetting />
        </YuumiTabItem>

        <YuumiTabItem
          :label="$t('TITLE.EVENT_EFFECT')"
          value="eventEffect"
        >
          <EffectSetting />
        </YuumiTabItem>
      </YuumiTabs>
    </aside>

    <footer class="mask">
      <YuumiDialog
        v-model="isPreviewJSONData"
        title="JSON Data"
        @beforeEnter="onShowJSONData"
        @afterLeave="onHideJSONData"
      >
        <div
          ref="editorParentEl"
          class="json-editor"
        />
      </YuumiDialog>

      <FormPreview
        v-if="isPreview"
        @close="onPreviewClose"
        @submit="onFormSubmit"
      />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { createAlert } from "yuumi-ui-vue"
import { computed, nextTick, ref, watch } from "vue"
import { useFields } from "./share/useFields"
import { useForm } from "./share/useForm"
import { useToolbar } from "./share/useToolbar"
import { useEventEffect } from "./share/useEventEffect"
import FormWidgets from "./components/Widgets.vue"
import FormRender from "./components/Render.vue"
import FieldSetting from "./components/FieldSetting"
import FormSetting from "./components/FormSetting"
import EffectSetting from "./components/EffectSetting"
import FormPreview from "./components/preview/Index.vue"

const { getSelectedFieldUID, getFields } = useFields()

const { getFormConfig } = useForm()
const { getEventEffects } = useEventEffect()
const { createEditor, destroyEditor } = useToolbar()

const isPreview = ref(false)
function onPreviewClose() {
  isPreview.value = false
}

const editorParentEl = ref()
const isPreviewJSONData = ref(false)
function onPreviewJSONData() {
  isPreviewJSONData.value = true
}
function onShowJSONData() {
  const fields = getFields()
  const form = getFormConfig()
  const effects = getEventEffects()

  nextTick(() => createEditor(editorParentEl.value, JSON.stringify(
    Object.assign({ effects, fields }, form),
    null,
    2
  )))
}
function onHideJSONData() {
  destroyEditor()
}

function onFormSubmit(value: any) {
  createAlert({ content: "Place open console panel", title: "Message" })
  console.log("formData is:", value)
}

/** ----------- 设置面板的Tab ----------- */
const selectedID = computed(() => getSelectedFieldUID())
const settingType = ref("")
watch(() => selectedID.value, (value, oldValue) => {
  if (value !== oldValue) {
    settingType.value = ""
  }
})
</script>

<style scoped lang="scss">
.designer {
  width: 100%;
  height: 100%;
  display: flex;
  min-width: 1360px;
  overflow: hidden;
  .designer__widgets {
    flex: 0 0 300px;
  }

  .designer__main {
    flex: 1 1 360px;
    border-left: 1px solid var(--border-color);
    border-right: 1px solid var(--border-color);
  }

  .designer__setting {
    flex: 0 0 700px;
  }
}

.designer__toolbar {
  text-align: right;
  flex: 0 0 auto;
  padding: var(--space-md);
  padding-bottom: 0;
  font-size: 14px;
  color: var(--color-primary);
  cursor: pointer;

  >span {
    margin-left: var(--space-md);
  }
}

.designer__setting :deep(>.yuumi-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;

  .tabs__header {
    padding-top: var(--space-sm);
    flex: 0 0 auto;
  }

  .tabs__panel {
    flex: 1 1 1px;
    overflow: hidden;
    padding: 0 var(--space-md);
    position: relative;

    >div {
      width: 100%;
      height: 100%;
    }
  }
}

@import "./styles/field-setting.scss";
@import "./styles/effect-setting.scss";

.json-editor {
  overflow: auto;
  max-height: 480px;
}
</style>