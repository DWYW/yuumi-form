<template>
  <YuumiScrollbar>
    <template
      v-for="category in categories"
      :key="category.type"
    >
      <div class="categroy-name">
        {{ category.name }}
      </div>

      <div
        ref="elements"
        class="widgets"
      >
        <div
          v-for="widget in category.widgets"
          :key="widget.type"
          class="widget-item"
          :data-type="widget.type"
          :data-category="category.type"
          :data-name="widget.name"
        >
          <div class="item__body">
            <div class="widget-name">
              {{ widget.name }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </YuumiScrollbar>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import Sortable from "sortablejs";
import type { ComputedRef, Ref } from "vue"

export interface WidgetItem {
  type: string;
  name: string;
}

export interface CategoryItem {
  type: string;
  name: string;
  widgets: WidgetItem[];
}

const { t } = useI18n()

const categories: ComputedRef<CategoryItem[]> = computed(() => [
  {
    type: "base", name: t("WIDGET_CATEGORY.BASE"), widgets: [
      { type: "input", name: t("WIDGET_NAME.INPUT") },
      { type: "select", name: t("WIDGET_NAME.SELECT") },
      { type: "radio", name: t("WIDGET_NAME.RADIO") },
      { type: "checkbox", name: t("WIDGET_NAME.CHECKBOX") },
      { type: "switch", name: t("WIDGET_NAME.SWITCH") },
      { type: "timepicker", name: t("WIDGET_NAME.TIME_PICKER") },
      { type: "datepicker", name: t("WIDGET_NAME.DATE_PICKER") },
      { type: "button", name: t("WIDGET_NAME.BUTTON") }
    ]
  }
])

const elements: Ref<HTMLElement[]> = ref([])
let instances: Sortable[] = []

onMounted(() => {
  elements.value.forEach((el) => {
    instances.push(new Sortable(el, {
      group: {
        name: 'CustomForm',
        pull: 'clone',
        revertClone: true,
        put: false
      },
      sort: false
    }))
  })
})

onBeforeUnmount(() => {
  instances.forEach((item) => {
    item.destroy()
  })

  instances = []
})
</script>

<style scoped lang="scss">
.categroy-name {
  font-weight: bold;
  padding: 8px 16px;
}

.widgets {
  padding: 0 var(--space-sm);
  overflow: hidden;

  .widget-item {
    width: 50%;
    float: left;

    .item__body {
      background-color: #ffffff;
      user-select: none;
      cursor: pointer;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      margin: 4px;
      padding: 8px 4px;
      text-align: center;
    }
  }
}
</style>