/**
 * Format a currency value for display
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return `Rp. ${Math.abs(amount).toLocaleString('id-ID')}`;
}

/**
 * Format a number using Indonesian locale
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  return Number(num).toLocaleString('id-ID');
}

/**
 * Format a date for display
 * @param {Date|string} dateString - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get the current time as a formatted string
 * @returns {string} Current time in 12-hour format with AM/PM
 */
export function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

/**
 * Guess a category based on the expense item
 * @param {string} item - The expense item description
 * @returns {string} Category name
 */
export function guessCategory(item) {
  const categories = {
    food: [
      'food', 'meal', 'restaurant', 'lunch', 'dinner', 'breakfast', 'grocery', 'groceries', 
      'fruit', 'snack', 'coffee', 'drink', 'tea', 'juice', 'pizza', 'burger', 'rice', 'bread',
      'milk', 'vegetables', 'meat', 'chicken', 'beef', 'fish', 'seafood', 'dessert', 'cake'
    ],
    transport: [
      'transport', 'bus', 'train', 'taxi', 'uber', 'fare', 'ticket', 'gas', 'petrol', 'fuel',
      'car', 'motorcycle', 'bike', 'scooter', 'rental', 'grab', 'gojek', 'ojek', 'angkot',
      'parking', 'toll', 'airfare', 'flight', 'airplane', 'travel'
    ],
    shopping: [
      'clothes', 'shirt', 'shoes', 'dress', 'apparel', 'mall', 'shop', 'store', 'market',
      'purchase', 'buy', 'pants', 'jacket', 'socks', 'hat', 'accessory', 'jewelry', 'electronics',
      'gadget', 'phone', 'laptop', 'computer', 'tablet', 'watch', 'bag', 'backpack'
    ],
    utilities: [
      'electricity', 'water', 'bill', 'utility', 'internet', 'phone', 'subscription', 'cable',
      'gas', 'wifi', 'broadband', 'service', 'payment', 'monthly', 'tv', 'netflix', 'spotify',
      'streaming'
    ],
    entertainment: [
      'movie', 'cinema', 'theater', 'concert', 'show', 'event', 'ticket', 'game', 'gaming',
      'music', 'party', 'festival', 'amusement', 'park', 'exhibition', 'museum', 'zoo',
      'entertainment', 'fun', 'leisure'
    ],
    housing: [
      'rent', 'mortgage', 'house', 'apartment', 'flat', 'accommodation', 'lodging',
      'housing', 'property', 'maintenance', 'repair', 'furniture', 'decor', 'renovation'
    ],
    health: [
      'medicine', 'medical', 'doctor', 'hospital', 'clinic', 'pharmacy', 'drug', 'health',
      'insurance', 'treatment', 'therapy', 'vitamin', 'supplement', 'dental', 'healthcare'
    ],
    education: [
      'school', 'college', 'university', 'tuition', 'fee', 'course', 'class', 'book',
      'textbook', 'notebook', 'stationery', 'pen', 'paper', 'education', 'learning', 'study'
    ]
  };
  
  const itemLower = item.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => itemLower.includes(keyword))) {
      return category;
    }
  }
  
  return 'other';
}

/**
 * Get the color for a category
 * @param {string} category - The category name
 * @returns {string} Color name
 */
export function getCategoryColor(category) {
  const colors = {
    food: 'orange',
    transport: 'blue',
    shopping: 'purple',
    utilities: 'yellow',
    housing: 'indigo',
    health: 'red',
    education: 'teal',
    entertainment: 'pink',
    income: 'green',
    other: 'gray'
  };
  return colors[category] || 'gray';
}

/**
 * Get the icon for a category
 * @param {string} category - The category name
 * @returns {string} Icon name
 */
export function getCategoryIcon(category) {
  const icons = {
    food: 'i-heroicons-cake',
    transport: 'i-heroicons-truck',
    shopping: 'i-heroicons-shopping-bag',
    utilities: 'i-heroicons-bolt',
    housing: 'i-heroicons-home',
    health: 'i-heroicons-heart',
    education: 'i-heroicons-academic-cap',
    entertainment: 'i-heroicons-film',
    income: 'i-heroicons-banknotes',
    other: 'i-heroicons-document'
  };
  return icons[category] || 'i-heroicons-document';
}
