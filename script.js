// Global variables
let transactions = [];

// Initialization function
function initApp() {
    loadTransactions();
    populateYearAndMonthSelectors();
    setupEventListeners();
    updateFinancialSummary();
    renderTransactions();
}

// Populate year and month selectors
function populateYearAndMonthSelectors() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    
    // Clear existing options
    yearSelect.innerHTML = '';
    monthSelect.innerHTML = '';
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Populate years (10 years back, 5 years forward)
    for (let year = currentYear - 10; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        option.selected = year === currentYear;
        yearSelect.appendChild(option);
    }

    // Populate months
    const months = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];

    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = String(index + 1).padStart(2, '0');
        option.textContent = month;
        option.selected = index + 1 === currentMonth;
        monthSelect.appendChild(option);
    });

    // Add event listeners for filtering
    yearSelect.addEventListener('change', renderTransactions);
    monthSelect.addEventListener('change', renderTransactions);
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('addTransactionBtn').addEventListener('click', addTransaction);
    
    // Ensure date input is set to today
    const dateInput = document.getElementById('dateInput');
    dateInput.value = new Date().toISOString().split('T')[0];
}

// Add a new transaction
function addTransaction() {
    const type = document.getElementById('transactionType').value;
    const amount = parseFloat(document.getElementById('amountInput').value);
    const description = document.getElementById('descriptionInput').value;
    const date = document.getElementById('dateInput').value;

    if (!amount) {
        alert('אנא הכנס סכום');
        return;
    }

    const transaction = {
        id: Date.now().toString(),
        type,
        amount,
        description,
        date
    };

    transactions.push(transaction);
    saveTransactions();
    
    // Reset form
    document.getElementById('amountInput').value = '';
    document.getElementById('descriptionInput').value = '';
    document.getElementById('dateInput').value = new Date().toISOString().split('T')[0];

    renderTransactions();
    updateFinancialSummary();
}

// Render transactions based on selected month and year
function renderTransactions() {
    const transactionsBody = document.getElementById('transactionsBody');
    const selectedYear = document.getElementById('yearSelect').value;
    const selectedMonth = document.getElementById('monthSelect').value;

    // Clear existing rows
    transactionsBody.innerHTML = '';

    // Filter transactions
    const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === parseInt(selectedYear) && 
               (transactionDate.getMonth() + 1).toString().padStart(2, '0') === selectedMonth;
    });

    // Sort transactions by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.classList.add(transaction.type === 'income' ? 'income-row' : 'expense-row');
        
        // Delete button
        const deleteCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'מחק';
        deleteBtn.addEventListener('click', () => deleteTransaction(transaction.id));
        deleteCell.appendChild(deleteBtn);
        
        // Amount
        const amountCell = document.createElement('td');
        const formattedAmount = transaction.amount.toLocaleString('he-IL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        amountCell.textContent = `${transaction.type === 'income' ? '+' : '-'} ${formattedAmount} ₪`;
        amountCell.style.color = transaction.type === 'income' ? 'green' : 'red';
        
        // Description
        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = transaction.description || '-';
        
        // Date
        const dateCell = document.createElement('td');
        dateCell.textContent = formatHebrewDate(transaction.date);
        
        // Type
        const typeCell = document.createElement('td');
        typeCell.textContent = transaction.type === 'income' ? 'הכנסה' : 'הוצאה';

        // Append cells
        row.appendChild(deleteCell);
        row.appendChild(amountCell);
        row.appendChild(descriptionCell);
        row.appendChild(dateCell);
        row.appendChild(typeCell);

        transactionsBody.appendChild(row);
    });
}

// Format date to Hebrew locale
function formatHebrewDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Delete a transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    renderTransactions();
    updateFinancialSummary();
}

// Update financial summary
function updateFinancialSummary() {
    const selectedYear = document.getElementById('yearSelect').value;
    const selectedMonth = document.getElementById('monthSelect').value;

    // Filter transactions for selected month
    const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === parseInt(selectedYear) && 
               (transactionDate.getMonth() + 1).toString().padStart(2, '0') === selectedMonth;
    });

    // Calculate totals
    const income = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;

    // Update UI
    document.getElementById('totalIncome').textContent = `${income.toLocaleString('he-IL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })} ₪`;
    document.getElementById('totalExpenses').textContent = `${expenses.toLocaleString('he-IL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })} ₪`;
    document.getElementById('totalBalance').textContent = `${balance.toLocaleString('he-IL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })} ₪`;
    
    // Color balance based on positive/negative
    const balanceElement = document.getElementById('totalBalance');
    balanceElement.style.color = balance >= 0 ? 'green' : 'red';
}

// Save transactions to local storage
function saveTransactions() {
    localStorage.setItem('expenseTrackerTransactions', JSON.stringify(transactions));
}

// Load transactions from local storage
function loadTransactions() {
    const savedTransactions = localStorage.getItem('expenseTrackerTransactions');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    }
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', initApp);