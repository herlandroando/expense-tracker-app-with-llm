<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">All Transactions</h2>
          <UDropdownMenu :items="filterOptions" :popper="{ placement: 'bottom-end' }">
            <UButton color="gray" variant="ghost" trailing-icon="i-heroicons-funnel">
              {{ currentFilter.label }}
            </UButton>
          </UDropdownMenu>
        </div>
      </template>

      <UTable 
        :data="filteredExpenses"
        :columns="expenseColumns"
        :ui="{ 
          td: { 
            base: 'whitespace-nowrap py-3 px-4' 
          }
        }"
      >
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 px-4">
            <UIcon name="i-heroicons-document-text" class="text-gray-400 mb-2" size="xl" />
            <p class="text-sm text-gray-500">No transactions found</p>
            <p class="text-xs text-gray-400 mt-1">Try adding some expenses via the chat tab</p>
          </div>
        </template>
      </UTable>
      
      <template #footer>
        <div class="flex justify-between items-center text-sm">
          <div>
            <span class="text-gray-500">Total Income:</span> 
            <span class="text-green-600 font-medium">{{ formatCurrency(totalIncome) }}</span>
          </div>
          <div>
            <span class="text-gray-500">Total Expenses:</span> 
            <span class="text-red-600 font-medium">{{ formatCurrency(totalExpenses) }}</span>
          </div>
        </div>
        <div v-if="filteredExpenses.length === 0" class="text-xs text-gray-500 mt-2">
          Debug: {{ expenses.length }} total expenses, filter: {{ currentFilter.type }}
        </div>
      </template>
    </UCard>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <UCard 
        v-for="(category, index) in topCategories" 
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
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue';
import { UBadge } from '#components';
import { 
  formatCurrency, 
  formatNumber,
  formatDate, 
  capitalize, 
  getCategoryColor, 
  getCategoryIcon 
} from '../utils/formatters';

const props = defineProps({
  expenses: {
    type: Array,
    required: true
  }
});

const expenseColumns = [
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      return h('div', {}, [
        h('div', {}, row.getValue('description')),
        h('div', { class: 'text-xs text-gray-500' }, row.original.category)
      ])
    }
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = Number(row.getValue('amount'))
      const type = row.original.type
      const currency = row.original.currency
      
      return h('span', { 
        class: type === 'in' ? 'text-green-600' : 'text-red-600' 
      }, `${type === 'in' ? '+' : '-'}${currency} ${formatNumber(amount)}`)
    }
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type')
      return h(UBadge, {
        color: type === 'in' ? 'green' : 'red',
        size: 'sm'
      }, () => type === 'in' ? 'Income' : 'Expense')
    }
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.getValue('date'))
      return formatDate(date)
    }
  }
];

const filterOptions = [
  { 
    label: 'All Transactions',
    onClick: () => currentFilter.value = { label: 'All Transactions', type: 'all' }
  },
  { 
    label: 'Income Only', 
    onClick: () => currentFilter.value = { label: 'Income Only', type: 'in' } 
  },
  { 
    label: 'Expenses Only', 
    onClick: () => currentFilter.value = { label: 'Expenses Only', type: 'out' } 
  }
];

const currentFilter = ref({ label: 'All Transactions', type: 'all' });

const filteredExpenses = computed(() => {
  console.log('Filtering expenses:', props.expenses.length, 'items with filter', currentFilter.value.type);
  if (currentFilter.value.type === 'all') {
    return [...props.expenses]; // Return a new array to ensure reactivity
  }
  return props.expenses.filter(expense => expense.type === currentFilter.value.type);
});

const totalIncome = computed(() => {
  return props.expenses
    .filter(expense => expense.type === 'in')
    .reduce((total, expense) => total + Number(expense.amount), 0);
});

const totalExpenses = computed(() => {
  return props.expenses
    .filter(expense => expense.type === 'out')
    .reduce((total, expense) => total + Number(expense.amount), 0);
});

const topCategories = computed(() => {
  // Group expenses by category and calculate total
  const categories = {};
  
  props.expenses.forEach(expense => {
    const category = expense.category || 'other';
    if (!categories[category]) {
      categories[category] = { total: 0, count: 0, name: category };
    }
    if (expense.type === 'out') { // Only count expenses, not income
      categories[category].total += Number(expense.amount);
      categories[category].count += 1;
    }
  });
  
  // Convert to array and sort by total
  return Object.values(categories)
    .filter(cat => cat.count > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3); // Top 3 categories
});

</script>
