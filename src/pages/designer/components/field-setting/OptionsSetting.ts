import { computed, defineComponent, h, ref, resolveComponent } from "vue"
import { useI18n } from "vue-i18n"
import { useSchema } from "@/pages/designer/useSchema"
import Sortable from "sortablejs"
import type { SortableEvent } from "sortablejs"

export default defineComponent({
  name: "OptionsSetting",
  setup() {
    const { t } = useI18n()
    const staticText = computed(() => {
      return {
        title: t("TITLE.OPTIONS_SETTING"),
        addOption: t("HANDLER.ADD_OPTION"),
      }
    })

    const {
      getSelectedField,
      selectedFieldAddOption,
      selectedFieldUpdateOption,
      selectedFieldDeleteOption,
      selectedFieldUpdateOptionPosition
    } = useSchema()

    const options = computed(() => getSelectedField()?.options || [])
    const sortableEl = ref()
    const instance = null as any

    return {
      staticText,
      options,
      sortableEl,
      instance,
      selectedFieldAddOption,
      selectedFieldUpdateOption,
      selectedFieldDeleteOption,
      selectedFieldUpdateOptionPosition
    }
  },
  mounted() {
    this.instance = this.createSortable(this.sortableEl)
  },
  beforeUnmount() {
    this.destroySortable()
  },
  methods: {
    createSortable(el: HTMLElement) {
      return new Sortable(el, {
        group: {
          name: "FieldOptions",
          pull: false
        },
        animation: 100,
        handle: ".drag-sort",
        onEnd: ({ newIndex, oldIndex }: SortableEvent) => {
          if (newIndex === undefined || oldIndex === undefined || newIndex === oldIndex) return
          this.selectedFieldUpdateOptionPosition(newIndex, oldIndex)
        }
      })
    },
    destroySortable() {
      if (!this.instance) return
      this.instance.destroy()
      this.instance = null
    }
  },
  render() {
    const { options, staticText, selectedFieldAddOption, selectedFieldUpdateOption, selectedFieldDeleteOption } = this

    return [
      h(resolveComponent("YuumiDivider"), null, () => staticText.title),
      h("ul", { class: "options", ref: "sortableEl" }, options.map((item, index) => {
        return h("li", { class: "option-item", key: item.value.toString() }, [
          h(resolveComponent("YuumiIcon"), { icon: "flat-drag", class: "drag-sort" }),
          h("span", { class: "item-value" }, [
            h(resolveComponent("YuumiInput"), {
              modelValue: item.value,
              onChange: (e: any) => selectedFieldUpdateOption({
                index,
                value: e.target.value,
                type: "value"
              })
            })
          ]),
          h("span", { class: "item-key" }, [
            h(resolveComponent("YuumiInput"), {
              modelValue: item.label,
              onChange: (e: any) => selectedFieldUpdateOption({
                index,
                value: e.target.value,
                type: "key"
              })
            })
          ]),
          h(resolveComponent("YuumiIcon"), { icon: "line-delete", onClick: () => selectedFieldDeleteOption(index) })
        ])
      })),

      h("div", { class: "option__handler" }, [
        h("span", {
          class: "option--add",
          onClick: selectedFieldAddOption
        }, staticText.addOption)
      ])
    ]
  }
})