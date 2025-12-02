<template>
  <div class="encryption-settings">
    <div class="settings-section">
      <h3 class="section-title">{{ plugin.i18n.encryptionSettings }}</h3>
      
      <!-- 密码状态 -->
      <div class="password-status" :class="{ 'has-password': hasPassword }">
        <div class="status-label">{{ plugin.i18n.currentPasswordStatus }}</div>
        <div class="status-value">
          {{ hasPassword ? '✓ ' + plugin.i18n.passwordSet : '⚠ ' + plugin.i18n.passwordNotSetYet }}
        </div>
      </div>

      <!-- 密码输入 -->
      <div class="form-group">
        <label>{{ plugin.i18n.newPassword }}</label>
        <input 
          type="password" 
          v-model="newPassword"
          :placeholder="plugin.i18n.passwordPlaceholder"
          @keydown.enter="handleSavePassword"
        />
      </div>

      <div class="form-group">
        <label>{{ plugin.i18n.confirmPassword }}</label>
        <input 
          type="password" 
          v-model="confirmPassword"
          :placeholder="plugin.i18n.confirmPasswordPlaceholder"
          @keydown.enter="handleSavePassword"
        />
      </div>

      <!-- 保存按钮 -->
      <button class="save-btn" @click="handleSavePassword">
        {{ hasPassword ? plugin.i18n.changePassword : plugin.i18n.save }}
      </button>

      <!-- 提示信息 -->
      <div class="encryption-tip">
        {{ plugin.i18n.encryptionTip }}
        <div class="algorithm-info">{{ plugin.i18n.algorithmInfo }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import { showMessage, type Plugin } from 'siyuan'
import { getEncryptionInstance } from '../../encryption'

const props = defineProps<{
  plugin: Plugin
}>()

const newPassword = ref('')
const confirmPassword = ref('')
const hasPassword = ref(false)

onMounted(() => {
  checkPasswordStatus()
})

onActivated(() => {
  // 组件激活时重新检查密码状态
  checkPasswordStatus()
})

function checkPasswordStatus() {
  const encryption = getEncryptionInstance()
  if (encryption) {
    hasPassword.value = encryption.hasPassword()
    console.log('密码状态检查:', hasPassword.value)
  } else {
    console.warn('加密实例未找到')
  }
}

async function handleSavePassword() {
  const pwd1 = newPassword.value.trim()
  const pwd2 = confirmPassword.value.trim()

  if (!pwd1) {
    showMessage(props.plugin.i18n.passwordEmpty, 3000, 'error')
    return
  }

  if (pwd1 !== pwd2) {
    showMessage(props.plugin.i18n.passwordMismatch, 3000, 'error')
    return
  }

  const encryption = getEncryptionInstance()
  if (encryption) {
    encryption.setPassword(pwd1)
    await encryption.savePassword()
    showMessage(props.plugin.i18n.passwordSetSuccess, 2000, 'info')
    
    // 清空输入框
    newPassword.value = ''
    confirmPassword.value = ''
    
    // 更新状态
    checkPasswordStatus()
  }
}
</script>

<style scoped>
.encryption-settings {
  padding: 16px;
}

.settings-section {
  background: var(--b3-theme-background);
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--b3-theme-on-background);
}

.password-status {
  margin-bottom: 20px;
  padding: 12px;
  background: var(--b3-theme-surface);
  border-radius: 8px;
  border: 1px solid var(--b3-theme-surface-lighter);
}

.password-status.has-password {
  background: var(--b3-card-success-background);
}

.password-status:not(.has-password) {
  background: var(--b3-card-warning-background);
}

.status-label {
  margin-bottom: 8px;
  color: var(--b3-theme-on-surface);
  font-size: 13px;
  font-weight: 500;
}

.status-value {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.has-password .status-value {
  background: var(--b3-card-success-background);
  color: var(--b3-card-success-color);
}

:not(.has-password) .status-value {
  background: var(--b3-card-warning-background);
  color: var(--b3-card-warning-color);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--b3-theme-on-background);
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--b3-theme-surface-lighter);
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 14px;
  background: var(--b3-theme-background);
  color: var(--b3-theme-on-background);
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--b3-theme-primary);
}

.save-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: var(--b3-theme-primary);
  color: var(--b3-theme-on-primary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.2s;
}

.save-btn:hover {
  opacity: 0.9;
}

.encryption-tip {
  margin-top: 20px;
  padding: 12px;
  background: var(--b3-theme-surface);
  border-radius: 6px;
  font-size: 12px;
  color: var(--b3-theme-on-surface-light);
  line-height: 1.6;
  border-left: 3px solid var(--b3-theme-primary);
}

.algorithm-info {
  margin-top: 8px;
  opacity: 0.8;
}
</style>
