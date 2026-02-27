<template>
  <div class="tool-card-view">
    <h1>UUID 生成器</h1>
    <div class="generator-controls">
      <span>生成数量:</span>
      <el-input-number v-model="count" :min="1" :max="100" />
      <el-button type="primary" @click="generateUuids">生成</el-button>
    </div>
    <div v-if="uuids.length" class="result-list">
      <el-card>
        <div v-for="(id, index) in uuids" :key="index" class="uuid-item">
          <span>{{ id }}</span>
          <el-button link type="primary" @click="copyToClipboard(id)">复制</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { ElMessage } from 'element-plus'

const count = ref(5)
const uuids = ref([])

const generateUuids = () => {
  uuids.value = []
  for (let i = 0; i < count.value; i++) {
    uuids.value.push(uuidv4())
  }
  ElMessage.success(`成功生成 ${count.value} 个 UUID！`)
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板！')
  } catch (err) {
    ElMessage.error('复制失败！')
  }
}

// Initial generation
generateUuids()
</script>

<style scoped>
.generator-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-medium);
  margin-bottom: 20px;
}
.result-list {
  margin-top: 20px;
}
.uuid-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}
.uuid-item:last-child {
  border-bottom: none;
}
</style>