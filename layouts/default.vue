<template>
  <div>
    <Nuxt />
    <three-component />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ThreeComponent from '~/components/molecules/ThreeComponent.vue'

export default Vue.extend({
  components: { ThreeComponent },
})
</script>

<style>
body {
  position: absolute;
  margin: 0;
  padding: 0;
  left: 0;
  top: 0;
}
</style>
