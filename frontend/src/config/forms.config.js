export const FORMS = [
  {
    id: 'new_project',
    title: 'Внести проект для портфолио',
    desc: 'Заполните информацию о проекте',
    icon: 'Document',
    dialogTitle: 'Внести проект для портфолио',
    dialogWidth: '680px',
    component: () => import('@/forms/ProjectForm.vue'),
  },
  {
    id: 'regen_project',
    title: 'Перегенерировать проект для портфолио',
    desc: 'Выберите сотрудника и проект для повторной генерации',
    icon: 'Refresh',
    dialogTitle: 'Перегенерировать проект для портфолио',
    dialogWidth: '500px',
    submitLabel: 'Запустить генерацию',
    component: () => import('@/forms/RegenProjectForm.vue'),
  },
]
