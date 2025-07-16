document.addEventListener('DOMContentLoaded', () => {
    const amShiftBody = document.getElementById('am-shift-body');
    const pmShiftBody = document.getElementById('pm-shift-body');
    const addAmRowBtn = document.getElementById('add-am-row');
    const addPmRowBtn = document.getElementById('add-pm-row');
    const clearAllFormsBtn = document.getElementById('clear-all-forms');
    const amTotalAmountSpan = document.getElementById('am-total-amount');
    const amTotalCashSpan = document.getElementById('am-total-cash');
    const pmTotalAmountSpan = document.getElementById('pm-total-amount');
    const dayTotalAmountSpan = document.getElementById('day-total-amount');
    const dayNetDueInput = document.getElementById('day-net-due');
    const dayTotalCashSpan = document.getElementById('day-total-cash');
    const openingAmTotalSpan = document.getElementById('opening-am-total');
    const addedAmTotalSpan = document.getElementById('added-am-total');
    const closingPmTotalSpan = document.getElementById('closing-pm-total');
    const addedPmTotalSpan = document.getElementById('added-pm-total');

    let amShiftData = JSON.parse(localStorage.getItem('amShiftData')) || [];
    let pmShiftData = JSON.parse(localStorage.getItem('pmShiftData')) || [];

    function createRow(shiftType, data = {}) {
        const row = document.createElement('tr');
        const today = new Date().toISOString().split('T')[0];
        const dayOfWeek = new Date().toLocaleString('en-us', { weekday: 'long' });

        row.innerHTML = `
            <td><input type="date" class="date-input" value="${data.date || today}"></td>
            <td><input type="text" class="day-input" value="${data.day || dayOfWeek}"></td>
            <td><input type="text" class="shift-input" value="${data.shift || (shiftType === 'am' ? 'AM' : 'PM')}"></td>
            <td><input type="text" class="employee-input" value="${data.employee || ''}"></td>
            <td><input type="number" class="tickets-price-input" value="${data.ticketsPrice || '0.00'}" step="0.01"></td>
            <td><input type="number" class="opening-tickets-input" value="${data.openingTickets || '0'}"></td>
            <td><input type="number" class="tickets-added-input" value="${data.ticketsAdded || '0'}"></td>
            <td><input type="number" class="closing-tickets-input" value="${data.closingTickets || '0'}"></td>
            <td><span class="tickets-sold">${data.ticketsSold || '0'}</span></td>
            <td><span class="amount">${data.amount || '0.00'}</span></td>
            <td><input type="number" class="net-due-input" value="${data.netDue || '0.00'}" step="0.01"></td>
            <td><span class="cash">${data.cash || '0.00'}</span></td>
        `;

        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => updateRow(row, shiftType));
        });

        return row;
    }

    function updateRow(row, shiftType) {
        const ticketsPrice = parseFloat(row.querySelector('.tickets-price-input').value) || 0;
        const openingTickets = parseInt(row.querySelector('.opening-tickets-input').value) || 0;
        const ticketsAdded = parseInt(row.querySelector('.tickets-added-input').value) || 0;
        const closingTickets = parseInt(row.querySelector('.closing-tickets-input').value) || 0;
        const netDue = parseFloat(row.querySelector('.net-due-input').value) || 0;

        const ticketsSold = (openingTickets + ticketsAdded) - closingTickets;
        const amount = ticketsSold * ticketsPrice;
        const cash = amount - netDue;

        row.querySelector('.tickets-sold').textContent = ticketsSold;
        row.querySelector('.amount').textContent = amount.toFixed(2);
        row.querySelector('.cash').textContent = cash.toFixed(2);

        saveData();
        updateTotals();
    }

    function saveData() {
        amShiftData = [];
        amShiftBody.querySelectorAll('tr').forEach(row => {
            amShiftData.push({
                date: row.querySelector('.date-input').value,
                day: row.querySelector('.day-input').value,
                shift: row.querySelector('.shift-input').value,
                employee: row.querySelector('.employee-input').value,
                ticketsPrice: parseFloat(row.querySelector('.tickets-price-input').value) || 0,
                openingTickets: parseInt(row.querySelector('.opening-tickets-input').value) || 0,
                ticketsAdded: parseInt(row.querySelector('.tickets-added-input').value) || 0,
                closingTickets: parseInt(row.querySelector('.closing-tickets-input').value) || 0,
                ticketsSold: parseInt(row.querySelector('.tickets-sold').textContent) || 0,
                amount: parseFloat(row.querySelector('.amount').textContent) || 0,
                netDue: parseFloat(row.querySelector('.net-due-input').value) || 0,
                cash: parseFloat(row.querySelector('.cash').textContent) || 0,
            });
        });
        localStorage.setItem('amShiftData', JSON.stringify(amShiftData));

        pmShiftData = [];
        pmShiftBody.querySelectorAll('tr').forEach(row => {
            pmShiftData.push({
                date: row.querySelector('.date-input').value,
                day: row.querySelector('.day-input').value,
                shift: row.querySelector('.shift-input').value,
                employee: row.querySelector('.employee-input').value,
                ticketsPrice: parseFloat(row.querySelector('.tickets-price-input').value) || 0,
                openingTickets: parseInt(row.querySelector('.opening-tickets-input').value) || 0,
                ticketsAdded: parseInt(row.querySelector('.tickets-added-input').value) || 0,
                closingTickets: parseInt(row.querySelector('.closing-tickets-input').value) || 0,
                ticketsSold: parseInt(row.querySelector('.tickets-sold').textContent) || 0,
                amount: parseFloat(row.querySelector('.amount').textContent) || 0,
                netDue: parseFloat(row.querySelector('.net-due-input').value) || 0,
                cash: parseFloat(row.querySelector('.cash').textContent) || 0,
            });
        });
        localStorage.setItem('pmShiftData', JSON.stringify(pmShiftData));
    }

    function loadData() {
        amShiftData.forEach(data => amShiftBody.appendChild(createRow('am', data)));
        pmShiftData.forEach(data => pmShiftBody.appendChild(createRow('pm', data)));
        updateTotals();
    }

    function updateTotals() {
        let amTotalAmount = 0;
        let amTotalCash = 0;
        let openingAmTotal = 0;
        let addedAmTotal = 0;

        amShiftData.forEach(data => {
            amTotalAmount += data.amount;
            amTotalCash += data.cash;
            openingAmTotal += data.openingTickets;
            addedAmTotal += data.ticketsAdded;
        });

        amTotalAmountSpan.textContent = amTotalAmount.toFixed(2);
        amTotalCashSpan.textContent = amTotalCash.toFixed(2);
        openingAmTotalSpan.textContent = openingAmTotal;
        addedAmTotalSpan.textContent = addedAmTotal;

        let pmTotalAmount = 0;
        let closingPmTotal = 0;
        let addedPmTotal = 0;

        pmShiftData.forEach(data => {
            pmTotalAmount += data.amount;
            closingPmTotal += data.closingTickets;
            addedPmTotal += data.ticketsAdded;
        });

        pmTotalAmountSpan.textContent = pmTotalAmount.toFixed(2);
        closingPmTotalSpan.textContent = closingPmTotal;
        addedPmTotalSpan.textContent = addedPmTotal;

        const dayTotalAmount = amTotalAmount + pmTotalAmount;
        dayTotalAmountSpan.textContent = dayTotalAmount.toFixed(2);

        const dayNetDue = parseFloat(dayNetDueInput.value) || 0;
        const dayCash = dayTotalAmount - dayNetDue;
        dayTotalCashSpan.textContent = dayCash.toFixed(2);
    }

    addAmRowBtn.addEventListener('click', () => {
        amShiftBody.appendChild(createRow('am'));
        saveData();
        updateTotals();
    });

    addPmRowBtn.addEventListener('click', () => {
        pmShiftBody.appendChild(createRow('pm'));
        saveData();
        updateTotals();
    });

    dayNetDueInput.addEventListener('input', updateTotals);

    clearAllFormsBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all data?')) {
            localStorage.removeItem('amShiftData');
            localStorage.removeItem('pmShiftData');
            amShiftData = [];
            pmShiftData = [];
            amShiftBody.innerHTML = '';
            pmShiftBody.innerHTML = '';
            updateTotals();
        }
    });

    loadData();
});
