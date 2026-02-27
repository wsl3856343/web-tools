<template>
  <div class="tool-card-view">
    <h1>Base64 编码/解码</h1>
    <el-radio-group v-model="mode" class="mode-selector">
      <el-radio-button label="encode">编码</el-radio-button>
      <el-radio-button label="decode">解码</el-radio-button>
    </el-radio-group>

    <el-input
      v-model="input"
      type="textarea"
      :rows="8"
      :placeholder="mode === 'encode' ? '请输入要编码的字符串' : '请输入要解码的 Base64 字符串'"
      class="input-textarea"
    />

    <div class="result-area">
      <h3>结果</h3>
      <el-input
        v-model="output"
        type="textarea"
        :rows="8"
        readonly
        placeholder="结果将显示在这里"
      />
    </div>
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
      output.value = btoa(unescape(encodeURIComponent(input.value)))
    } else {
      output.value = decodeURIComponent(escape(atob(input.value)))
    }
  } catch (e) {
    output.value = '输入内容无效'
    ElMessage.error('操作失败，请检查输入内容是否正确！')
  }
})
</script>

<style scoped>
.mode-selector {
  margin-bottom: var(--spacing-large);
}

.input-textarea {
  margin-bottom: var(--spacing-large);
}

.result-area h3 {
  margin-top: 0;
  margin-bottom: var(--spacing-medium);
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-secondary);
}
</style>