// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDvtZJhIN850tU7cETuiqRyCyjCBdlFt-Y",
  authDomain: "fynora-81313.firebaseapp.com",
  databaseURL: "https://fynora-81313-default-rtdb.firebaseio.com",
  projectId: "fynora-81313",
  storageBucket: "fynora-81313.firebasestorage.app",
  messagingSenderId: "593306264446",
  appId: "1:593306264446:web:da476d4c77ae4ede6b492f",
  measurementId: "G-BX0FWR2YMT"
};

// Initialization
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const tg = window.Telegram.WebApp;
tg.expand();

let currentUser = null;

// All Tasks Data
const taskData = [
    { id: 101, platform: 'twitter', icon: '𝕏', name: 'Follow & Repost X', reward: 0.02, owl: 1, stats: '1874 completed' },
    { id: 102, platform: 'telegram', icon: '✈️', name: 'Join OwlGrow Channel', reward: 0.02, owl: 1, stats: '902 running' },
    { id: 103, platform: 'tiktok', icon: '🎵', name: 'Watch TikTok Video', reward: 0.02, owl: 1, stats: '1205 completed' },
    { id: 104, platform: 'facebook', icon: '🔵', name: 'Like Facebook Page', reward: 0.02, owl: 1, stats: '640 completed' }
];

window.onload = async () => {
    const user = tg.initDataUnsafe?.user;
    
    if (user) {
        currentUser = { id: user.id, name: user.first_name, photo: user.photo_url || 'https://via.placeholder.com/44' };
    } else {
        // Guest mode for browser testing
        currentUser = { id: "GUEST_TEST_123", name: "Guest User", photo: 'https://via.placeholder.com/44' };
    }

    // Update Header & Profile
    document.getElementById('user-name').innerText = currentUser.name;
    document.getElementById('user-avatar').src = currentUser.photo;
    document.getElementById('profile-pic-large').src = currentUser.photo;
    document.getElementById('profile-name-text').innerText = currentUser.name;
    document.getElementById('profile-id-text').innerText = currentUser.id;

    await syncDatabase();
    renderAllTasks();
    updateLeaderboard();

    // Remove Loading
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 1500);
};

// Database Syncing
async function syncDatabase() {
    const ref = db.ref('users/' + currentUser.id);
    const snap = await ref.once('value');
    
    if (!snap.exists()) {
        const initialData = {
            name: currentUser.name,
            balance_usdt: 0.00,
            balance_owl: 0,
            streak: 0,
            total_days: 0,
            last_checkin: 0,
            tasks_today: 0,
            completed_tasks: {}
        };
        await ref.set(initialData);
        updateUIPanel(initialData);
    } else {
        updateUIPanel(snap.val());
    }
}

function updateUIPanel(data) {
    document.getElementById('balance-usdt').innerText = (data.balance_usdt || 0).toFixed(2);
    document.getElementById('balance-owl').innerText = data.balance_owl || 0;
    document.getElementById('streak-count').innerText = data.streak || 0;
    document.getElementById('total-days').innerText = data.total_days || 0;
    document.getElementById('total-usdt-p').innerText = '$' + (data.balance_usdt || 0).toFixed(2);
    
    // Activity Progress
    const done = data.tasks_today || 0;
    document.getElementById('tasks-done').innerText = done;
    const progress = Math.min((done / 3) * 100, 100);
    document.getElementById('activity-progress').style.width = progress + '%';
}

// Rendering Tasks
function renderAllTasks() {
    const hotList = document.getElementById('hot-tasks-list');
    const allList = document.getElementById('all-tasks-list');
    let html = '';

    taskData.forEach(task => {
        html += `
            <div class="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl flex justify-between items-center transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-xl shadow-inner">${task.icon}</div>
                    <div>
                        <p class="font-bold text-sm">${task.name}</p>
                        <p class="text-[10px] text-orange-500 font-black">+$${task.reward} USDT | +${task.owl} OWL</p>
                        <p class="text-[9px] text-slate-500 uppercase mt-1 tracking-tighter">${task.stats}</p>
                    </div>
                </div>
                <button onclick="handleTask(${task.id})" class="bg-orange-500 text-white px-5 py-2 rounded-full text-[10px] font-black shadow-lg shadow-orange-500/20 active:scale-90 transition-all">START</button>
            </div>
        `;
    });
    hotList.innerHTML = html;
    allList.innerHTML = html;
}

// Task Logic
async function handleTask(id) {
    tg.showConfirm("Proceed to complete the task? Verification may take 30 seconds.", (ok) => {
        if (ok) {
            tg.HapticFeedback.impactOccurred('medium');
            // Mock social binding & verification flow
            tg.showProgress(true);
            setTimeout(async () => {
                tg.showProgress(false);
                await awardRewards(0.02, 1);
                tg.showAlert("Task Verified! Success.");
            }, 3000);
        }
    });
}

async function awardRewards(usdt, owl) {
    const ref = db.ref('users/' + currentUser.id);
    const snap = await ref.once('value');
    const data = snap.val();

    await ref.update({
        balance_usdt: (data.balance_usdt || 0) + usdt,
        balance_owl: (data.balance_owl || 0) + owl,
        tasks_today: (data.tasks_today || 0) + 1
    });
    syncDatabase();
}

// Check-in System
async function checkIn() {
    const ref = db.ref('users/' + currentUser.id);
    const snap = await ref.once('value');
    const data = snap.val();
    
    const now = Date.now();
    const last = data.last_checkin || 0;
    
    if (now - last < 86400000) {
        tg.showAlert("You've already claimed your reward today. Check back tomorrow!");
        return;
    }

    await ref.update({
        streak: (data.streak || 0) + 1,
        total_days: (data.total_days || 0) + 1,
        balance_owl: (data.balance_owl || 0) + 3,
        last_checkin: now
    });

    tg.showAlert("Streak Updated! +3 OWL Coins added.");
    syncDatabase();
}

// Leaderboard
async function updateLeaderboard() {
    const ref = db.ref('users').orderByChild('balance_usdt').limitToLast(10);
    const snap = await ref.once('value');
    const list = document.getElementById('leaderboard-list');
    let html = '';
    let rank = 1;

    let users = [];
    snap.forEach(c => { users.push(c.val()); });
    users.reverse().forEach(u => {
        html += `
            <div class="flex justify-between items-center p-4 bg-slate-800 rounded-xl">
                <div class="flex items-center gap-3">
                    <span class="text-orange-500 font-black">#${rank++}</span>
                    <p class="text-sm font-bold">${u.name}</p>
                </div>
                <p class="text-sm font-black text-white">$${(u.balance_usdt || 0).toFixed(2)}</p>
            </div>
        `;
    });
    list.innerHTML = html;
}

// Utils
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(s => s.classList.add('hidden'));
    document.getElementById(tabId + '-screen').classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-tab'));
    document.getElementById('btn-' + tabId).classList.add('active-tab');
    tg.HapticFeedback.selectionChanged();
}

function s
