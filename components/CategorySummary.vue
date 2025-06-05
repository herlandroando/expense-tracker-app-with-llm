<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
    <UCard 
      v-for="(category, index) in categories" 
      :key="index"
      :color="getCategoryColor(category.name)"
      class="bg-opacity-5"
    >
      <template #header>
        <div class="flex items-center">
          <UIcon :name="getCategoryIcon(category.name)" class="mr-2" />
          <h3 class="text-sm font-medium">{{ capitalize(category.name) }}</h3>
        </div>
      </template>
      
      <div class="text-xl font-bold">{{ formatCurrency(category.total) }}</div>
      <div class="text-xs text-gray-500">{{ category.count }} transactions</div>
    </UCard>
  </div>
</template>

<script setup>
import { getCategoryColor, getCategoryIcon, formatCurrency, capitalize } from '../utils/formatters';

defineProps({
  categories: {
    type: Array,
    required: true
  }
});
</script>
