<template>
  <div v-if="visible" class="page-lock-dialog-mask" @click="handleMaskClick">
    <div class="page-lock-dialog" @click.stop>
      <div class="page-lock-dialog__header">
        <div class="header-icon">
          <svg class="icon">
            <use :xlink:href="headerIcon"></use>
          </svg>
        </div>
        <h3>{{ title }}</h3>
        <button class="page-lock-dialog__close" @click="handleClose">
          <svg class="icon"><use xlink:href="#iconClose"></use></svg>
        </button>
      </div>

      <div class="page-lock-dialog__content">
        <!-- 提示信息 -->
        <div v-if="hintText" class="page-lock-dialog__hint">
          <svg class="icon"><use xlink:href="#iconInfo"></use></svg>
          <span>{{ hintText }}</span>
        </div>

        <div class="page-lock-dialog__form">
          <!-- 更新密码模式：先输入旧密码 -->
          <div v-if="isUpdateMode" class="page-lock-dialog__field">
            <label class="field-label">
              <svg class="icon"><use xlink:href="#iconLock"></use></svg>
              {{ i18n.oldPasswordPlaceholder || '旧密码' }}
            </label>
            <input
              ref="firstInput"
              v-model="oldPassword"
              type="password"
              :placeholder="i18n.oldPasswordPlaceholder"
              class="page-lock-dialog__input"
              @keyup.enter="handleConfirm"
              autocomplete="current-password"
            />
          </div>

          <!-- 新密码输入 -->
          <div class="page-lock-dialog__field">
            <label v-if="isLockMode || isUpdateMode" class="field-label">
              <svg class="icon"><use xlink:href="#iconLock"></use></svg>
              {{ isUpdateMode ? (i18n.newPasswordPlaceholder || '新密码') : (i18n.passwordPlaceholder || '密码') }}
            </label>
            <input
              :ref="isUpdateMode ? undefined : 'firstInput'"
              v-model="password"
              type="password"
              :placeholder="passwordPlaceholder"
              class="page-lock-dialog__input"
              @keyup.enter="handleConfirm"
              :autocomplete="isUnlockMode ? 'current-password' : 'new-password'"
            />
          </div>

          <!-- 锁定或更新模式：需要确认密码 -->
          <div v-if="isLockMode || isUpdateMode" class="page-lock-dialog__field">
            <label class="field-label">
              <svg class="icon"><use xlink:href="#iconLock"></use></svg>
              {{ i18n.confirmPasswordPlaceholder || '确认密码' }}
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              :placeholder="confirmPasswordPlaceholder"
              class="page-lock-dialog__input"
              @keyup.enter="handleConfirm"
              autocomplete="new-password"
            />
          </div>
        </div>
      </div>

      <div class="page-lock-dialog__footer">
        <button class="page-lock-dialog__btn page-lock-dialog__btn--cancel" @click="handleClose">
          <svg class="icon"><use xlink:href="#iconClose"></use></svg>
          {{ cancelText }}
        </button>
        <button class="page-lock-dialog__btn page-lock-dialog__btn--confirm" @click="handleConfirm">
          <svg class="icon"><use xlink:href="#iconCheck"></use></svg>
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface Props {
  visible: boolean
  mode: 'lock' | 'unlock' | 'update'
  i18n: any
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', password: string, confirmPassword?: string, oldPassword?: string): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const password = ref('')
const confirmPassword = ref('')
const oldPassword = ref('')
const firstInput = ref<HTMLInputElement>()

const isLockMode = computed(() => props.mode === 'lock')
const isUpdateMode = computed(() => props.mode === 'update')
const isUnlockMode = computed(() => props.mode === 'unlock')

const title = computed(() => {
  if (isUpdateMode.value) return props.i18n.updatePassword || '更新密码'
  if (isLockMode.value) return props.i18n.setPassword || '设置密码'
  return props.i18n.enterPassword || '输入密码'
})

const headerIcon = computed(() => {
  if (isUpdateMode.value) return '#iconRefresh'
  if (isLockMode.value) return '#iconLock'
  return '#iconUnlock'
})

const hintText = computed(() => {
  if (isUpdateMode.value) return props.i18n.updatePasswordHint || '请先输入旧密码，然后设置新密码'
  if (isLockMode.value) return props.i18n.setPasswordHint || '设置密码后可以锁定文档，保护隐私内容'
  return props.i18n.unlockHint || '请输入密码解锁文档'
})

const passwordPlaceholder = computed(() => {
  if (isUpdateMode.value) return props.i18n.newPasswordPlaceholder || '请输入新密码'
  return props.i18n.passwordPlaceholder || '请输入密码'
})
const confirmPasswordPlaceholder = computed(() => props.i18n.confirmPasswordPlaceholder || '请再次输入密码')
const confirmText = computed(() => props.i18n.confirm || '确认')
const cancelText = computed(() => props.i18n.cancel || '取消')

const handleMaskClick = () => {
  handleClose()
}

// 自动聚焦第一个输入框
const focusFirstInput = () => {
  setTimeout(() => {
    firstInput.value?.focus()
  }, 100)
}

const handleClose = () => {
  password.value = ''
  confirmPassword.value = ''
  oldPassword.value = ''
  emit('update:visible', false)
  emit('close')
}

// 监听 visible 变化，自动聚焦
watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      focusFirstInput()
    })
  }
})

const handleConfirm = () => {
  if (isUpdateMode.value) {
    emit('confirm', password.value, confirmPassword.value, oldPassword.value)
  } else if (isLockMode.value) {
    emit('confirm', password.value, confirmPassword.value)
  } else {
    emit('confirm', password.value)
  }
  password.value = ''
  confirmPassword.value = ''
  oldPassword.value = ''
}
</script>

<style lang="scss" scoped>
.page-lock-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  pointer-events: auto;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-lock-dialog {
  background: var(--b3-theme-background);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 400px;
  max-width: 90vw;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.page-lock-dialog__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--b3-theme-surface), var(--b3-theme-surface-variant));
  border-bottom: 2px solid var(--b3-theme-primary);

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--b3-theme-primary);
    border-radius: 8px;
    flex-shrink: 0;

    .icon {
      width: 18px;
      height: 18px;
      color: var(--b3-theme-on-primary);
    }
  }

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--b3-theme-on-background);
    flex: 1;
  }
}

.page-lock-dialog__close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--b3-theme-on-background);
  opacity: 0.6;
  transition: all 0.2s;
  border-radius: 6px;

  &:hover {
    opacity: 1;
    background: var(--b3-theme-surface-variant);
  }

  .icon {
    width: 16px;
    height: 16px;
  }
}

.page-lock-dialog__content {
  padding: 20px;
}

.page-lock-dialog__hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  margin-bottom: 16px;
  background: var(--b3-theme-primary-container);
  border-radius: 8px;
  border-left: 3px solid var(--b3-theme-primary);
  font-size: 12px;
  color: var(--b3-theme-on-surface);
  line-height: 1.5;

  .icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--b3-theme-primary);
  }
}

.page-lock-dialog__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-lock-dialog__field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .field-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: var(--b3-theme-on-surface);

    .icon {
      width: 14px;
      height: 14px;
      color: var(--b3-theme-primary);
    }
  }
}

.page-lock-dialog__input {
  padding: 10px 12px;
  border: 2px solid var(--b3-border-color);
  border-radius: 8px;
  background: var(--b3-theme-surface);
  color: var(--b3-theme-on-surface);
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: var(--b3-theme-primary);
    background: var(--b3-theme-background);
    box-shadow: 0 0 0 3px rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.1);
  }

  &::placeholder {
    color: var(--b3-theme-on-surface-variant);
    opacity: 0.6;
  }

  &:hover:not(:focus) {
    border-color: var(--b3-theme-primary);
    background: var(--b3-theme-background);
  }
}

.page-lock-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  background: var(--b3-theme-surface-variant);
  border-top: 1px solid var(--b3-border-color);
}

.page-lock-dialog__btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  outline: none;
  white-space: nowrap;

  .icon {
    width: 14px;
    height: 14px;
  }

  &--cancel {
    background: var(--b3-theme-surface);
    color: var(--b3-theme-on-surface);
    border: 2px solid var(--b3-border-color);

    &:hover {
      background: var(--b3-theme-background);
      border-color: var(--b3-theme-on-surface-variant);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &--confirm {
    background: var(--b3-theme-primary);
    color: var(--b3-theme-on-primary);
    box-shadow: 0 2px 8px rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.3);

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(var(--b3-theme-primary-rgb, 66, 133, 244), 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .page-lock-dialog {
    width: 95vw;
    border-radius: 10px;
  }

  .page-lock-dialog__header {
    padding: 14px 16px;

    .header-icon {
      width: 28px;
      height: 28px;

      .icon {
        width: 16px;
        height: 16px;
      }
    }

    h3 {
      font-size: 15px;
    }
  }

  .page-lock-dialog__content {
    padding: 16px;
  }

  .page-lock-dialog__hint {
    padding: 10px;
    font-size: 11px;
  }

  .page-lock-dialog__form {
    gap: 14px;
  }

  .page-lock-dialog__input {
    padding: 9px 11px;
    font-size: 13px;
  }

  .page-lock-dialog__footer {
    padding: 14px 16px;
  }

  .page-lock-dialog__btn {
    padding: 7px 14px;
    font-size: 13px;
  }
}
</style>
