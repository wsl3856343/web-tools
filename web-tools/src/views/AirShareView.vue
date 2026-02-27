<template>
  <div class="tool-card-view air-share-view">
    <h1>隔空传送</h1>
    <p class="main-description">
      在此处粘贴文本，生成一个唯一的4位提取码，即可在另一台设备上凭码提取。内容将在服务器上加密保存24小时。
    </p>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="发送" name="send">
        <div class="send-panel">
          <el-input
            v-model="textToSend"
            type="textarea"
            :rows="10"
            placeholder="在此处粘贴或输入您要传送的文本内容（最大10MB）"
            @input="validateSize"
          />
          <div class="send-actions action-button-container">
            <span class="size-info" :class="{ 'error': isOverLimit }">
              大小: {{ currentSize }} / 10 MB
            </span>
            <el-button
              type="primary"
              @click="handleSend"
              :loading="isSending"
              :disabled="!textToSend || isOverLimit"
            >
              生成提取码
            </el-button>
          </div>
          <el-alert
            v-if="sendError"
            :title="sendError"
            type="error"
            show-icon
            :closable="false"
            class="status-alert"
          />
          <div v-if="retrievalCode" class="retrieval-code-wrapper">
            <el-alert
              title="生成成功！请在其他设备上使用以下提取码获取内容："
              type="success"
              :closable="false"
              show-icon
            />
            <div class="retrieval-code-display">
              <span class="code">{{ retrievalCode }}</span>
              <el-button
                :icon="CopyDocument"
                circle
                plain
                @click="copyCode"
                class="copy-button"
                title="复制提取码"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="接收" name="receive">
        <div class="receive-panel">
          <el-input
            v-model="codeToReceive"
            placeholder="请输入4位提取码"
            maxlength="4"
            class="code-input"
          />
          <el-button
            type="primary"
            @click="handleReceive"
            :loading="isReceiving"
            :disabled="codeToReceive.length !== 4"
            class="action-button-container"
          >
            提取内容
          </el-button>
          <el-alert
            v-if="receiveError"
            :title="receiveError"
            type="error"
            show-icon
            :closable="false"
            class="status-alert"
          />
          <div v-if="receivedText" class="received-text-wrapper">
            <h3>提取到的内容：</h3>
            <el-input
              v-model="receivedText"
              type="textarea"
              :rows="10"
              readonly
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import { db } from '../firebase' // 引入 Firebase 数据库实例
import * as database from 'firebase/database' // 将整个模块导入为 'database' 命名空间

// --- 状态 State ---
const activeTab = ref('send')

// 发送状态
const textToSend = ref('')
const isSending = ref(false)
const sendError = ref('')
const retrievalCode = ref('')
const isOverLimit = ref(false)
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

// 接收状态
const codeToReceive = ref('')
const isReceiving = ref(false)
const receiveError = ref('')
const receivedText = ref('')

// --- 计算属性 Computed ---
const currentSize = computed(() => {
  const bytes = new Blob([textToSend.value]).size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
})

// --- 加密/解密辅助函数 ---

// ArrayBuffer 转 Base64
function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

// Base64 转 ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

// 加密文本
async function encryptText(plainText) {
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  )
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const encodedText = new TextEncoder().encode(plainText)

  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedText
  )

  const exportedKey = await window.crypto.subtle.exportKey("raw", key)

  return {
    encryptedContentB64: arrayBufferToBase64(encryptedContent),
    keyB64: arrayBufferToBase64(exportedKey),
    ivB64: arrayBufferToBase64(iv),
  }
}

// 解密文本
async function decryptText(encryptedContentB64, keyB64, ivB64) {
  const key = await window.crypto.subtle.importKey(
    "raw",
    base64ToArrayBuffer(keyB64),
    { name: "AES-GCM" },
    true,
    ["decrypt"]
  )
  const iv = base64ToArrayBuffer(ivB64)
  const encryptedContent = base64ToArrayBuffer(encryptedContentB64)

  const decryptedContent = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedContent
  )

  return new TextDecoder().decode(decryptedContent)
}


// --- 核心方法 Methods ---

const validateSize = () => {
  const bytes = new Blob([textToSend.value]).size
  isOverLimit.value = bytes > MAX_SIZE_BYTES
  if (isOverLimit.value) {
    sendError.value = '内容大小超过10MB限制！'
  } else {
    sendError.value = ''
  }
}

const handleSend = async () => {
  if (!textToSend.value || isOverLimit.value) return

  // 改进：在执行操作前，先检查加密API是否可用
  if (!window.crypto || !window.crypto.subtle) {
    const errorMessage = '加密功能不可用。请确保您正在通过 HTTPS 或 localhost 访问本站，并使用现代浏览器。'
    sendError.value = errorMessage
    ElMessage.error(errorMessage)
    return
  }

  isSending.value = true
  sendError.value = ''
  retrievalCode.value = ''

  try {
    // 1. 在浏览器中加密内容
    const { encryptedContentB64, keyB64, ivB64 } = await encryptText(textToSend.value)

    // 2. 生成一个随机的4位提取码
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    const dataRef = database.ref(db, `shares/${code}`)

    // 3. 准备要上传到 Firebase 的数据
    const payload = {
      content: encryptedContentB64,
      key: keyB64,
      iv: ivB64,
      createdAt: Date.now(),
    }

    // 4. 上传加密数据到 Firebase
    await database.set(dataRef, payload)

    retrievalCode.value = code
    ElMessage.success('提取码生成成功！')

  } catch (error) {
    console.error("发送失败:", error)
    sendError.value = '生成提取码失败，请检查您的网络连接或 Firebase 配置。'
    ElMessage.error(sendError.value)
  } finally {
    isSending.value = false
  }
}

const handleReceive = async () => {
  if (codeToReceive.value.length !== 4) return

  isReceiving.value = true
  receiveError.value = ''
  receivedText.value = ''

  try {
    // 1. 从 Firebase 获取数据
    const dataRef = database.ref(db, `shares/${codeToReceive.value}`)
    const snapshot = await database.get(dataRef)

    if (!snapshot.exists()) {
      throw new Error('提取码无效或已过期')
    }

    const data = snapshot.val()

    // 2. 在浏览器中解密内容
    const decrypted = await decryptText(data.content, data.key, data.iv)
    receivedText.value = decrypted

    // 3. (可选但推荐) 提取后立即删除数据，确保阅后即焚
    await database.remove(dataRef)

    ElMessage.success('内容提取成功！数据已从云端销毁。')

  } catch (error) {
    console.error("接收失败:", error)
    receiveError.value = error.message || '提取内容失败，请检查提取码或网络。'
    ElMessage.error(receiveError.value)
  } finally {
    isReceiving.value = false
  }
}

const copyCode = () => {
  if (!retrievalCode.value) return
  navigator.clipboard.writeText(retrievalCode.value).then(() => {
    ElMessage.success('提取码已复制到剪贴板！')
  }).catch(err => {
    console.error('复制失败:', err)
    ElMessage.error('复制失败，请手动复制。')
  })
}
</script>

<style scoped>
.main-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 20px;
}
.action-button-container {
  margin-top: 20px; /* 增加按钮与上方输入框的间距 */
}
.retrieval-code-display {
  margin-top: 20px; /* 增加间距 */
  font-size: 16px;
  display: flex; /* 使用 flex 布局方便对齐 */
  align-items: center;
}
.retrieval-code-display .code {
  font-weight: bold;
  color: #409eff;
  font-size: 24px; /* 提取码字体调大，更突出 */
  letter-spacing: 3px;
  margin: 0 10px;
}
.copy-button {
  margin-left: 5px; /* 复制按钮与提取码的间距 */
}

/*
  最终解决方案：
  问题根源是 Element Plus 在 :hover 时使用的 box-shadow 被父容器裁切。
  解决方案是禁用 box-shadow，并使用不会被裁切的 outline 属性来创建视觉反馈。
*/
:deep(.el-textarea .el-textarea__inner) {
  /* 1. 确保在任何状态下，基础边框都存在 */
  border: 1px solid var(--el-border-color);
  /* 2. 禁用所有状态下的 box-shadow，这是问题的根源 */
  box-shadow: none !important;
  /* 3. 使用 outline 来创建聚焦效果，outline-offset 使其向内偏移，更美观 */
  outline-offset: -1px;
  outline: 0px solid transparent; /* 默认无 outline */
  transition: outline .1s; /* 为 outline 添加过渡效果 */
}

/* 4. 鼠标悬浮时，改变边框颜色 */
:deep(.el-textarea:hover .el-textarea__inner) {
  border-color: var(--el-color-primary);
}

/* 5. 聚焦时，通过 outline 显示一个蓝色的“辉光”，而不是用 box-shadow */
:deep(.el-textarea .el-textarea__inner:focus) {
  border-color: var(--el-color-primary);
  outline: 1px solid var(--el-color-primary);
}
</style>