<template>
  <div class="tool-card-view">
    <h1>URL 编码/解码</h1>
    <el-radio-group v-model="mode">
      <el-radio-button label="encode">编码</el-radio-button>
      <el-radio-button label="decode">解码</el-radio-button>
    </el-radio-group>

    <el-input
      v-model="input"
      type="textarea"
      :rows="8"
      :placeholder="mode === 'encode' ? '请输入要编码的 URL 或字符串' : '请输入要解码的 URL 或字符串'"
    />
    <div class="arrow">↓ ↑</div>
    <el-input
      v-model="output"
      type="textarea"
      :rows="8"
      readonly
      placeholder="结果将显示在这里"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const mode = ref('encode')
const input = ref('')
const output = ref('')

watch([input, mode], () => {
  if (!input.value) {
    output.value = ''
    return
  }
  try {
    if (mode.value === 'encode') {
      output.value = encodeURIComponent(input.value)
    } else {
      output.value = decodeURIComponent(input.value)
    }
  } catch (e) {
    output.value = '输入内容无效'
    ElMessage.error('操作失败，请检查输入内容是否正确！')
  }
})
</script>

<style scoped>
.el-radio-group {
  margin-bottom: var(--spacing-large);
}

.arrow {
  text-align: center;
  font-size: 24px;
  margin: var(--spacing-small) 0;
  color: var(--color-text-secondary);
}
</style>