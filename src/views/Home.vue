<template>
  <div class="home">
    <div class="home-content">
      <Calculator />
    </div>
  </div>
</template>

<script>
import Calculator from '@/components/calculator/Calculator.vue'

export default {
  name: 'Home',
  components: { Calculator },
}
</script>

<style scoped>
.home {
  min-height: calc(100vh - 70px);
  background: #f0f4f8;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}

.home-content {
  max-width: 1300px;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 2.5rem;
}

@media (max-width: 768px) {
  .home-content {
    padding: 1rem 0.85rem 2rem;
  }
}
</style>
