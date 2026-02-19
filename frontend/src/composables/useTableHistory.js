import { useSchemaStore } from '@/stores/schema'

const HISTORY_KEY = (schema) => `table_access_${schema}`
const HISTORY_LIMIT = 20

const readHistory = (schema) => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY(schema))
    if (!stored) return []
    return JSON.parse(stored).filter(
      t => t && typeof t === 'string' && t !== 'undefined' && t !== 'null'
    )
  } catch {
    return []
  }
}

const writeHistory = (schema, history) => {
  try {
    localStorage.setItem(HISTORY_KEY(schema), JSON.stringify(history))
  } catch {
    // ignore storage errors
  }
}

export const useTableHistory = () => {
  const schemaStore = useSchemaStore()

  const logTableAccess = (schema, tableName) => {
    if (!tableName || !schema) return

    let history = readHistory(schema)
    history = history.filter(t => t !== tableName)
    history.unshift(tableName)
    history = history.slice(0, HISTORY_LIMIT)

    writeHistory(schema, history)
    schemaStore.triggerTableAccessUpdate()
  }

  const getSortedByHistory = (tables, schema) => {
    const history = readHistory(schema)
    if (!history.length) return tables

    return [...tables].sort((a, b) => {
      const aIdx = history.indexOf(a.name)
      const bIdx = history.indexOf(b.name)
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
      if (aIdx !== -1) return -1
      if (bIdx !== -1) return 1
      return 0
    })
  }

  return { logTableAccess, getSortedByHistory }
}
