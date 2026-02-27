<template>
  <div class="tool-card-view">
    <h1>代码比对</h1>
    <div class="diff-controls-top">
              <span class="diff-status">{{ diffStatus }}</span>
              <el-button-group>
                <el-button @click="goToFirstDiff" :disabled="!lineChanges.length">第一个</el-button>
                <el-button @click="goToPreviousDiff" :disabled="!lineChanges.length">上一个</el-button>
              </el-button-group>
              <el-button-group>
                <el-button @click="syncToLeft" :disabled="currentDiffIndex === -1" title="将右侧差异同步到左侧"> &lt;&lt; </el-button>
                <el-button @click="syncToRight" :disabled="currentDiffIndex === -1" title="将左侧差异同步到右侧"> &gt;&gt; </el-button>
              </el-button-group>
              <el-button-group>
                <el-button @click="goToNextDiff" :disabled="!lineChanges.length">下一个</el-button>
                <el-button @click="goToLastDiff" :disabled="!lineChanges.length">最后一个</el-button>
              </el-button-group>
            </div>
    <div class="diff-editor-wrapper">
      <div ref="arrowContainer" class="arrow-container"></div>
      <div ref="diffEditor" class="diff-editor"></div>
    </div>
    <div class="diff-controls-bottom">
      <el-checkbox v-model="renderSideBySide" label="并排显示" @change="toggleRenderSideBySide" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import * as monaco from 'monaco-editor'

const diffEditor = ref(null)
let editorInstance = null

const originalCode = ref(`{\n  "name": "web-tools",\n  "version": "0.0.1",\n  "private": true\n}`)
const modifiedCode = ref(`{\n  "name": "web-tools-pro",\n  "version": "1.0.0",\n  "private": true,\n  "description": "A powerful web toolset."\n}`)

const lineChanges = ref([])
const currentDiffIndex = ref(-1)
const renderSideBySide = ref(true)
let allDecorations = { original: [], modified: [] }

const diffStatus = computed(() => {
  if (lineChanges.value.length === 0) {
    return '内容一致'
  }
  const currentChange = lineChanges.value[currentDiffIndex.value]
  let lineInfo = ''
  if (currentChange) {
    const start = currentChange.modifiedStartLineNumber > 0 ? currentChange.modifiedStartLineNumber : currentChange.originalStartLineNumber
    const end = currentChange.modifiedEndLineNumber > 0 ? currentChange.modifiedEndLineNumber : currentChange.originalEndLineNumber
    lineInfo = ` (行 ${start}-${end})`
  }
  return `共 ${lineChanges.value.length} 处不同，当前第 ${currentDiffIndex.value + 1} 个${lineInfo}`
})

const goToFirstDiff = () => {
  if (lineChanges.value.length === 0) return
  currentDiffIndex.value = 0
  navigateToDiff()
}

const goToPreviousDiff = () => {
  if (lineChanges.value.length === 0) return
  currentDiffIndex.value = (currentDiffIndex.value - 1 + lineChanges.value.length) % lineChanges.value.length
  navigateToDiff()
}

const goToNextDiff = () => {
  if (lineChanges.value.length === 0) return
  currentDiffIndex.value = (currentDiffIndex.value + 1) % lineChanges.value.length
  navigateToDiff()
}

const goToLastDiff = () => {
  if (lineChanges.value.length === 0) return
  currentDiffIndex.value = lineChanges.value.length - 1
  navigateToDiff()
}

const navigateToDiff = () => {
  if (currentDiffIndex.value < 0 || currentDiffIndex.value >= lineChanges.value.length) return;
  const change = lineChanges.value[currentDiffIndex.value]
  if (change) {
    const originalEditor = editorInstance.getOriginalEditor()
    const modifiedEditor = editorInstance.getModifiedEditor()

    const lineToReveal = change.modifiedStartLineNumber > 0 ? change.modifiedStartLineNumber : change.originalStartLineNumber
    editorInstance.revealLineInCenter(lineToReveal)

    // Set cursor position and focus
    if (change.modifiedEndLineNumber > 0) {
      modifiedEditor.setPosition({ lineNumber: change.modifiedStartLineNumber, column: 1 })
      modifiedEditor.focus()
    } else if (change.originalEndLineNumber > 0) {
      originalEditor.setPosition({ lineNumber: change.originalStartLineNumber, column: 1 })
      originalEditor.focus()
    }

    updateDecorations()
  }
}

const toggleRenderSideBySide = (value) => {
  diffEditor.updateOptions({ renderSideBySide: value })
}

const updateDecorations = () => {
  const originalEditor = editorInstance.getOriginalEditor()
  const modifiedEditor = editorInstance.getModifiedEditor()
  const newOriginalDecorations = []
  const newModifiedDecorations = []

  if (lineChanges.value.length > 0 && currentDiffIndex.value >= 0) {
    const change = lineChanges.value[currentDiffIndex.value]
    if (change.originalEndLineNumber > 0) {
      newOriginalDecorations.push({
        range: new monaco.Range(change.originalStartLineNumber, 1, change.originalEndLineNumber, 1),
        options: { isWholeLine: true, className: 'diff-highlight' },
      })
    }
    if (change.modifiedEndLineNumber > 0) {
      newModifiedDecorations.push({
        range: new monaco.Range(change.modifiedStartLineNumber, 1, change.modifiedEndLineNumber, 1),
        options: { isWholeLine: true, className: 'diff-highlight' },
      })
    }
  }

  allDecorations.original = originalEditor.deltaDecorations(allDecorations.original, newOriginalDecorations)
  allDecorations.modified = modifiedEditor.deltaDecorations(allDecorations.modified, newModifiedDecorations)
}

const syncToRight = () => handleSync(false)
const syncToLeft = () => handleSync(true)

const handleSync = (isModifiedToOriginal) => {
  if (currentDiffIndex.value < 0) return
  const change = lineChanges.value[currentDiffIndex.value]
  if (!change) return

  const originalModel = editorInstance.getModel().original
  const modifiedModel = editorInstance.getModel().modified
  if (!originalModel || !modifiedModel) return

  let sourceModel, targetModel, sourceRange, targetRange
  let textToApply

  if (isModifiedToOriginal) { // Sync from Modified to Original (<<)
    sourceModel = modifiedModel
    targetModel = originalModel

    // If there's content in the modified editor for this change
    if (change.modifiedEndLineNumber > 0) {
      sourceRange = new monaco.Range(
          change.modifiedStartLineNumber, 1,
          change.modifiedEndLineNumber, sourceModel.getLineLength(change.modifiedEndLineNumber) + 1
      )
      textToApply = sourceModel.getValueInRange(sourceRange)
    } else { // It's a deletion in modified, so sync "nothing"
      textToApply = ""
    }

    // If it's a modification in original
    if (change.originalEndLineNumber > 0) {
      targetRange = new monaco.Range(
          change.originalStartLineNumber, 1,
          change.originalEndLineNumber, targetModel.getLineLength(change.originalEndLineNumber) + 1
      )
    } else { // It's an insertion in original
      const insertLine = change.originalStartLineNumber + 1
      targetRange = new monaco.Range(insertLine, 1, insertLine, 1)
      if (textToApply.length > 0 && !textToApply.endsWith('\n')) {
        textToApply += '\n'
      }
    }

  } else { // Sync from Original to Modified (>>)
    sourceModel = originalModel
    targetModel = modifiedModel

    // If there's content in the original editor for this change
    if (change.originalEndLineNumber > 0) {
      sourceRange = new monaco.Range(
          change.originalStartLineNumber, 1,
          change.originalEndLineNumber, sourceModel.getLineLength(change.originalEndLineNumber) + 1
      )
      textToApply = sourceModel.getValueInRange(sourceRange)
    } else { // It's a deletion in original, so sync "nothing"
      textToApply = ""
    }

    // If it's a modification in modified
    if (change.modifiedEndLineNumber > 0) {
      targetRange = new monaco.Range(
          change.modifiedStartLineNumber, 1,
          change.modifiedEndLineNumber, targetModel.getLineLength(change.modifiedEndLineNumber) + 1
      )
    } else { // It's an insertion in modified
      const insertLine = change.modifiedStartLineNumber + 1
      targetRange = new monaco.Range(insertLine, 1, insertLine, 1)
      if (textToApply.length > 0 && !textToApply.endsWith('\n')) {
        textToApply += '\n'
      }
    }
  }
  targetModel.pushEditOperations([], [{ range: targetRange, text: textToApply }], () => null)
}

onMounted(() => {
  nextTick(() => {
    if (diffEditor.value) {
      editorInstance = monaco.editor.createDiffEditor(diffEditor.value, {
        theme: 'vs-light',
        readOnly: false,
        automaticLayout: true,
        originalEditable: true,
        renderSideBySide: renderSideBySide.value,
        renderIndicators: false, // 禁用内置的差异指示器
      })

      const originalModel = monaco.editor.createModel(originalCode.value, 'json')
      const modifiedModel = monaco.editor.createModel(modifiedCode.value, 'json')

      editorInstance.setModel({
        original: originalModel,
        modified: modifiedModel,
      })

      const diffUpdateTimeout = ref(null)
      editorInstance.onDidUpdateDiff(() => {
        // Debounce the update
        if (diffUpdateTimeout.value) clearTimeout(diffUpdateTimeout.value)
        diffUpdateTimeout.value = setTimeout(() => {
          lineChanges.value = editorInstance.getLineChanges()
          if (currentDiffIndex.value >= lineChanges.value.length) {
              currentDiffIndex.value = lineChanges.value.length > 0 ? 0 : -1
          }
          if (lineChanges.value.length > 0 && currentDiffIndex.value === -1) {
              currentDiffIndex.value = 0
          }
          updateDecorations()
        }, 100)
      })

      originalModel.onDidChangeContent(() => {
        originalCode.value = originalModel.getValue()
      })
      modifiedModel.onDidChangeContent(() => {
        modifiedCode.value = modifiedModel.getValue()
      })
    }
  })
})

onUnmounted(() => {
  if (editorInstance) {
    editorInstance.dispose()
  }
})
</script>

<style scoped>
.diff-controls-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: var(--spacing-medium);
}

.diff-status {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.diff-editor {
  width: 100%;
  height: 70vh;
  border: 1px solid #ebeef5;
}

.diff-controls-bottom {
  margin-top: var(--spacing-medium);
}

:deep(.diff-highlight) {
  background-color: #ffeeba;
}

</style>