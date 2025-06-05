<template>
    <div>
        <div class="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4 border border-gray-200">
            <div v-for="(message, index) in chatMessages" :key="index" class="mb-3">
                <div class="flex items-start">
                    <UAvatar v-if="message.sender === 'ai'" color="primary" class="mr-3" />
                    <UAvatar v-else color="gray" class="mr-3" />
                    <div class="flex-1">
                        <UBadge size="sm" color="gray" class="mb-1">{{ message.sender === 'ai' ? 'AI Assistant' : 'You'
                            }} · {{ message.time }}</UBadge>
                        <UCard :ui="{ body: { padding: 'p-3' } }">
                            <div v-if="message.isLoading" class="flex items-center">
                                <UIcon name="i-heroicons-arrow-path" class="animate-spin mr-2" />
                                {{ message.text }}
                            </div>
                            <div v-else>{{ message.text }}</div>
                        </UCard>
                        <!-- Show expenses if available -->
                        <div v-if="message.parsedExpenses && message.parsedExpenses.length > 0" class="mt-2">
                            <UCard color="gray" class="bg-gray-50">
                                <div class="flex items-center mb-2">
                                    <UIcon name="i-heroicons-document-check" class="text-gray-500 mr-2" />
                                    <div class="text-xs font-medium">Parsed {{ message.parsedExpenses.length > 1 ?
                                        message.parsedExpenses.length + ' expenses' : 'expense' }}:</div>
                                </div>
                                <div v-for="(expense, idx) in message.parsedExpenses" :key="idx" :class="[
                                    'border-t border-gray-200 mt-2 pt-2',
                                    { 'border-t-0 mt-1 pt-1': idx === 0 }
                                ]">
                                    <div class="grid grid-cols-2 gap-2">
                                        <div class="flex items-center">
                                            <UIcon :name="getCategoryIcon(expense.category || 'other')"
                                                class="mr-2 text-gray-500" />
                                            <div>
                                                <span class="font-semibold">Item:</span> {{ expense.item }}
                                                <div class="text-xs text-gray-500">{{ capitalize(expense.category ||
                                                    'other') }}</div>
                                            </div>
                                        </div>
                                        <div><span class="font-semibold">Amount:</span> {{ expense.currency }} {{
                                            expense.amount }}</div>
                                        <div><span class="font-semibold">Type:</span>
                                            <UBadge :color="expense.type === 'in' ? 'green' : 'red'">
                                                {{ expense.type === 'in' ? 'Income' : 'Expense' }}
                                            </UBadge>
                                        </div>
                                        <div><span class="font-semibold">Date:</span> {{ expense.date || 'Today' }}
                                        </div>
                                    </div>
                                </div>
                            </UCard>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="chatMessages.length === 0"
                class="flex flex-col items-center justify-center h-full text-gray-500">
                <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="mb-2" size="xl" />
                <p>No messages yet</p>
            </div>
        </div>

        <!-- Input Section -->
        <UForm :state="userInput" @submit="sendMessage">
            <div class="flex">
                <UInput v-model="userInput.message" class="flex-1 mr-2"
                    placeholder="Describe your expense(s) (e.g., 'I bought orange juice for Rp. 10000')"
                    :ui="{ base: 'min-h-12' }" />
                <UButton type="submit" color="primary">
                    <UIcon name="i-heroicons-paper-airplane" />
                </UButton>
            </div>
            <div class="text-xs text-gray-500 mt-2">
                Tip: Try saying something like "I bought groceries for Rp. 50000 and coffee for Rp. 15000" to add
                multiple expenses at once.
            </div>
        </UForm>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { getCurrentTime, guessCategory, getCategoryIcon, getCategoryColor, capitalize } from '../utils/formatters';

const props = defineProps({
    expenses: {
        type: Array,
        required: true
    },
    totalBalance: {
        type: Number,
        default: 0
    }
});

const chatMessages = defineModel('chatMessages', {
    type: Array,
    default: () => []
});

const emit = defineEmits(['add-expense']);

const userInput = ref({
    message: ''
});

function sendMessage() {
    if (!userInput.value.message.trim()) return;

    // Add user message
    const userMessage = {
        text: userInput.value.message,
        time: getCurrentTime(),
        sender: 'user'
    };
    chatMessages.value.push(userMessage);

    // Reset input
    userInput.value.message = '';

    // Show loading indicator
    const loadingMessage = {
        text: "Processing your message...",
        time: getCurrentTime(),
        sender: 'ai',
        isLoading: true
    };
    chatMessages.value.push(loadingMessage);

    // Process the message asynchronously
    processUserMessage(userMessage.text).then(processedMessage => {
        // Remove the loading message
        const loadingIndex = chatMessages.value.findIndex(msg => msg.isLoading);
        if (loadingIndex !== -1) {
            chatMessages.value.splice(loadingIndex, 1);
        }

        // Add AI response
        const aiResponse = {
            text: processedMessage.response,
            time: getCurrentTime(),
            sender: 'ai',
            parsedExpenses: processedMessage.expenses || [] // Always use the expenses array
        };
        chatMessages.value.push(aiResponse);

        // The expense items are already handled in processUserMessage

        // The multiple expenses case is already handled in processUserMessage
    }).catch(error => {
        console.error('Error processing message:', error);

        // Remove the loading message
        const loadingIndex = chatMessages.value.findIndex(msg => msg.isLoading);
        if (loadingIndex !== -1) {
            chatMessages.value.splice(loadingIndex, 1);
        }

        // Add error response
        chatMessages.value.push({
            text: "Sorry, I encountered an error processing your message. Please try again.",
            time: getCurrentTime(),
            sender: 'ai'
        });
    });
}

async function resetMemory() {
    const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama3.2:1b',
            Keep_alive: 0,
        })
    });
    const data = await response.json();
    console.log('Memory reset response:', data);
}

async function processUserMessage(message) {
    try {
        // Step 1: First try to detect multiple expenses with the pattern matching
        // const multipleExpenses = findMultipleExpenses(message);

        // if (multipleExpenses.length > 1) {
        //     // If multiple expenses found, process them
        //     let totalAmount = 0;
        //     const items = [];

        //     // Add each expense and collect info for the response
        //     multipleExpenses.forEach(exp => {
        //         const newExpense = {
        //             id: Date.now() + Math.floor(Math.random() * 1000),
        //             description: exp.item,
        //             amount: exp.amount,
        //             currency: exp.currency,
        //             type: exp.type,
        //             date: new Date().toISOString().split('T')[0],
        //             category: guessCategory(exp.item)
        //         };

        //         // Emit event to parent component for each expense
        //         emit('add-expense', newExpense);

        //         totalAmount += exp.amount;
        //         items.push(`${exp.item} (${exp.currency} ${exp.amount.toLocaleString('id-ID')})`);
        //     });

        //     // Return formatted response with all items
        //     return {
        //         expenses: multipleExpenses,
        //         response: `I've recorded ${multipleExpenses.length} expenses: ${items.join(', ')} with a total of Rp. ${totalAmount.toLocaleString('id-ID')}.`
        //     };
        // }
        await resetMemory();
        // If not multiple expenses, continue with API call for single expense
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3.2:1b',
                prompt: `You are an expense tracking assistant. Extract expense/income information from the user's message and return ONLY valid JSON with no explanations.

INPUT: "${message}"

INSTRUCTIONS:
1. Identify purchases, payments, income, or other financial transactions
2. Extract: item name, amount, currency, transaction type (in/out), and category
3. Return ONLY a JSON object with this exact structure:
{
  "expenses": [
    {
      "item": "descriptive item name",
      "amount": number (no currency symbols, commas or formatting),
      "currency": "Rp.",
      "type": "in" or "out",
      "category": "one of: food, groceries, transport, entertainment, utilities, income, other"
    }
  ],
  "response": "message" // This is message make it human readable
}

RULES:
- For expenses (money spent): set type="out"
- For income (money received): set type="in" and category="income"
- Always return an array of expenses, even for a single transaction
- For Rupiah values, use "Rp." as currency
- if you cannot identify, return an empty array for expenses and a response like "I couldn't identify any expenses in your message."
- Never include non-JSON text or explanations in your response
- Amounts must be numeric values only (no formatting)`,
                stream: false,
                format: 'json'
            })
        });

        const data = await response.json();
        console.log('AI Response:', data);

        // The response may include markdown code blocks with JSON inside
        // Extract JSON from the response text
        const responseText = data.response;
        let jsonStr = responseText;

        // Check if the response contains a code block
        const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
            jsonStr = codeBlockMatch[1].trim();
            console.log('Extracted JSON string from code block:', jsonStr);
        }

        try {
            // Parse the extracted JSON
            const aiOutput = JSON.parse(jsonStr);
            console.log('Parsed AI output:', aiOutput);

            // Process expenses array
            if (aiOutput && aiOutput.expenses && Array.isArray(aiOutput.expenses)) {
                // No expenses found
                if (aiOutput.expenses.length === 0) {
                    return {
                        expenses: [],
                        response: aiOutput.response || "I couldn't identify any expenses in your message."
                    };
                }

                console.log('Processing expenses:', aiOutput.expenses);
                let isAllValid = []
                let totalBalanceComputed = props.totalBalance;
                // Process expenses
                for (let i = 0; i < aiOutput.expenses.length; i++) {
                    const expense = aiOutput.expenses[i];

                    // Validate expense structure
                    if (!expense.item || !expense.amount || isNaN(expense.amount)) {
                        console.warn('Invalid expense item:', expense);
                        chatMessages.value.push({
                            text: `I couldn't process the expense for ${expense.item || 'unknown item'} with amount ${expense.amount || 'unknown amount'}. Please check the format.`,
                            time: getCurrentTime(),
                            sender: 'ai'
                        });
                        isAllValid.push(false);
                        continue; // Skip invalid expenses
                    }

                    if (expense.type === 'out' && totalBalanceComputed < expense.amount) {
                        console.warn('Insufficient balance for expense:', expense);
                        chatMessages.value.push({
                            text: `You don't have enough balance for the expense of ${expense.item} costing ${expense.currency} ${expense.amount.toLocaleString('id-ID')}.`,
                            time: getCurrentTime(),
                            sender: 'ai'
                        });
                        isAllValid.push(false);
                        continue; // Skip expenses that exceed balance
                    }

                    if (expense.type === 'out') {
                        // Deduct from balance for expenses
                        totalBalanceComputed -= expense.amount;
                    } else if (expense.type === 'in') {
                        // Add to balance for income
                        totalBalanceComputed += expense.amount;
                    }

                    // Create a new expense object
                    const newExpense = {
                        id: Date.now() + Math.floor(Math.random() * 1000),
                        description: expense.item,
                        amount: parseFloat(expense.amount),
                        currency: expense.currency || 'Rp.',
                        type: expense.type || 'out',
                        date: expense.date || new Date().toISOString().split('T')[0],
                        category: expense.category || guessCategory(expense.item)
                    };

                    isAllValid.push(true);
                    // Emit event to parent component for each valid expense
                    emit('add-expense', newExpense);
                }

                // aiOutput.expenses.forEach(expense => {
                //     const newExpense = {
                //         id: Date.now() + Math.floor(Math.random() * 1000),
                //         description: expense.item,
                //         amount: expense.amount,
                //         currency: expense.currency || 'Rp.',
                //         type: expense.type || 'out',
                //         date: expense.date || new Date().toISOString().split('T')[0],
                //         category: expense.category || guessCategory(expense.item)
                //     };

                //     // Emit event to parent component for each expense
                //     emit('add-expense', newExpense);
                // });

                if (isAllValid.some(valid => valid)) {
                    return aiOutput;
                } else {
                    return {
                        expenses: null,
                        response: "All expenses were invalid or exceeded your balance. Please check the format and try again."
                    };
                }

                // return aiOutput;
            } else {
                console.warn('AI output has invalid structure:', aiOutput);
                throw new Error('Invalid AI output structure');
            }
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', parseError, 'Raw text:', jsonStr);
            // Fall back to pattern matching if JSON parsing fails
        }
    } catch (error) {
        console.error('Error calling Ollama API or processing multiple expenses:', error);
        // Fall back to pattern matching
    }

    // Single expense fallback pattern matching
    const expenseRegex = /(?:bought|purchased|paid for|spent on|got|bought|buy|paid)\s+(.+?)\s+for\s+([A-Za-z$€£¥]+)?\s?(\d+[\d,.]*)/i;
    const incomeRegex = /(?:received|earned|got paid|income of|salary of|received|got)\s+([A-Za-z$€£¥]+)?\s?(\d+[\d,.]*)\s+(?:for|from|as)?\s+(.+)?/i;

    let expenseMatch = message.match(expenseRegex);
    let incomeMatch = message.match(incomeRegex);

    if (expenseMatch) {
        const item = expenseMatch[1].trim();
        const currency = expenseMatch[2] || 'Rp.';
        const amount = parseFloat(expenseMatch[3].replace(/[,.]/g, ''));

        // Log for debugging
        console.log('Adding expense (fallback):', { item, amount, currency, type: 'out' });

        const expense = {
            item: item,
            amount: amount,
            currency: currency,
            type: 'out',
            date: new Date().toISOString().split('T')[0],
            category: guessCategory(item)
        };

        // Create and emit the expense
        const newExpense = {
            id: Date.now(),
            description: expense.item,
            amount: expense.amount,
            currency: expense.currency,
            type: expense.type,
            date: expense.date,
            category: expense.category
        };

        emit('add-expense', newExpense);

        return {
            expenses: [expense],
            response: `I've recorded your expense for ${item} costing ${currency} ${amount.toLocaleString('id-ID')}.`
        };
    } else if (incomeMatch) {
        const currency = incomeMatch[1] || 'Rp.';
        const amount = parseFloat(incomeMatch[2].replace(/[,.]/g, ''));
        const source = incomeMatch[3] ? incomeMatch[3].trim() : 'unspecified source';

        // Log for debugging
        console.log('Adding income (fallback):', { source, amount, currency, type: 'in' });

        const income = {
            item: source,
            amount: amount,
            currency: currency,
            type: 'in',
            date: new Date().toISOString().split('T')[0],
            category: 'income'
        };

        // Create and emit the income
        const newIncome = {
            id: Date.now(),
            description: income.item,
            amount: income.amount,
            currency: income.currency,
            type: income.type,
            date: income.date,
            category: income.category
        };

        emit('add-expense', newIncome);

        return {
            expenses: [income],
            response: `I've recorded your income of ${currency} ${amount.toLocaleString('id-ID')} from ${source}.`
        };
    }

    return {
        expenses: [],
        response: "I couldn't identify an expense or income in your message. Please try again with a format like 'I bought groceries for Rp. 50000' or 'I received salary of Rp. 5000000'."
    };
}

/**
 * Find multiple expenses in a single message
 * @param {string} message - The user message to parse
 * @returns {Array} Array of expense objects
 */
function findMultipleExpenses(message) {
    const results = [];

    // Enhanced pattern for detecting expenses in various formats
    // Supports patterns like "bought X for $Y", "paid Z for $W", etc.
    const itemPattern = /(?:bought|purchased|paid for|spent on|got|bought|buy|have buy|paid)\s+(.+?)\s+for\s+([A-Za-z$€£¥]+)?\s?(\d+[\d,.]*)(?:\s|$|\.)/gi;

    // Also try to detect patterns like "X costs $Y"
    const costPattern = /(.+?)\s+(?:costs?|was|is|for)\s+([A-Za-z$€£¥]+)?\s?(\d+[\d,.]*)(?:\s|$|\.)/gi;

    // Process the first pattern
    let match;
    while ((match = itemPattern.exec(message)) !== null) {
        const item = match[1].trim();
        const currency = match[2] || 'Rp.';
        const amount = parseFloat(match[3].replace(/[,.]/g, ''));

        // Skip invalid amounts
        if (isNaN(amount) || amount <= 0) continue;

        results.push({
            item,
            amount,
            currency,
            type: 'out',
            date: new Date().toISOString().split('T')[0],
            category: guessCategory(item)
        });
    }

    // Process the second pattern if no results from the first
    if (results.length === 0) {
        while ((match = costPattern.exec(message)) !== null) {
            const item = match[1].trim();
            const currency = match[2] || 'Rp.';
            const amount = parseFloat(match[3].replace(/[,.]/g, ''));

            // Skip invalid amounts
            if (isNaN(amount) || amount <= 0) continue;

            results.push({
                item,
                amount,
                currency,
                type: 'out',
                date: new Date().toISOString().split('T')[0],
                category: guessCategory(item)
            });
        }
    }

    return results;
}

</script>
