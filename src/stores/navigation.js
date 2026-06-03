import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNavigationStore = defineStore('navigation', () => {
  const contextTabs      = ref([])
  const activeContextTab = ref('')
  const searchQuery      = ref('')

  function setContext(tabs, initialTab) {
    contextTabs.value = tabs
    if (initialTab !== undefined) activeContextTab.value = initialTab
  }

  function setActiveTab(id) {
    activeContextTab.value = id
  }

  function clearContext() {
    contextTabs.value      = []
    activeContextTab.value = ''
    searchQuery.value      = ''
  }

  function setSearch(q) {
    searchQuery.value = q
  }

  return { contextTabs, activeContextTab, searchQuery, setContext, setActiveTab, clearContext, setSearch }
})
