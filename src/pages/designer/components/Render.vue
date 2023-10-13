<template>
  <YuumiScrollbar>
    <div
      ref="sortRootEl"
      class="form"
      @click="onFormClick"
    >
      <TransitionGroup>
        <div
          v-if="schema.length === 0"
          class="form__msg--empty"
        >
          <span v-t="'MESSAGE.FORM_EMPTY'" />
        </div>

        <div
          v-for="field in schema"
          :key="field.uid"
          :class="['field-item', { '_selected': selectedID === field.uid }]"
          :data-id="field.uid"
        >
          <FieldItem
            :field="field"
          />

          <div class="field-item__menus">
            <YuumiIcon
              icon="line-delete"
              @click="onDeleteField(field.uid)"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </YuumiScrollbar>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { useFields } from "../share/useFields"
import FieldItem from "./FieldItem.vue"
import Sortable from "sortablejs"
import type { SortableEvent } from "sortablejs"

const { generateField, addField, getFields, deleteField, getSelectedFieldUID, setSelectedFieldUID, updatePosition } = useFields()
const schema = computed(() => getFields())
const selectedID = computed(() => getSelectedFieldUID())

function getFieldID(el?: HTMLElement|null) {
  if (!el) return ""

  if (!el.dataset.id) {
    return getFieldID(el.parentElement)
  }

  return el.dataset.id
}

function onFormClick(e: MouseEvent) {
  const uid = getFieldID(e.target as HTMLElement)
  setSelectedFieldUID(uid)
}

function onDeleteField(uid: string) {
  deleteField(uid)
}

/** ----------- Sortable ----------- */
const sortRootEl = ref()
let instance: Sortable|null = null

function createSortable() {
  return new Sortable(sortRootEl.value, {
    group: {
      name: "CustomForm",
      pull: false
    },
    animation: 150,
    ghostClass: "_ghost",
    chosenClass: "_chosen",
    onAdd: ({ item, newIndex }) => {
      const data = generateField(item.dataset.name as string, item.dataset.type as string)
      addField(data, newIndex)
      item.parentElement?.removeChild(item)
      setSelectedFieldUID(data.uid)
    },
    onEnd: ({ newIndex, oldIndex, item }: SortableEvent) => {
      if (newIndex === undefined || oldIndex === undefined || newIndex === oldIndex) return
      updatePosition(newIndex, oldIndex)

      // 重置被选中项
      const fieldID = getFieldID(item)
      if (fieldID != getSelectedFieldUID()) {
        setSelectedFieldUID(fieldID)
      }
    }
  })
}

function destroySortable() {
  if (!instance) return
  instance.destroy()
  instance = null
}

/** ----------- 生命周期钩子函数 ----------- */
onMounted(() => {
  instance = createSortable();
})

onBeforeUnmount(() => {
  destroySortable()
})
</script>

<style scoped lang="scss">
.field-item {
  border: 1px dashed #cccccc;
  cursor: move;
  margin: 8px 0;
  background-color: #fff;
  border-radius: 4px;
  position: relative;

  &._ghost,
  &._selected {
    border-color: var(--color-primary);
  }

  &._selected {
    border-style: solid;

    .field-item__menus {
      display: block;
    }
  }

  .field-item__menus {
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 8px;
    display: none;

    >span {
      font-size: 1.2em;
      cursor: pointer;
      color: var(--text-color-secondary);

      &:hover {
        color: var(--color-primary);
      }
    }
  }
}

.form {
  min-height: 100%;
  padding: var(--space-md);

  :deep(.widget-item) {
    width: 100%;
    height: 0;
    border: 4px solid var(--color-primary);
    border-radius: 4px;
    overflow: hidden;
  }

  .form__msg--empty {
    text-align: center;
    padding: var(--space-lg) 0;
    color: var(--text-color-secondary);
  }
}
</style>