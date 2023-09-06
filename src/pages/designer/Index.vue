<template>
  <div class="designer">
    <aside class="designer__left">
      <WidgetsComponent />
    </aside>

    <main class="flex-box--column designer__main">
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
        <FormRenderComponent />
      </div>
    </main>

    <aside class="designer__right setting">
      <YuumiTabs v-model="settingType">
        <YuumiTabItem
          :label="$t('TITLE.WIDGET_SETTING')"
          value=""
        >
          <FieldSettingComponent />
        </YuumiTabItem>

        <YuumiTabItem
          :label="$t('TITLE.FORM_SETTING')"
          value="formSetting"
        >
          <FormSettingComponent />
        </YuumiTabItem>

        <YuumiTabItem
          :label="$t('TITLE.EVENT_EFFECT')"
          value="eventEffect"
        >
          <EventEffectComponent />
        </YuumiTabItem>
      </YuumiTabs>
    </aside>
  </div>

  <div class="mask">
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

    <FormPreviewComponent
      v-if="isPreview"
      @close="onPreviewClose"
      @submit="onFormSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue"
import { useToolbar } from "./useToolbar"
import { useSchema } from "./useSchema"
import { useEventEffect } from "./useEventEffect"
import WidgetsComponent from "./components/Widgets.vue"
import FormRenderComponent from "./components/FormRender.vue"
import FieldSettingComponent from "./components/FieldSetting"
import FormSettingComponent from "./components/FormSetting"
import EventEffectComponent from "./components/EventEffect"
import FormPreviewComponent from "./components/preview/Index.vue"
import { createAlert } from "yuumi-ui-vue"

const { getSelectedFieldUID, getFields, getForm } = useSchema()
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
  const form = getForm()
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
  min-width: 1340px;
  overflow: hidden;

  .designer__left {
    flex: 0 0 280px;
  }

  .designer__main {
    flex: 1 1 360px;
    border-left: 1px solid var(--border-color);
    border-right: 1px solid var(--border-color);
  }

  .designer__right {
    flex: 0 0 700px;
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
}

.setting {
  :deep(.yuumi-tabs) {
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

    .yuumi-icon {
      cursor: pointer;

      &:hover {
        color: var(--color-primary)
      }
    }

    .setting__title {
      padding: var(--space-md) 0;
      font-weight: bold;
      display: flex;

      >.title__name {
        flex: 1 1 auto;
      }
    }


    ul.options {
      padding: 0;

      li.option-item {
        list-style: none;
        display: flex;
        align-items: center;

        >span {
          padding-right: var(--space-sm);
        }

        .drag-sort {
          cursor: move;
        }
      }
    }

    .option__handler {
      color: var(--color-primary);
      font-size: 12px;

      >span {
        cursor: pointer;
      }
    }

    .row._center {
      margin-bottom: var(--space-md);
      align-items: center;

      .row__prefix {
        flex-basis: 100px;
      }

      .row__content {
        padding: 0 var(--space-md);
        display: inline-flex;

        .yuumi-select,
        .yuumi-input {
          width: 100%;
        }
      }
    }
  }

  :deep(.effect-editor) {
    padding: 0 16px;
    border: 1px solid #ececec;
    border-radius: 4px;

    .conditions {
      .condition-item {
        display: flex;
        align-items: center;
        margin-bottom: var(--space-sm);
      }
    }

    .effect {
      display: flex;
      margin-bottom: var(--space-md);
    }

    .condition-item,
    .effect {
      [class^=yuumi] {
        margin-right: var(--space-sm);

      }
      .yuumi-select {
        flex: 0 0 auto;
        text-align: center;
      }

      ._expand {
        flex: 1 0 20%;
      }
    }

    .effect__confirm {
      text-align: right;
      margin-bottom: var(--space-md);
    }
  }

  :deep(.effects-list) {
    padding: var(--space-md) 0;

    .list-item {
      display: flex;
      align-items: center;
      padding: var(--space-sm);
      border-bottom: 1px solid var(--border-color);

      :first-child {
        flex: 1 1 auto;
      }

      :not(:last-child) {
        margin-right: var(--space-sm);
      }
    }
  }
}

.json-editor {
  overflow: auto;
  height: 480px;
}
</style>