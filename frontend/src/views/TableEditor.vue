<template>
  <div class="table-editor">
    <el-card>
      <template #header>
        <div class="card-header">
          <div>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/tables' }">Таблицы</el-breadcrumb-item>
              <el-breadcrumb-item>{{ tableName }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-actions">
            <el-button type="primary" :icon="Plus" @click="handleAdd">
              Добавить запись
            </el-button>
            <el-button :icon="Refresh" @click="loadData">Обновить</el-button>
          </div>
        </div>
      </template>

      <!-- Filters -->
      <div class="filters" v-if="columns.length > 0">
        <el-input
          v-model="searchQuery"
          placeholder="Поиск..."
          :prefix-icon="Search"
          style="width: 300px; margin-right: 10px;"
          clearable
        />
        <el-select
          v-model="selectedColumn"
          placeholder="Колонка для поиска"
          style="width: 200px; margin-right: 10px;"
        >
          <el-option
            v-for="col in columns"
            :key="col.column_name"
            :label="col.column_name"
            :value="col.column_name"
          />
        </el-select>
      </div>

      <!-- Data Table -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%; margin-top: 20px;"
        border
        :row-style="{ maxHeight: '60px' }"
        :cell-style="{ padding: '8px' }"
      >
        <el-table-column
          v-for="column in columns"
          :key="column.column_name"
          :prop="column.column_name"
          :min-width="150"
        >
          <template #header>
            <div 
              @click="handleSort(column.column_name)"
              style="cursor: pointer; user-select: none; display: flex; align-items: center; gap: 5px;"
            >
              <span>{{ column.column_name }}</span>
              <span v-if="sortColumn === column.column_name">
                <span v-if="sortOrder === 'asc'" style="color: var(--color-teal);">↑</span>
                <span v-else-if="sortOrder === 'desc'" style="color: var(--color-teal);">↓</span>
              </span>
            </div>
          </template>
          <template #default="{ row, $index }">
            <div 
              v-if="expandedCells.has(`${$index}-${column.column_name}`)"
              class="table-cell-expanded"
            >
              {{ formatValue(row[column.column_name]) }}
              <el-icon 
                class="expand-icon"
                @click="toggleCellExpansion($index, column.column_name)"
                style="cursor: pointer; margin-left: 8px;"
              >
                <component :is="'ArrowUp'" />
              </el-icon>
            </div>
            <el-tooltip 
              v-else
              :content="String(row[column.column_name])"
              placement="top"
              :disabled="!isTextTruncated(`${$index}-${column.column_name}`)"
              popper-class="table-tooltip"
            >
              <div 
                :ref="el => { if (el) cellRefs[`${$index}-${column.column_name}`] = el }"
                class="table-cell-content"
                @click="toggleCellExpansion($index, column.column_name)"
                style="cursor: pointer;"
              >
                {{ formatValue(row[column.column_name]) }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <el-table-column label="Действия" width="150" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" :icon="Edit" @click="handleEdit(row)">
              Изменить
            </el-button>
            <el-button text type="danger" :icon="Delete" @click="handleDelete(row)">
              Удалить
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        v-if="pagination.total > 0"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 25, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: center;"
        @current-change="loadData"
        @size-change="loadData"
      />
    </el-card>

    <!-- Edit/Add Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'edit' ? 'Редактировать запись' : 'Добавить запись'"
      width="760px"
      :close-on-click-modal="false"
      class="record-dialog"
    >
      <el-form :model="formData" label-position="top" class="record-form">
        <el-row :gutter="12">
          <template v-for="column in visibleColumns" :key="column.column_name">
            <el-col :span="colSpan(column)">
              <el-form-item
                :class="{ 'is-required-field': isColumnRequired(column.column_name) }"
              >
                <template #label>
                  <span class="field-label">
                    {{ column.column_name }}
                    <span v-if="isColumnRequired(column.column_name)" class="required-star">*</span>
                    <span class="field-type">{{ getColumnType(column.column_name) }}</span>
                  </span>
                </template>

                <!-- Boolean -->
                <div v-if="getColumnType(column.column_name) === 'boolean'" class="bool-wrap">
                  <el-switch
                    v-model="formData[column.column_name]"
                    active-text="Да"
                    inactive-text="Нет"
                  />
                </div>

                <!-- Date -->
                <el-date-picker
                  v-else-if="isDateType(getColumnType(column.column_name))"
                  v-model="formData[column.column_name]"
                  type="date"
                  placeholder="Выберите дату"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />

                <!-- Disabled PK in edit mode only if auto-generated -->
                <el-input
                  v-else-if="column.column_name === primaryKey && dialogMode === 'edit' && isAutoGeneratedColumn(column.column_name)"
                  v-model="formData[column.column_name]"
                  disabled
                />

                <!-- Array type - one input per item -->
                <div
                  v-else-if="isArrayType(getColumnType(column.column_name))"
                  class="array-field"
                >
                  <div
                    v-for="(item, idx) in (formData[column.column_name] || [])"
                    :key="idx"
                    class="array-item"
                  >
                    <el-input v-model="formData[column.column_name][idx]" placeholder="Значение" />
                    <el-button
                      :icon="Close"
                      circle
                      text
                      type="danger"
                      @click="removeArrayItem(column.column_name, idx)"
                    />
                  </div>
                  <el-button text :icon="Plus" @click="addArrayItem(column.column_name)">Добавить</el-button>
                </div>

                <!-- Textarea for long text types -->
                <el-input
                  v-else-if="isLongTextType(getColumnType(column.column_name))"
                  v-model="formData[column.column_name]"
                  type="textarea"
                  :rows="3"
                  :placeholder="isColumnRequired(column.column_name) ? 'Обязательное поле' : 'Опционально'"
                />

                <!-- Default input -->
                <el-input
                  v-else
                  v-model="formData[column.column_name]"
                  :placeholder="isColumnRequired(column.column_name) ? 'Обязательное поле' : 'Опционально'"
                  clearable
                />
              </el-form-item>
            </el-col>
          </template>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <span class="required-hint"><span class="required-star">*</span> — обязательные поля</span>
          <div class="footer-actions">
            <el-button size="large" @click="dialogVisible = false">Отмена</el-button>
            <el-button size="large" type="primary" @click="handleSave">Сохранить</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Refresh, Search, Edit, Delete, ArrowUp, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTableSchema, getTableData, createRow, updateRow, deleteRow } from '@/api/tables'
import { useTableHistory } from '@/composables/useTableHistory'

const route = useRoute()
const schema = ref(route.params.schema)
const tableName = ref(route.params.tableName)

const { logTableAccess } = useTableHistory()

const loading = ref(false)
const columns = ref([])
const rawTableData = ref([])
const primaryKey = ref('id')
const searchQuery = ref('')
const selectedColumn = ref('')
const sortColumn = ref('')
const sortOrder = ref('')
const expandedCells = ref(new Set())
const cellRefs = ref({})

const toggleCellExpansion = (rowIndex, columnName) => {
  const key = `${rowIndex}-${columnName}`
  if (expandedCells.value.has(key)) {
    expandedCells.value.delete(key)
  } else {
    expandedCells.value.add(key)
  }
}

const isTextTruncated = (cellKey) => {
  const el = cellRefs.value[cellKey]
  if (!el) return false
  return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight
}

const getColumnType = (columnName) => {
  const column = columns.value.find(col => col.column_name === columnName)
  return column?.data_type ? String(column.data_type).toLowerCase() : 'text'
}

const isNumericType = (dataType) => {
  const numericTypes = ['integer', 'bigint', 'smallint', 'numeric', 'decimal', 'real', 'double precision', 'money', 'serial', 'bigserial', 'smallserial']
  return numericTypes.includes(dataType)
}

const isDateType = (dataType) => {
  const dateTypes = ['date', 'timestamp', 'timestamp without time zone', 'timestamp with time zone', 'time', 'time without time zone', 'time with time zone']
  return dateTypes.includes(dataType)
}

const isArrayType = (dataType) => dataType === 'array' || dataType.endsWith('[]')

const isColumnRequired = (columnName) => {
  const column = columns.value.find(col => col.column_name === columnName)
  return column?.is_nullable === 'NO'
}

const AUTO_GEN_PATTERNS = ['nextval', 'gen_random_uuid', 'uuid_generate_v1', 'uuid_generate_v4', 'gen_random_bytes', 'now()', 'current_timestamp', 'current_date', 'current_time']

const isAutoGeneratedColumn = (columnName) => {

  const column = columns.value.find(col => col.column_name === columnName)
  if (!column || typeof column.column_default !== 'string') return false
  const def = column.column_default.toLowerCase()
  return AUTO_GEN_PATTERNS.some(p => def.includes(p))
}

const detectPrimaryKey = (cols) => {
  if (!Array.isArray(cols) || cols.length === 0) return 'id'

  const byFlag = cols.find(col => col.is_primary_key)
  if (byFlag?.column_name) return byFlag.column_name

  const byDefault = cols.find(col => typeof col.column_default === 'string' && col.column_default.includes('nextval'))
  if (byDefault?.column_name) return byDefault.column_name

  const byName = cols.find(col => col.column_name === 'id')
  if (byName?.column_name) return byName.column_name

  const bySuffix = cols.find(col => col.column_name.endsWith('_id'))
  if (bySuffix?.column_name) return bySuffix.column_name

  return cols[0].column_name
}

const isLongTextType = (dataType) => {
  return ['text', 'json', 'jsonb', 'xml', 'character varying', 'varchar', 'array', 'ARRAY'].includes(dataType)
    || dataType.endsWith('[]')
}

const toPgArray = (arr) => {
  const escaped = arr.map(v => `"${String(v).replace(/"/g, '\\"')}"`)
  return `{${escaped.join(',')}}`
}

const addArrayItem = (columnName) => {
  if (!Array.isArray(formData.value[columnName])) {
    formData.value[columnName] = []
  }
  formData.value[columnName].push('')
}

const removeArrayItem = (columnName, idx) => {
  if (formData.value[columnName].length > 1) {
    formData.value[columnName].splice(idx, 1)
  } else {
    formData.value[columnName][0] = ''
  }
}

const colSpan = (column) => {
  const type = getColumnType(column.column_name)
  if (isLongTextType(type)) return 24
  if (type === 'boolean') return 12
  return 12
}

const visibleColumns = computed(() => {
  return columns.value.filter(col =>
    dialogMode.value === 'edit' || !isAutoGeneratedColumn(col.column_name)
  )
})

const formatArrayForInput = (value) => {
  if (!Array.isArray(value)) return value
  const escaped = value.map(item => String(item).replace(/"/g, '\\"'))
  return `{${escaped.map(item => `"${item}"`).join(',')}}`
}

const parseArrayFromInput = (value) => {
  if (!value || typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return value
  const inner = trimmed.slice(1, -1).trim()
  if (!inner) return []
  const parts = inner.split(/","/)
  return parts.map(part => part.replace(/^"/, '').replace(/"$/, '').replace(/\\"/g, '"'))
}

const tableData = computed(() => {
  let result = [...rawTableData.value]

  if (searchQuery.value && selectedColumn.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(row => {
      const val = row[selectedColumn.value]
      return val != null && String(val).toLowerCase().includes(query)
    })
  }

  if (sortColumn.value && sortOrder.value) {
    const colType = getColumnType(sortColumn.value)
    const dir = sortOrder.value === 'asc' ? 1 : -1

    result.sort((a, b) => {
      const aVal = a[sortColumn.value]
      const bVal = b[sortColumn.value]

      if (aVal == null) return dir
      if (bVal == null) return -dir

      if (isNumericType(colType)) return dir * (Number(aVal) - Number(bVal))
      if (isDateType(colType)) return dir * (new Date(aVal) - new Date(bVal))

      if (colType === 'boolean') {
        const aBool = aVal === true || aVal === 'true' || aVal === 't'
        const bBool = bVal === true || bVal === 'true' || bVal === 't'
        if (aBool === bBool) return 0
        return dir * (aBool ? 1 : -1)
      }

      return dir * String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase())
    })
  }

  return result
})

const pagination = ref({
  page: 1,
  limit: 50,
  total: 0
})

const dialogVisible = ref(false)
const dialogMode = ref('add')
const formData = ref({})

const loadSchema = async () => {
  try {
    const response = await getTableSchema(schema.value, tableName.value)
    columns.value = response.data.columns
    primaryKey.value = detectPrimaryKey(columns.value)
  } catch {
    ElMessage.error('Ошибка загрузки схемы таблицы')
  }
}

const handleSort = (columnName) => {
  if (sortColumn.value === columnName) {
    if (sortOrder.value === 'asc') {
      sortOrder.value = 'desc'
    } else if (sortOrder.value === 'desc') {
      sortOrder.value = ''
      sortColumn.value = ''
    }
  } else {
    sortColumn.value = columnName
    sortOrder.value = 'asc'
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }
    
    const response = await getTableData(schema.value, tableName.value, params)
    rawTableData.value = response.data
    
    const paginationData = response.pagination
    pagination.value = {
      page: Number(paginationData.page),
      limit: Number(paginationData.limit),
      total: Number(paginationData.total),
      totalPages: Number(paginationData.totalPages)
    }
  } catch {
    ElMessage.error('Ошибка загрузки данных')
  } finally {
    loading.value = false
  }
}

const parseDefaultValue = (raw) => {
  let val = raw.includes('::') ? raw.split('::')[0] : raw
  return val.replace(/^'|'$/g, '').trim()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  const data = {}
  columns.value.forEach(col => {
    if (isArrayType(getColumnType(col.column_name))) {
      data[col.column_name] = ['']
    } else if (col.column_default && !isAutoGeneratedColumn(col.column_name)) {
      data[col.column_name] = parseDefaultValue(col.column_default)
    }
  })
  formData.value = data
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogMode.value = 'edit'
  const data = {}
  columns.value.forEach(col => {
    const type = getColumnType(col.column_name)
    const value = row[col.column_name]
    data[col.column_name] = isArrayType(type) ? (Array.isArray(value) ? [...value] : ['']) : value
  })
  formData.value = data
  dialogVisible.value = true
}

const handleSave = async () => {
  try {
    const payload = { ...formData.value }
    columns.value.forEach(col => {
      const type = getColumnType(col.column_name)
      if (isArrayType(type) && Array.isArray(payload[col.column_name])) {
        const filtered = payload[col.column_name].filter(v => String(v).trim() !== '')
        payload[col.column_name] = toPgArray(filtered)
      }
    })

    if (dialogMode.value === 'add') {
      await createRow(schema.value, tableName.value, payload)
      ElMessage.success('Запись добавлена')
    } else {
      const id = payload[primaryKey.value]
      await updateRow(schema.value, tableName.value, id, payload)
      ElMessage.success('Запись обновлена')
    }
    
    dialogVisible.value = false
    loadData()
  } catch {
    // error message is already shown by the axios interceptor
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      'Вы уверены, что хотите удалить эту запись?',
      'Подтверждение',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }
    )
    
    const id = row[primaryKey.value]
    await deleteRow(schema.value, tableName.value, id)
    ElMessage.success('Запись удалена')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Ошибка удаления')
    }
  }
}

const formatValue = (value) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет'
  if (typeof value === 'object') return JSON.stringify(value)
  return value
}

onMounted(async () => {
  logTableAccess(schema.value, tableName.value)
  await loadSchema()
  await loadData()
})
</script>

<style scoped>
@import '@/styles/table-editor.css';

/* El-table deep overrides */
:deep(.el-table__cell) {
  text-align: left !important;
}

:deep(.el-table__header-wrapper th) {
  background-color: rgba(11, 27, 91, 0.04) !important;
  color: var(--color-secondary);
  font-weight: 600;
}

:deep(.el-table__fixed-right) {
  background-color: #fff;
}

:deep(.el-table__fixed-right .el-table__cell),
:deep(.el-table td.el-table-fixed-column--right),
:deep(.el-table th.el-table-fixed-column--right) {
  background-color: #fff !important;
}

:deep(.el-table tr:hover td.el-table-fixed-column--right) {
  background-color: #f5f7fa !important;
}

:deep(.el-pagination .el-pager li.is-active) {
  background-color: var(--color-violet);
  color: #fff;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  color: var(--color-violet);
}

:deep(.table-tooltip .el-popper__content) {
  word-break: break-word;
  white-space: normal;
  max-width: 500px;
}

/* Dialog deep overrides */
:deep(.record-dialog .el-dialog__body) {
  padding-right: 16px;
}

.is-required-field :deep(.el-input__wrapper) {
  border-left: 3px solid var(--color-coral);
}

.is-required-field :deep(.el-textarea__inner) {
  border-left: 3px solid var(--color-coral);
}

.is-required-field :deep(.el-date-editor) {
  border-left: 3px solid var(--color-coral);
}

.array-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.array-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.array-item :deep(.el-input) {
  flex: 1;
}
</style>

