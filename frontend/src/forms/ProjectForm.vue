<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-position="top"
    class="portfolio-form"
  >
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="Полное имя" prop="fullName">
          <el-select
            v-model="form.fullName"
            placeholder="Выберите имя"
            filterable
            style="width: 100%"
          >
            <el-option v-for="name in fullNameOptions" :key="name" :label="name" :value="name" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Роль в проекте" prop="role">
          <el-input v-model="form.role" placeholder="Frontend Developer" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="Внутреннее название проекта" prop="projectNameInternal">
          <el-select
            v-model="form.projectNameInternal"
            placeholder="Выберите или введите"
            filterable
            allow-create
            style="width: 100%"
          >
            <el-option v-for="opt in projectOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Название проекта для CV" prop="projectNameCV">
          <el-input v-model="form.projectNameCV" placeholder="Название в резюме" />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="Начало проекта" prop="dateStart">
          <el-date-picker
            v-model="form.dateStart"
            type="date"
            placeholder="Выберите дату"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Конец проекта">
          <el-date-picker
            v-model="form.dateEnd"
            type="date"
            placeholder="Необязательно"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <template v-if="isOther">
      <el-divider content-position="left">
        <span class="divider-label">Дополнительные поля (Other)</span>
      </el-divider>

      <el-form-item label="Industry" prop="industry">
        <el-input v-model="form.industry" placeholder="e.g. FinTech" />
      </el-form-item>

      <el-form-item label="Tools" prop="tools">
        <div class="array-field">
          <div v-for="(item, idx) in form.tools" :key="idx" class="array-item">
            <el-input v-model="form.tools[idx]" placeholder="e.g. React" />
            <el-button :icon="Close" circle text type="danger" @click="removeItem('tools', idx)" />
          </div>
          <el-button text :icon="Plus" @click="addItem('tools')">Добавить</el-button>
        </div>
      </el-form-item>

      <el-form-item label="Core Business Topics" prop="coreBusinessTopics">
        <div class="array-field">
          <div v-for="(item, idx) in form.coreBusinessTopics" :key="idx" class="array-item">
            <el-input v-model="form.coreBusinessTopics[idx]" placeholder="e.g. Risk Management" />
            <el-button :icon="Close" circle text type="danger" @click="removeItem('coreBusinessTopics', idx)" />
          </div>
          <el-button text :icon="Plus" @click="addItem('coreBusinessTopics')">Добавить</el-button>
        </div>
      </el-form-item>

      <el-form-item label="Project Methods" prop="projectMethods">
        <div class="array-field">
          <div v-for="(item, idx) in form.projectMethods" :key="idx" class="array-item">
            <el-input v-model="form.projectMethods[idx]" placeholder="e.g. Scrum" />
            <el-button :icon="Close" circle text type="danger" @click="removeItem('projectMethods', idx)" />
          </div>
          <el-button text :icon="Plus" @click="addItem('projectMethods')">Добавить</el-button>
        </div>
      </el-form-item>

      <el-form-item label="Achievements" prop="achievements">
        <div class="array-field">
          <div v-for="(item, idx) in form.achievements" :key="idx" class="array-item">
            <el-input v-model="form.achievements[idx]" placeholder="e.g. Reduced load time by 40%" />
            <el-button :icon="Close" circle text type="danger" @click="removeItem('achievements', idx)" />
          </div>
          <el-button text :icon="Plus" @click="addItem('achievements')">Добавить</el-button>
        </div>
      </el-form-item>
    </template>

    <el-divider />

    <el-form-item>
      <el-checkbox v-model="form.generateCV">
        Запустить генерацию CV с новым проектом?
      </el-checkbox>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Close } from '@element-plus/icons-vue'
import { sendNewProject, getFullNames, getProjectNames } from '@/api/forms'

const emit = defineEmits(['success'])

const formRef = ref(null)
const fullNameOptions = ref([])
const projectOptions = ref([])

const loadOptions = async () => {
  try {
    const [devsRes, projRes] = await Promise.all([getFullNames(), getProjectNames()])
    fullNameOptions.value = devsRes.data
    projectOptions.value = [...projRes.data]
  } catch {
    ElMessage.error('Ошибка загрузки данных для выпадающих списков')
  }
}

onMounted(loadOptions)

const emptyForm = () => ({
  fullName: '',
  projectNameInternal: '',
  projectNameCV: '',
  role: '',
  dateStart: '',
  dateEnd: '',
  industry: '',
  tools: [''],
  coreBusinessTopics: [''],
  projectMethods: [''],
  achievements: [''],
  generateCV: false,
})

const form = reactive(emptyForm())
const isOther = computed(() => form.projectNameInternal === 'Other')

const otherArrayRule = (field) => ({
  validator: (rule, value, callback) => {
    if (!isOther.value) return callback()
    const filled = form[field].filter(v => v.trim() !== '')
    if (filled.length === 0) return callback(new Error('Добавьте хотя бы одно значение'))
    callback()
  },
  trigger: 'submit',
})

const rules = {
  fullName: [{ required: true, message: 'Обязательное поле', trigger: 'blur' }],
  projectNameInternal: [{ required: true, message: 'Обязательное поле', trigger: 'change' }],
  projectNameCV: [{ required: true, message: 'Обязательное поле', trigger: 'blur' }],
  role: [{ required: true, message: 'Обязательное поле', trigger: 'blur' }],
  dateStart: [{ required: true, message: 'Обязательное поле', trigger: 'change' }],
  industry: [{
    validator: (rule, value, callback) => {
      if (isOther.value && !value.trim()) return callback(new Error('Обязательное поле'))
      callback()
    },
    trigger: 'blur',
  }],
  tools: [otherArrayRule('tools')],
  coreBusinessTopics: [otherArrayRule('coreBusinessTopics')],
  projectMethods: [otherArrayRule('projectMethods')],
  achievements: [otherArrayRule('achievements')],
}

const toPgArray = (arr) => {
  const escaped = arr.map(v => `"${v.replace(/"/g, '\\"')}"`)
  return `{${escaped.join(',')}}`
}

const addItem = (field) => form[field].push('')

const removeItem = (field, idx) => {
  if (form[field].length > 1) form[field].splice(idx, 1)
  else form[field][0] = ''
}

const reset = () => {
  Object.assign(form, emptyForm())
  formRef.value?.clearValidate()
}

// Called by parent via template ref
const submit = async () => {
  return new Promise((resolve) => {
    formRef.value.validate(async (valid) => {
      if (!valid) return resolve(false)

      const payload = {
        fullName: form.fullName,
        projectNameInternal: form.projectNameInternal,
        projectNameCV: form.projectNameCV,
        role: form.role,
        dateStart: form.dateStart,
        dateEnd: form.dateEnd || null,
        ...(isOther.value && {
          industry: form.industry,
          tools: toPgArray(form.tools.filter(v => v.trim())),
          coreBusinessTopics: toPgArray(form.coreBusinessTopics.filter(v => v.trim())),
          projectMethods: toPgArray(form.projectMethods.filter(v => v.trim())),
          achievements: toPgArray(form.achievements.filter(v => v.trim())),
          neverRegenerate: true,
        }),
      }

      await sendNewProject(payload)

      if (form.generateCV) {
        try {
          ElMessage.info('Запускаем генерацию CV…')
          await fetch('https://n8n-prod.dyn-it.de/webhook/start-generation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': import.meta.env.VITE_N8N_API_KEY,
            },
            body: JSON.stringify({ fullName: form.fullName }),
          })
          ElMessage.success('Генерация CV успешно запущена')
        } catch {
          ElMessage.error('Не удалось запустить генерацию CV')
        }
      }

      emit('success')
      reset()
      resolve(true)
    })
  })
}

defineExpose({ submit, reset })
</script>

<style scoped>
@import '@/styles/forms.css';

.portfolio-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--color-secondary);
  padding-bottom: 4px;
}
</style>
