<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Layout from './components/Layout.vue'

const route = useRoute()

const noLayoutRoutes = ['/login']
const showLayout = computed(() => !noLayoutRoutes.includes(route.path))
</script>

<template>
  <Layout v-if="showLayout" />
  <router-view v-else />
</template>
