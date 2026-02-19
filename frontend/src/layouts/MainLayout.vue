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
          <div class="header-actions">
            <el-button circle>
              <el-icon><Bell /></el-icon>
            </el-button>
            <el-button circle>
              <el-icon><Setting /></el-icon>
            </el-button>
          </div>
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
import { Odometer, Grid, TrendCharts, Bell, Setting, DataAnalysis, Document } from '@element-plus/icons-vue'

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
</script>

<style scoped>
@import '@/styles/main-layout.css';
</style>
