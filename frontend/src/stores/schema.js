import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSchemaStore = defineStore('schema', () => {
  const selectedSchema = ref('public')
  const tableAccessUpdated = ref(0) // Trigger for table access updates

  const setSchema = (schema) => {
    selectedSchema.value = schema
  }

  const triggerTableAccessUpdate = () => {
    tableAccessUpdated.value = Date.now()
  }

  return {
    selectedSchema,
    setSchema,
    tableAccessUpdated,
    triggerTableAccessUpdate
  }
})
