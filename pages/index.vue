<template>
  <UContainer class="py-8">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-bold">Expense Chat</h1>
          <UBadge color="gray">{{ totalBalance }}</UBadge>
        </div>
      </template>
      
      <div>
        <!-- Tab Navigation -->
        <div class="mb-4 border-b border-gray-200">
          <UButtonGroup class="mb-2">
            <UButton 
              :color="activeTab === 'chat' ? 'primary' : 'gray'" 
              variant="ghost" 
              @click="activeTab = 'chat'"
            >
              <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="mr-1" />
              Chat
            </UButton>
            <UButton 
              :color="activeTab === 'expenses' ? 'primary' : 'gray'" 
              variant="ghost"
              @click="activeTab = 'expenses'"
            >
              <UIcon name="i-heroicons-currency-dollar" class="mr-1" />
              Expenses
            </UButton>
          </UButtonGroup>
        </div>
        
        <!-- Chat Section -->
        <div v-if="activeTab === 'chat'">
          <ChatSection
            :total-balance="totalBalanceNumber"
            v-model:chat-messages="chatMessages"
            :expenses="expenses"
            @add-expense="addExpense"
          />
        </div>
        
        <!-- Expenses List Section -->
        <div v-else-if="activeTab === 'expenses'">
          <ExpensesSection :expenses="expenses" />
        </div>
      </div>
      
      <!-- Example JSON Structure -->
      <div class="mt-6">
        <UAccordion :items="[{ 
          label: 'AI JSON Template (For Developers)',
          content: '',
          slot: 'ai-json-template'
        }]">
          <template #ai-json-template>
            <UCard color="gray" class="font-mono text-sm">
              <pre>
{
  "expenses": [
    {
      "item": "orange juice",     // Description of the expense item
      "amount": 10000,            // Numerical amount without currency
      "currency": "Rp.",          // Currency symbol/code
      "type": "out",              // "out" for expense, "in" for income
      "date": "2023-07-15",       // ISO format date (YYYY-MM-DD)
      "category": "groceries"     // Category like food, transport, etc.
    }
  ],
  "confidence": 0.95,           // AI confidence score
  "response": "I've recorded your expense for orange juice costing Rp. 10000"
}
              </pre>
            </UCard>
          </template>
        </UAccordion>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup>
import { UBadge } from '#components';
import { ref, computed } from 'vue';
import ChatSection from '~/components/ChatSection.vue';
import ExpensesSection from '~/components/ExpensesSection.vue';
import { formatCurrency } from '~/utils/formatters';

const expenses = ref([
//   { description: 'Salary', amount: 2000000, currency: 'Rp.', type: 'in', date: '2023-06-01', category: 'income', id: 1 },
//   { description: 'Rent', amount: 800000, currency: 'Rp.', type: 'out', date: '2023-06-03', category: 'housing', id: 2  },
//   { description: 'Groceries', amount: 120000, currency: 'Rp.', type: 'out', date: '2023-06-05', category: 'food', id: 3  }
]);

const chatMessages = ref([
  {
    text: 'Welcome to Expense Tracker! I can help you track your expenses. Just tell me what you bought or received.',
    time: '10:00 AM',
    sender: 'ai'
  }
]);

const activeTab = ref('chat');

const totalBalance = computed(() => {
  const total = expenses.value.reduce((sum, expense) => {
    return expense.type === 'in' 
      ? sum + Number(expense.amount) 
      : sum - Number(expense.amount);
  }, 0);
  
  return `Balance: ${total >= 0 ? '+' : ''}${formatCurrency(total)}`;
});

const totalBalanceNumber = computed(() => {
  return expenses.value.reduce((sum, expense) => {
    return expense.type === 'in' 
      ? sum + Number(expense.amount) 
      : sum - Number(expense.amount);
  }, 0);
});

function addExpense(newExpense) {
  expenses.value.unshift(newExpense);
}
</script>