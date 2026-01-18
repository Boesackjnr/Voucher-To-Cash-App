
/**
 * VoucherCash - Premium Core Logic
 */

const STATE = {
    balance: 1250.00,
    isDarkMode: true,
    selectedVoucherProvider: '1Voucher',
    selectedAirtimeProvider: 'Vodacom',
    isAuthenticated: false,
    transactions: [
        { id: 1, type: 'Voucher', title: '1Voucher Redemption', amount: 450.00, date: 'Today, 2:40 PM', status: 'completed' },
        { id: 2, type: 'Withdraw', title: 'Bank Withdrawal', amount: -200.00, date: 'Yesterday, 11:15 AM', status: 'pending' },
        { id: 3, type: 'Airtime', title: 'MTN Airtime Swap', amount: 80.00, date: 'Oct 12, 4:20 PM', status: 'completed' }
    ]
};

function navigate(viewId) {
    const views = document.querySelectorAll('.view');
    views.forEach(v => v.classList.remove('active'));
    
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
    }
    updateNav(viewId);
    updateBalanceUI();
}

function handleAuth(type) {
    if (type === 'login' || type === 'signup') {
        STATE.isAuthenticated = true;
        navigate('view-dashboard');
    } else if (type === 'logout') {
        STATE.isAuthenticated = false;
        navigate('view-landing');
    }
}

function updateNav(viewId) {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.classList.remove('text-primary', 'active');
        btn.classList.add('text-slate-500');
    });

    const activeBtn = Array.from(navBtns).find(btn => btn.getAttribute('onclick')?.includes(viewId));
    if (activeBtn) {
        activeBtn.classList.remove('text-slate-500');
        activeBtn.classList.add('text-primary', 'active');
    }
}

function updateBalanceUI() {
    const balanceStrings = STATE.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.querySelectorAll('#user-balance, .withdraw-max-label').forEach(el => {
        el.innerText = balanceStrings;
    });
}

function toggleTheme() {
    STATE.isDarkMode = !STATE.isDarkMode;
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    if (STATE.isDarkMode) {
        html.classList.add('dark');
        icon.innerText = 'dark_mode';
    } else {
        html.classList.remove('dark');
        icon.innerText = 'light_mode';
    }
}

function toggleNotifications(show) {
    const panel = document.getElementById('notification-panel');
    const overlay = document.getElementById('notification-overlay');
    const badge = document.getElementById('notif-badge');
    if (show) {
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.add('opacity-100'), 10);
        panel.classList.add('open');
        if (badge) badge.style.display = 'none';
    } else {
        overlay.classList.remove('opacity-100');
        setTimeout(() => overlay.classList.add('hidden'), 300);
        panel.classList.remove('open');
    }
}

// Service Selectors
function selectVoucherProvider(btn, name) {
    document.querySelectorAll('.voucher-provider-btn').forEach(b => {
        b.classList.remove('bg-primary/10', 'border-primary');
        b.classList.add('bg-surface-light', 'dark:bg-surface-dark', 'border-transparent');
    });
    btn.classList.add('bg-primary/10', 'border-primary');
    btn.classList.remove('border-transparent');
    STATE.selectedVoucherProvider = name;
}

function selectAirtimeProvider(btn, name) {
    document.querySelectorAll('.airtime-provider-btn').forEach(b => {
        b.classList.remove('bg-primary/10', 'border-primary');
        b.classList.add('bg-surface-light', 'dark:bg-surface-dark', 'border-transparent');
    });
    btn.classList.add('bg-primary/10', 'border-primary');
    btn.classList.remove('border-transparent');
    STATE.selectedAirtimeProvider = name;
}

// Logic Handlers
function setMaxWithdraw() {
    const input = document.getElementById('withdraw-amount');
    if (input) input.value = STATE.balance;
}

function handleWithdrawal() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const bank = document.getElementById('withdraw-bank').value;

    if (!bank) return alert("Please select a bank.");
    if (isNaN(amount) || amount <= 0) return alert("Please enter a valid amount.");
    if (amount > STATE.balance) return alert("Insufficient funds.");

    if (confirm(`Withdraw R ${amount.toFixed(2)} to your ${bank} account?`)) {
        STATE.balance -= amount;
        addTransaction('Withdraw', `Cash Out to ${bank}`, -amount);
        alert("Withdrawal initiated. Expect settlement within 24 hours.");
        navigate('view-dashboard');
    }
}

function handleP2PTransfer() {
    const recipient = document.getElementById('p2p-recipient-id').value;
    const amount = parseFloat(document.getElementById('p2p-amount-input').value);

    if (!recipient) return alert("Please enter a Recipient ID.");
    if (isNaN(amount) || amount <= 0) return alert("Please enter a valid amount.");
    if (amount > STATE.balance) return alert("Insufficient balance.");

    if (confirm(`Send R ${amount.toFixed(2)} to ${recipient}?`)) {
        STATE.balance -= amount;
        addTransaction('Withdraw', `Transfer to ${recipient}`, -amount);
        alert("Funds transferred instantly!");
        document.getElementById('p2p-recipient-id').value = '';
        document.getElementById('p2p-amount-input').value = '';
        navigate('view-dashboard');
    }
}

/**
 * Enhanced Real-time Validation for Voucher PIN
 */
function setupVoucherLiveValidation() {
    const input = document.getElementById('voucher-pin-input');
    if (!input) return;

    input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\s/g, '');
        if (val.length === 16) {
            input.classList.add('border-primary', 'animate-pulse');
            // Mock server verification delay
            setTimeout(() => {
                input.classList.remove('animate-pulse');
                input.classList.add('border-emerald-500');
            }, 800);
        } else {
            input.classList.remove('border-emerald-500', 'border-primary', 'animate-pulse');
        }
    });
}

/**
 * Enhanced Real-time Settlement Preview for Airtime
 */
function setupAirtimeLiveValidation() {
    const input = document.getElementById('airtime-pin-input');
    const label = document.querySelector('#view-convert-airtime .text-2xl.font-black.text-emerald-500');
    if (!input || !label) return;

    input.addEventListener('input', (e) => {
        const val = e.target.value;
        // Looking for amount pattern in typical USSD strings or just numbers
        const match = val.match(/\d+/);
        if (match) {
            const amount = 100.00; // Simulated face value detection
            const settlement = amount * 0.85;
            label.innerText = `R ${settlement.toFixed(2)}`;
        } else {
            label.innerText = `Instant Cash`;
        }
    });
}

function handleVoucherRedeem() {
    const pin = document.getElementById('voucher-pin-input').value.trim();
    if (pin.length < 8) return alert("Please enter a valid PIN.");

    const val = pin.length * 15.5;
    
    STATE.balance += val;
    addTransaction('Voucher', `${STATE.selectedVoucherProvider} Redemption`, val);
    alert(`R ${val.toFixed(2)} added to your wallet.`);
    document.getElementById('voucher-pin-input').value = '';
    navigate('view-dashboard');
}

function handleAirtimeRedeem() {
    const pin = document.getElementById('airtime-pin-input').value.trim();
    if (pin.length < 5) return alert("Please enter a valid Recharge PIN.");

    const val = 100.00;
    const returnVal = val * 0.85;

    STATE.balance += returnVal;
    addTransaction('Airtime', `${STATE.selectedAirtimeProvider} Airtime Swap`, returnVal);
    alert(`Success! R ${returnVal.toFixed(2)} credited after 15% settlement fee.`);
    document.getElementById('airtime-pin-input').value = '';
    navigate('view-dashboard');
}

function addTransaction(type, title, amount) {
    STATE.transactions.unshift({
        id: Date.now(),
        type: type,
        title: title,
        amount: amount,
        date: 'Just now',
        status: 'completed'
    });
    renderTransactions();
    updateBalanceUI();
}

function renderTransactions() {
    const containers = [
        document.getElementById('transaction-list'),
        document.getElementById('history-container')
    ];

    const html = STATE.transactions.map(tx => `
        <div class="bg-surface-light dark:bg-surface-dark p-4 rounded-3xl border border-black/5 dark:border-white/5 flex items-center gap-4 active:scale-95 transition-transform shadow-sm">
            <div class="w-12 h-12 rounded-2xl ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'} flex items-center justify-center">
                <span class="material-symbols-outlined">${tx.amount > 0 ? (tx.type === 'Voucher' ? 'confirmation_number' : 'cell_tower') : 'account_balance'}</span>
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-xs">${tx.title}</h4>
                <p class="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">${tx.date}</p>
            </div>
            <div class="text-right">
                <p class="font-black text-sm ${tx.amount > 0 ? 'text-emerald-500' : ''}">
                    ${tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}
                </p>
                <span class="text-[8px] font-black uppercase tracking-tighter opacity-40">${tx.status}</span>
            </div>
        </div>
    `).join('');

    containers.forEach(container => {
        if (container) container.innerHTML = html;
    });
}

// Entry Point
document.addEventListener('DOMContentLoaded', () => {
    renderTransactions();
    updateBalanceUI();
    setupVoucherLiveValidation();
    setupAirtimeLiveValidation();
    
    // Start with Splash, then move to Landing
    setTimeout(() => {
        if (!STATE.isAuthenticated) {
            navigate('view-landing');
        } else {
            navigate('view-dashboard');
        }
    }, 2000);
});

// Global API
window.navigate = navigate;
window.handleAuth = handleAuth;
window.toggleTheme = toggleTheme;
window.toggleNotifications = toggleNotifications;
window.selectVoucherProvider = selectVoucherProvider;
window.selectAirtimeProvider = selectAirtimeProvider;
window.handleWithdrawal = handleWithdrawal;
window.handleVoucherRedeem = handleVoucherRedeem;
window.handleAirtimeRedeem = handleAirtimeRedeem;
window.handleP2PTransfer = handleP2PTransfer;
window.setMaxWithdraw = setMaxWithdraw;
