<template>
  <div class="tables-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Список таблиц</span>
          <div style="display: flex; gap: 10px; align-items: center;">
            <el-input
              v-model="searchQuery"
              placeholder="Поиск таблиц..."
              style="width: 300px;"
              :prefix-icon="Search"
              clearable
            />
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="filteredTables"
        style="width: 100%"
        @row-click="handleRowClick"
        class="clickable-table"
      >
        <el-table-column prop="table_name" label="Таблица" width="300">
          <template #default="{ row }">
            <el-icon color="#28aaa0"><Grid /></el-icon>
            <span style="margin-left: 10px;">{{ row.name }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="table_schema" label="Схема" width="150">
          <template #default="{ row }">
            <el-icon color="#915af0"><Grid /></el-icon>
            <span style="margin-left: 10px;">{{ row.schema }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="Действия" width="200">
          <template #default="{ row }">
            <el-button
              type="primary"
              text
              @click.stop="openTable(row.schema, row.name)"
            >
              <el-icon><Edit /></el-icon> Редактировать
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Grid, Edit } from '@element-plus/icons-vue'
import { getTablesList } from '@/api/tables'
import { useSchemaStore } from '@/stores/schema'
import { ElMessage } from 'element-plus'
import { useTableHistory } from '@/composables/useTableHistory'

const router = useRouter()
const schemaStore = useSchemaStore()
const { logTableAccess } = useTableHistory()

const loading = ref(false)
const searchQuery = ref('')
const tables = ref([])

const filteredTables = computed(() => {
  if (!searchQuery.value) return tables.value
  const query = searchQuery.value.toLowerCase()
  return tables.value.filter(table => table.name.toLowerCase().includes(query))
})

const loadTables = async () => {
  loading.value = true
  try {
    const response = await getTablesList(schemaStore.selectedSchema)
    tables.value = response.data
  } catch {
    ElMessage.error('Ошибка загрузки таблиц')
  } finally {
    loading.value = false
  }
}

const openTable = (schema, tableName) => {
  logTableAccess(schema, tableName)
  router.push(`/table/${schema}/${tableName}`)
}

const handleRowClick = (row) => openTable(row.schema, row.name)

onMounted(loadTables)
watch(() => schemaStore.selectedSchema, loadTables)
</script>

<style scoped>
@import '@/styles/tables-list.css';

.clickable-table :deep(.el-table__row) {
  cursor: pointer;
}

.clickable-table :deep(.el-table__row:hover td) {
  background-color: rgba(40, 170, 160, 0.06) !important;
}
</style>
