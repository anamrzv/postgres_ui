<template>
  <div class="forms-page">
    <div class="tiles-grid">
      <div
        v-for="formConfig in FORMS"
        :key="formConfig.id"
        class="form-tile"
        @click="openDialog(formConfig)"
      >
        <div class="tile-icon">
          <el-icon :size="36" color="#915af0">
            <component :is="formConfig.icon" />
          </el-icon>
        </div>
        <div class="tile-title">{{ formConfig.title }}</div>
        <div class="tile-desc">{{ formConfig.desc }}</div>
      </div>
    </div>

    <!-- Dynamic Form Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="activeForm?.dialogTitle"
      :width="activeForm?.dialogWidth || '680px'"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <component
        :is="resolvedComponent"
        ref="formRef"
        @success="handleSuccess"
      />

      <template #footer>
        <el-button @click="dialogVisible = false">Отмена</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ activeForm?.submitLabel || 'Сохранить' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, shallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import { FORMS } from '@/config/forms.config'

const dialogVisible = ref(false)
const submitting = ref(false)
const activeForm = ref(null)
const resolvedComponent = shallowRef(null)
const formRef = ref(null)

const openDialog = async (formConfig) => {
  activeForm.value = formConfig
  resolvedComponent.value = (await formConfig.component()).default
  dialogVisible.value = true
}

const handleClose = () => {
  formRef.value?.reset?.()
  activeForm.value = null
  resolvedComponent.value = null
}

const handleSubmit = async () => {
  if (!formRef.value?.submit) return
  submitting.value = true
  try {
    await formRef.value.submit()
  } finally {
    submitting.value = false
  }
}

const handleSuccess = () => {
  ElMessage.success('Успешно сохранено')
  dialogVisible.value = false
}
</script>

<style scoped>
@import '@/styles/forms.css';
</style>