import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getTablesList } from '@/api/tables'

export const useTablesStore = defineStore('tables', () => {
  const tables = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchTables = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await getTablesList()
      tables.value = response.data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    tables,
    loading,
    error,
    fetchTables
  }
})
