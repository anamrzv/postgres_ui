<template>
  <el-container class="main-layout">
    <!-- Sidebar -->
    <el-aside width="250px" class="sidebar">
      <div class="logo">
        <el-icon><DataAnalysis /></el-icon>
        <span>DYN-IT PostgreSQL</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        router
      >
        <el-menu-item index="/">
          <el-icon><Odometer /></el-icon>
          <span>Дашборд</span>
        </el-menu-item>
        
        <el-menu-item index="/tables">
          <el-icon><Grid /></el-icon>
          <span>Таблицы</span>
        </el-menu-item>

        <el-menu-item index="/forms">
          <el-icon><Document /></el-icon>
          <span>Формы</span>
        </el-menu-item>

      </el-menu>
    </el-aside>

    <!-- Main content -->
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <h2>{{ pageTitle }}</h2>
          <span class="header-compliment">{{ compliment }}</span>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Odometer, Grid, TrendCharts, DataAnalysis, Document } from '@element-plus/icons-vue'

const route = useRoute()

const activeMenu = computed(() => route.path)

const pageTitle = computed(() => {
  const titles = {
    '/': 'Дашборд',
    '/tables': 'Таблицы',
    '/forms': 'Формы',
    '/analytics': 'Аналитика'
  }
  return titles[route.path] || 'PostgreSQL UI'
})

const compliments = [
  '✨ Ты делаешь отличную работу!',
  '🚀 Продуктивного дня!',
  '💡 Каждый запрос — шаг к успеху!',
  '🌟 Ты справишься со всем сегодня!',
  '☕ Хорошего кофе и чистых данных!',
  '🎯 Фокус, энергия, результат!',
  '💪 Ты в ударе сегодня!',
  '🌈 Пусть баги обходят тебя стороной!',
  '🏆 Лучший день для больших свершений!',
  '😊 Улыбнись — всё идёт по плану!',
  '🔥 Данные не устоят перед тобой!',
  '🌸 Пусть этот день будет лёгким!',
  '⚡ Энергия на максимуме!',
  '🎉 Ты уже на правильном пути!',
  '🦋 Твоя работа имеет значение!',
  '🐸 Ну и нормально, ну и ладно',
  '🧠 Я всё понял, но не скажу',
  '😤 Краб — символ надежды',
  '🗿 Всё идёт по плану',
  '🤙 Збс, продолжаем',
  '🐧 Это норм, я так задумал',
  '😎 Пацан к успеху шёл',
  '🦆 Утка одобряет твой код',
  '🧊 Сохраняй хладнокровие',
  '🎪 Цирк уехал, клоуны остались в продакшне',
  '🐻 Терпи, казак — атаманом будешь',
  '🌚 Ну и хорошо, ну и отлично',
  '🍉 Всё сложно, но ты держишься',
]

const compliment = compliments[Math.floor(Math.random() * compliments.length)]
</script>

<style scoped>
@import '@/styles/main-layout.css';

.header-compliment {
  font-size: 0.85rem;
  color: var(--color-secondary, #915af0);
  opacity: 0.85;
  font-style: italic;
  margin-left: auto;
}
</style>
