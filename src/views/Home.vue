
<template>
  <div class="page ">
    <header class="flex-box page__header">
      <img
        class="box__item logo"
        src="../assets/images/logo.png"
        alt=""
      >
      <div class="box__item app-name">
        {{ appName }}
      </div>

      <div class="box__item--expand" />
      <div class="box__item version">
        {{ appVersion }}
      </div>
    </header>

    <main class="page__body">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

const appName = computed(() => __APP_NAME__)
const appVersion = computed(() => `V${__APP_VERSION__}`)
</script>

<style lang="scss" scoped>
.page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  .page__header {
    flex: 0 0 60px;
    overflow: hidden;
    box-shadow: 0 0 4px #00000029;
    padding: 0 var(--space-md);
  }
  .page__body {
    flex: 1 1 1px;
    overflow: hidden;
  }
}

.page__header.flex-box {
  align-items: center;
}

.logo {
  width: 36px;
}

.app-name {
  font-weight: bold;
}

.version {
  color: var(--text-color-secondary);
}
</style>
