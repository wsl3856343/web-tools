<template>
  <div class="tool-card-view">
    <h1>JWT 解析</h1>
    <el-input
      v-model="jwtToken"
      type="textarea"
      :rows="5"
      placeholder="在此处粘贴你的 JWT"
      class="jwt-input"
    />
    <div class="actions">
      <el-button type="primary" @click="parseToken">解析</el-button>
    </div>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
      class="error-alert"
    />

    <el-row :gutter="20" v-if="decodedHeader && decodedPayload">
      <el-col :span="12">
        <div class="header-actions">
          <h3>Header (头部)</h3>
        </div>
        <div ref="headerEditorContainer" class="editor-container"></div>
      </el-col>
      <el-col :span="12">
        <div class="header-actions">
          <h3>Payload (载荷)</h3>
        </div>
        <div ref="payloadEditorContainer" class="editor-container"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { jwtDecode } from 'jwt-decode'
import * as monaco from 'monaco-editor'

const jwtToken = ref('')
const decodedHeader = ref(null)
const decodedPayload = ref(null)
const error = ref('')

const headerEditorContainer = ref(null)
const payloadEditorContainer = ref(null)

let headerEditor = null
let payloadEditor = null

const createEditor = (container, value) => {
  return monaco.editor.create(container, {
    value: JSON.stringify(value, null, 2),
    language: 'json',
    readOnly: true,
    automaticLayout: true,
    theme: 'vs-light',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    scrollbar: {
      vertical: 'hidden',
      horizontal: 'hidden'
    }
  })
}

const parseToken = () => {
  error.value = ''
  decodedHeader.value = null
  decodedPayload.value = null
  if (headerEditor) {
    headerEditor.dispose()
    headerEditor = null
  }
  if (payloadEditor) {
    payloadEditor.dispose()
    payloadEditor = null
  }

  if (!jwtToken.value) {
    error.value = 'JWT 不能为空'
    return
  }
  try {
    decodedHeader.value = jwtDecode(jwtToken.value, { header: true })
    decodedPayload.value = jwtDecode(jwtToken.value)
  } catch (e) {
    error.value = '无效的 JWT: ' + e.message
  }
}

watch([decodedHeader, decodedPayload], () => {
  nextTick(() => {
    if (decodedHeader.value && headerEditorContainer.value) {
      if (headerEditor) headerEditor.dispose()
      headerEditor = createEditor(headerEditorContainer.value, decodedHeader.value)
    }
    if (decodedPayload.value && payloadEditorContainer.value) {
      if (payloadEditor) payloadEditor.dispose()
      payloadEditor = createEditor(payloadEditorContainer.value, decodedPayload.value)
    }
  })
})

onUnmounted(() => {
  if (headerEditor) headerEditor.dispose()
  if (payloadEditor) payloadEditor.dispose()
})
</script>

<style scoped>
.jwt-input {
  margin-bottom: var(--spacing-medium);
}

.actions {
  margin-bottom: var(--spacing-large);
}

.error-alert {
  margin-bottom: var(--spacing-large);
}

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
  min-height: 150px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  resize: vertical;
  overflow: hidden;
}
</style>