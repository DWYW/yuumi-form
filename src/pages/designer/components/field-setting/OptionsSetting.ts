import { computed, defineComponent, h, ref, resolveComponent, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useFields } from "@/pages/designer/share/useFields"
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
        staticData: t("TITLE.STATIC_DATA"),
        remoteData: t("TITLE.REMOTE_DATA"),
        remoteURL: t("ATTR_NAME.REMOTE_URL"),
        method: t("ATTR_NAME.METHOD"),
        contentType: t("ATTR_NAME.CONTENT_TYPE"),
        requestHeaders: t("ATTR_NAME.REQUEST_HEADERS"),
        response: t("ATTR_NAME.RESPONSE")
      }
    })

    const {
      getSelectedField,
      selectedFieldAddOption,
      selectedFieldUpdateOption,
      selectedFieldDeleteOption,
      selectedFieldUpdateOptionPosition,
      updateSelectedFieldPropertyValue
    } = useFields()

    const options = computed(() => getSelectedField()?.options || [])
    const sortableEl = ref()
    const instance = null as any

    const optionsSourceType = computed(() => getSelectedField()?.optionsSource)
    const methodOptions = computed(() => [
      { label: "GET", value: "GET"},
      { label: "POST", value: "POST"},
    ])
    const contentTypeOptions = computed(() => [
      { label: "JSON", value: "application/json"},
      { label: "FormData", value: "application/x-www-form-urlencoded"},
    ])

    const dynamicOptions = ref(Object.assign({
      url: "",
      method: "",
      contentType: "",
      headersSetter: "",
      responseParse: ""
    }, getSelectedField()?.dynamicOptions))

    let timeout:any = null
    watch(() => dynamicOptions.value, (value) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        updateSelectedFieldPropertyValue("dynamicOptions", value)
        timeout = null
      }, 100)
    }, { deep: true })

    return {
      staticText,
      options,
      sortableEl,
      instance,
      selectedFieldAddOption,
      selectedFieldUpdateOption,
      selectedFieldDeleteOption,
      selectedFieldUpdateOptionPosition,
      optionsSourceType,
      updateSelectedFieldPropertyValue,
      methodOptions,
      contentTypeOptions,
      dynamicOptions
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
      if (this.optionsSourceType !== "static") return

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
    const { options, staticText, selectedFieldAddOption, selectedFieldUpdateOption, selectedFieldDeleteOption, optionsSourceType, updateSelectedFieldPropertyValue } = this

    const staticSettingRender = () => [
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

    const remoteSettingRender = () => {
      const { methodOptions, contentTypeOptions, dynamicOptions } = this
      return [
        h("div", {class: "form-row _required row _center"}, [
          h("div", { class: "row__prefix"}, staticText.remoteURL),
          h("div", { class: "row__content"}, [
            h(resolveComponent("YuumiInput"), {
              modelValue: dynamicOptions.url,
              "onUpdate:modelValue": (value: string) => {
                dynamicOptions.url = value
              }
            })
          ])
        ]),
        h("div", {class: "form-row _required row _center"}, [
          h("div", { class: "row__prefix"}, staticText.method),
          h("div", { class: "row__content"}, [
            h(resolveComponent("YuumiSelect"), {
              options: methodOptions,
              modelValue: dynamicOptions.method,
              "onUpdate:modelValue": (value: string) => {
                dynamicOptions.method = value
              }
            })
          ])
        ]),
        h("div", {class: "form-row _required row _center"}, [
          h("div", { class: "row__prefix"}, staticText.contentType),
          h("div", { class: "row__content"}, [
            h(resolveComponent("YuumiSelect"), {
              options: contentTypeOptions,
              modelValue: dynamicOptions.contentType,
              "onUpdate:modelValue": (value: string) => {
                dynamicOptions.contentType = value
              }
            })
          ])
        ]),
        h("div", {class: "form-row row headers"}, [
          h("div", { class: "row__prefix"}, staticText.requestHeaders),
          h("div", { class: "row__content"}, [
            h("textarea", {
              placeholder: `function(headers) {\n  \\\\ Just write the function body ... \n  \\\\ return headers\n}`,
              value: dynamicOptions.headersSetter,
              onChange: (e: Event) => {
                dynamicOptions.headersSetter = (<HTMLTextAreaElement>e.target).value
              }
            })
          ])
        ]),
        h("div", {class: "form-row row response"}, [
          h("div", { class: "row__prefix"}, staticText.response),
          h("div", { class: "row__content"}, [
            h("textarea", {
              placeholder: `function(response) {\n  \\\\ Just write the function body ... \n  \\\\ var options = [] \n  \\\\ return options\n}`,
              value: dynamicOptions.responseParse,
              onChange: (e: Event) => {
                dynamicOptions.responseParse = (<HTMLTextAreaElement>e.target).value
              }
            })
          ])
        ])
      ]
    }

    return [
      h(resolveComponent("YuumiDivider"), null, () => staticText.title),

      h(resolveComponent("YuumiTabs"), {
        type: "card",
        modelValue: optionsSourceType,
        "onUpdate:modelValue": (value: string) => {
          updateSelectedFieldPropertyValue("optionsSource", value)
        }
      }, () => [
        h(resolveComponent("YuumiTabItem"), { label: staticText.staticData,  value: "static" }, () => staticSettingRender()),
        h(resolveComponent("YuumiTabItem"), { label: staticText.remoteData,  value: "remote" }, () => remoteSettingRender()),
      ])
    ]
  }
})