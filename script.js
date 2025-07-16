import { auth, database } from './firebase.js';
import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    // Authentication related elements
    const userEmailSpan = document.getElementById('user-email');
    const logoutButton = document.getElementById('logout-button');

    // Lotto Form Elements
    const dateInput = document.getElementById('date');
    const dayInput = document.getElementById('day');
    const shiftInput = document.getElementById('shift');
    const employeeNameInput = document.getElementById('employee-name');

    // Table Body Elements
    const amShiftBody = document.getElementById('am-shift-body');
    const pmShiftBody = document.getElementById('pm-shift-body');

    // AM Summary Elements
    const amTotalSpan = document.getElementById('am-total');
    const amNetDueInput = document.getElementById('am-net-due');
    const amCashSpan = document.getElementById('am-cash');

    // PM Summary Elements
    const pmTotalSpan = document.getElementById('pm-total');
    const dayTotalSpan = document.getElementById('day-total');
    const dayNetDueInput = document.getElementById('day-net-due');
    const dayCashSpan = document.getElementById('day-cash');

    // Buttons
    const clearAllButton = document.getElementById('clear-all');

    let currentUserId = null;
    const ticketPrices = [1, 2, 3, 5, 10, 20, 30];

    // --- AUTHENTICATION ---
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUserId = user.uid;
            userEmailSpan.textContent = user.email;
            loadData();
        } else {
            currentUserId = null;
            userEmailSpan.textContent = 'Logged Out';
            if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
                 window.location.href = 'login.html';
            }
        }
    });
    
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            auth.signOut();
        });
    }

    // --- INITIALIZATION ---
    const setInitialDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
        updateDayOfWeek();
    };

    const updateDayOfWeek = () => {
        const date = new Date(dateInput.value);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        dayInput.value = dayOfWeek;
    };

    const createRow = (price) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="ticket-price">$${price}</td>
            <td><input type="number" class="opening-tickets"></td>
            <td><input type="number" class="tickets-added"></td>
            <td><input type="number" class="closing-tickets"></td>
            <td class="tickets-sold">0</td>
            <td class="amount">0.00</td>
        `;
        return row;
    };

    const addInitialRows = () => {
        amShiftBody.innerHTML = '';
        pmShiftBody.innerHTML = '';
        ticketPrices.forEach(price => {
            const amRow = createRow(price);
            amShiftBody.appendChild(amRow);
            const pmRow = createRow(price);
            pmShiftBody.appendChild(pmRow);
        });
        attachAllListeners();
    };

    // --- CALCULATIONS ---
    const calculateRow = (row) => {
        const opening = parseInt(row.querySelector('.opening-tickets').value) || 0;
        const added = parseInt(row.querySelector('.tickets-added').value) || 0;
        const closing = parseInt(row.querySelector('.closing-tickets').value) || 0;
        const priceText = row.querySelector('.ticket-price').textContent;
        const price = parseFloat(priceText.replace('$', '')) || 0;

        const sold = opening + added - closing;
        const amount = sold * price;

        row.querySelector('.tickets-sold').textContent = sold;
        row.querySelector('.amount').textContent = amount.toFixed(2);

        return amount;
    };

    const updateTotals = () => {
        let amTotal = 0;
        amShiftBody.querySelectorAll('tr').forEach(row => {
            amTotal += calculateRow(row);
        });
        amTotalSpan.textContent = amTotal.toFixed(2);

        const amNetDue = parseFloat(amNetDueInput.value) || 0;
        amCashSpan.textContent = (amTotal + amNetDue).toFixed(2);

        // Auto-fill PM opening tickets from AM closing tickets
        const amClosingInputs = amShiftBody.querySelectorAll('.closing-tickets');
        const pmOpeningInputs = pmShiftBody.querySelectorAll('.opening-tickets');
        amClosingInputs.forEach((input, index) => {
            if (pmOpeningInputs[index]) {
                pmOpeningInputs[index].value = input.value;
            }
        });

        let pmTotal = 0;
        pmShiftBody.querySelectorAll('tr').forEach(row => {
            pmTotal += calculateRow(row);
        });
        pmTotalSpan.textContent = pmTotal.toFixed(2);

        const dayTotal = amTotal + pmTotal;
        dayTotalSpan.textContent = dayTotal.toFixed(2);

        const dayNetDue = parseFloat(dayNetDueInput.value) || 0;
        dayCashSpan.textContent = (dayTotal + dayNetDue).toFixed(2);

        saveData();
    };

    // --- EVENT LISTENERS ---
    const attachAllListeners = () => {
        const allInputs = document.querySelectorAll('#lotto-form input[type="number"]');
        allInputs.forEach(input => {
            input.addEventListener('input', updateTotals);
        });
        amNetDueInput.addEventListener('input', updateTotals);
        dayNetDueInput.addEventListener('input', updateTotals);
    };

    dateInput.addEventListener('change', () => {
        updateDayOfWeek();
        loadData();
    });

    clearAllButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all fields?')) {
            document.querySelectorAll('#lotto-form input[type="number"]').forEach(input => input.value = '');
            employeeNameInput.value = '';
            updateTotals();
            saveData(); // Save cleared state
        }
    });

    // --- DATA PERSISTENCE (FIREBASE) ---
    const saveData = () => {
        if (!currentUserId || !dateInput.value) return;

        const getTableData = (tbody) => {
            const data = [];
            tbody.querySelectorAll('tr').forEach(row => {
                data.push({
                    price: parseFloat(row.querySelector('.ticket-price').textContent.replace(/\$/g, '')),
                    opening: parseInt(row.querySelector('.opening-tickets').value) || 0,
                    added: parseInt(row.querySelector('.tickets-added').value) || 0,
                    closing: parseInt(row.querySelector('.closing-tickets').value) || 0,
                });
            });
            return data;
        };

        const dataToSave = {
            employeeName: employeeNameInput.value,
            amShift: getTableData(amShiftBody),
            pmShift: getTableData(pmShiftBody),
            amNetDue: parseFloat(amNetDueInput.value) || 0,
            dayNetDue: parseFloat(dayNetDueInput.value) || 0,
        };

        set(ref(database, `users/${currentUserId}/data/${dateInput.value}`), dataToSave);
    };

    const loadData = () => {
        if (!currentUserId || !dateInput.value) {
            addInitialRows();
            updateTotals();
            return;
        }

        const dataRef = ref(database, `users/${currentUserId}/data/${dateInput.value}`);
        onValue(dataRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                employeeNameInput.value = data.employeeName || '';
                amNetDueInput.value = data.amNetDue || '';
                dayNetDueInput.value = data.dayNetDue || '';

                addInitialRows(); // Clear and re-add rows before filling

                const fillTableData = (tbody, savedData) => {
                    if (!savedData) return;
                    const rows = tbody.querySelectorAll('tr');
                    rows.forEach((row, index) => {
                        const rowData = savedData[index];
                        if (rowData) {
                            row.querySelector('.opening-tickets').value = rowData.opening || '';
                            row.querySelector('.tickets-added').value = rowData.added || '';
                            row.querySelector('.closing-tickets').value = rowData.closing || '';
                        }
                    });
                };

                fillTableData(amShiftBody, data.amShift);
                fillTableData(pmShiftBody, data.pmShift);
            } else {
                addInitialRows(); // Only add initial rows if no data is found
            }
            updateTotals();
        }, { onlyOnce: true });
    };

    // --- INITIAL LOAD ---
    setInitialDate();
});