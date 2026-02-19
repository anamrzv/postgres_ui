<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-position="top"
    class="portfolio-form"
  >
    <el-form-item label="Полное имя" prop="fullName">
      <el-select
        v-model="form.fullName"
        placeholder="Выберите имя"
        filterable
        style="width: 100%"
        @change="onNameChange"
      >
        <el-option v-for="name in fullNameOptions" :key="name" :label="name" :value="name" />
      </el-select>
    </el-form-item>

    <el-form-item label="Проект" prop="projectId">
      <el-select
        v-model="form.projectId"
        placeholder="Выберите проект"
        filterable
        style="width: 100%"
        :disabled="!form.fullName"
        :loading="projectsLoading"
      >
        <el-option v-for="proj in projectOptions" :key="proj.id" :label="proj.name" :value="proj.id" />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getFullNames, getProjectsByPerson } from '@/api/forms'

const emit = defineEmits(['success'])

const formRef = ref(null)
const fullNameOptions = ref([])
const projectOptions = ref([])
const projectsLoading = ref(false)

onMounted(async () => {
  try {
    const res = await getFullNames()
    fullNameOptions.value = res.data
  } catch {
    ElMessage.error('Ошибка загрузки списка имён')
  }
})

const emptyForm = () => ({
  fullName: '',
  projectId: '',
})

const form = reactive(emptyForm())

const onNameChange = async (name) => {
  form.projectId = ''
  projectOptions.value = []
  if (!name) return
  projectsLoading.value = true
  try {
    const res = await getProjectsByPerson(name)
    projectOptions.value = res.data
  } catch {
    ElMessage.error('Ошибка загрузки проектов')
  } finally {
    projectsLoading.value = false
  }
}

const rules = {
  fullName: [{ required: true, message: 'Обязательное поле', trigger: 'change' }],
  projectId: [{ required: true, message: 'Обязательное поле', trigger: 'change' }],
}

const reset = () => {
  Object.assign(form, emptyForm())
  projectOptions.value = []
  formRef.value?.clearValidate()
}

const submit = async () => {
  return new Promise((resolve) => {
    formRef.value.validate(async (valid) => {
      if (!valid) return resolve(false)

      try {
        ElMessage.info('Запускаем регенерацию…')
        await fetch('https://n8n-prod.dyn-it.de/webhook/start-generation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': import.meta.env.VITE_N8N_API_KEY,
          },
          body: JSON.stringify({ fullName: form.fullName, projectId: form.projectId }),
        })
        emit('success')
        reset()
        resolve(true)
      } catch {
        ElMessage.error('Не удалось запустить регенерацию')
        resolve(false)
      }
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
