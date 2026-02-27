<template>
  <div class="tool-card-view">
    <h1>JSON 工具 (自动格式化)</h1>
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
      style="margin-bottom: 15px;"
    />
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="header-actions">
          <h3>原始 JSON</h3>
          <el-button type="danger" @click="clearInput" size="small">清空</el-button>
        </div>
        <el-input
          v-model="jsonInput"
          type="textarea"
          :rows="15"
          placeholder="在此处粘贴 JSON 字符串，右侧将自动格式化"
        />
      </el-col>
      <el-col :span="12">
        <div class="header-actions">
          <h3>格式化结果</h3>
          <div class="actions-right">
            <el-button type="primary" @click="reformatJson" size="small">格式化</el-button>
            <el-button type="success" @click="minifyJson" size="small">压缩</el-button>
            <el-button type="warning" @click="unescapeJson" size="small">去转义</el-button>
          </div>
        </div>
        <div ref="jsonEditorContainer" class="editor-container"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as monaco from 'monaco-editor'

const jsonInput = ref('')
const error = ref('')
const jsonEditorContainer = ref(null)
let jsonEditor = null
let debounceTimer = null

onMounted(() => {
  if (jsonEditorContainer.value) {
    jsonEditor = monaco.editor.create(jsonEditorContainer.value, {
      theme: 'vs',
      language: 'json',
      readOnly: true,
      automaticLayout: true,
      minimap: { enabled: false },
      wordWrap: 'on',
    })
    // 确保初始状态为空白
    jsonEditor.setValue('')
  }
})

onUnmounted(() => {
  if (jsonEditor) {
    jsonEditor.dispose()
  }
  clearTimeout(debounceTimer)
})

// 监听输入框变化，实现自动格式化
watch(jsonInput, (newValue) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (!newValue.trim()) {
      error.value = ''
      if (jsonEditor) jsonEditor.setValue('')
      return
    }
    try {
      const jsonObj = JSON.parse(newValue)
      const formattedJson = JSON.stringify(jsonObj, null, 2)
      if (jsonEditor && jsonEditor.getValue() !== formattedJson) {
        jsonEditor.setValue(formattedJson)
      }
      error.value = '' // 成功解析后清除错误
    } catch (e) {
      // 输入过程中格式不完整是正常现象，给出友好提示
      error.value = 'JSON 格式不完整或无效，请继续输入...'
    }
  }, 300) // 延迟300毫秒触发，避免频繁刷新
})

/**
 * 递归地查找并解析对象/数组中被字符串化的JSON。
 */
const recursiveUnescape = (data) => {
  if (typeof data === 'string') {
    try {
      const trimmedData = data.trim()
      if (
        (trimmedData.startsWith('{') && trimmedData.endsWith('}')) ||
        (trimmedData.startsWith('[') && trimmedData.endsWith(']'))
      ) {
        const parsedData = JSON.parse(data)
        return recursiveUnescape(parsedData)
      }
    } catch (e) {
      return data
    }
  }
  if (Array.isArray(data)) return data.map((item) => recursiveUnescape(item))
  if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, recursiveUnescape(value)])
    )
  }
  return data
}

const reformatJson = () => {
  if (!jsonEditor) return
  const currentValue = jsonEditor.getValue()
  if (!currentValue.trim()) {
    ElMessage.warning('结果框中没有内容可格式化')
    return
  }
  try {
    const jsonObj = JSON.parse(currentValue)
    const formattedJson = JSON.stringify(jsonObj, null, 2)
    jsonEditor.setValue(formattedJson)
    error.value = ''
    ElMessage.success('已重新格式化！')
  } catch (e) {
    error.value = '结果框中的JSON格式无效'
    ElMessage.error('重新格式化失败！')
  }
}

const unescapeJson = () => {
  if (!jsonInput.value) {
    ElMessage.warning('请输入要去转义的 JSON 字符串')
    return
  }
  try {
    const initialObj = JSON.parse(jsonInput.value)
    const unescapedObj = recursiveUnescape(initialObj)
    jsonInput.value = JSON.stringify(unescapedObj, null, 2) // 更新输入框，将自动触发格式化
    ElMessage.success('去转义成功！内容已更新至输入框并自动格式化。')
  } catch (e) {
    error.value = 'JSON 格式无效或无法去转义: ' + e.message
    ElMessage.error('操作失败！请检查是否为完整的JSON。')
  }
}

const minifyJson = () => {
  if (!jsonInput.value) {
    ElMessage.warning('请输入要压缩的 JSON 字符串')
    return
  }
  try {
    const jsonObj = JSON.parse(jsonInput.value)
    const minifiedJson = JSON.stringify(jsonObj)
    if (jsonEditor) {
      jsonEditor.setValue(minifiedJson)
    }
    error.value = ''
    ElMessage.success('压缩成功！')
  } catch (e) {
    error.value = 'JSON 格式无效: ' + e.message
    ElMessage.error('JSON 格式无效！')
  }
}

const clearInput = () => {
  jsonInput.value = ''
  // editor 和 error 会通过 watch 自动清空
  ElMessage.info('已清空')
}
</script>

<style scoped>
/* The styles for .tool-card-view, h1, .el-button etc. are now global in theme.css */
/* We only keep styles specific to this component's layout */

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-medium);
}

h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.editor-container {
  height: 371px;
  resize: vertical;
}

/* We use :deep() here because the .el-textarea__inner is a child component */
:deep(.el-textarea__inner) {
  height: 371px; /* Match the editor height */
  resize: vertical;
}
</style>