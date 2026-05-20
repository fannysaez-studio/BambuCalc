<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" :class="['toast', `toast--${type}`]" role="alert">
        <span class="toast-icon">{{ icons[type] }}</span>
        <span class="toast-text">{{ message }}</span>
        <button class="toast-close" @click="visible = false">✕</button>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'ToastMessage',
  data() {
    return {
      visible: false,
      message: '',
      type: 'info',
      timer: null,
      icons: { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' },
    }
  },
  methods: {
    show(message, type = 'info', duration = 3500) {
      clearTimeout(this.timer)
      this.message = message
      this.type = type
      this.visible = true
      this.timer = setTimeout(() => { this.visible = false }, duration)
    },
  },
}
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: Inter, sans-serif;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  white-space: nowrap;
  max-width: 90vw;
}

.toast--success { background: #1f7f97; color: #fff; }
.toast--error   { background: #e74c3c; color: #fff; }
.toast--warning { background: #f39c12; color: #fff; }
.toast--info    { background: #2d3748; color: #fff; }

.toast-icon { font-size: 0.9rem; font-weight: 800; flex-shrink: 0; }
.toast-text { flex: 1; }

.toast-close {
  background: none;
  border: none;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
}
.toast-close:hover { color: #fff; }

/* Animation */
.toast-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from  { opacity: 0; transform: translateX(-50%) translateY(1.5rem); }
.toast-leave-to    { opacity: 0; transform: translateX(-50%) translateY(1.5rem); }
</style>
