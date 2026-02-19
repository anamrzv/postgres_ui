<template>
  <div class="dashboard">
    <!-- Schema Selector -->
    <div style="margin-bottom: 20px;">
      <el-select 
        v-model="selectedSchema" 
        placeholder="Выберите схему"
        @change="onSchemaChange"
        style="width: 300px;"
      >
        <el-option
          v-for="schema in schemas"
          :key="schema"
          :label="schema"
          :value="schema"
        />
      </el-select>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" :size="40" color="#915af0">
              <Grid />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.tableCount }}</div>
              <div class="stat-label">Таблиц</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>Недавние таблицы</span>
              <el-button text @click="$router.push('/tables')">Все таблицы</el-button>
            </div>
          </template>
          <el-table :data="recentTables" style="width: 100%">
            <el-table-column prop="name" label="Таблица" />
            <el-table-column label="Действия" width="100">
              <template #default="{ row }">
                <el-button text type="primary" @click="openTable(row.name)">
                  Открыть
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Grid } from '@element-plus/icons-vue'
import { getSchemasList, getTablesList } from '@/api/tables'
import { useSchemaStore } from '@/stores/schema'
import { useTableHistory } from '@/composables/useTableHistory'

const router = useRouter()
const schemaStore = useSchemaStore()
const { logTableAccess, getSortedByHistory } = useTableHistory()

const schemas = ref([])
const selectedSchema = ref(schemaStore.selectedSchema)
const stats = ref({ tableCount: 0 })
const recentTables = ref([])

const loadSchemas = async () => {
  try {
    const response = await getSchemasList()
    schemas.value = response.data
    if (!response.data.includes(selectedSchema.value)) {
      selectedSchema.value = response.data[0] || 'public'
    }
  } catch {
    // ignore
  }
}

const loadData = async () => {
  try {
    const response = await getTablesList(selectedSchema.value)
    const allTables = response.data
    stats.value.tableCount = allTables.length
    recentTables.value = getSortedByHistory(allTables, selectedSchema.value).slice(0, 5)
  } catch {
    // ignore
  }
}

const onSchemaChange = () => {
  schemaStore.setSchema(selectedSchema.value)
  loadData()
}

const openTable = (tableName) => {
  logTableAccess(selectedSchema.value, tableName)
  router.push(`/table/${selectedSchema.value}/${tableName}`)
}

watch(() => schemaStore.tableAccessUpdated, loadData)

onMounted(async () => {
  await loadSchemas()
  await loadData()
})
</script>

<style scoped>
@import '@/styles/dashboard.css';
</style>
