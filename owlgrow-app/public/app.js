// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDvtZJhIN850tU7cETuiqRyCyjCBdlFt-Y",
  authDomain: "fynora-81313.firebaseapp.com",
  databaseURL: "https://fynora-81313-default-rtdb.firebaseio.com",
  projectId: "fynora-81313",
  storageBucket: "fynora-81313.firebasestorage.app",
  messagingSenderId: "593306264446",
  appId: "1:593306264446:web:da476d4c77ae4ede6b492f"
};

// Initialize
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const tg = window.Telegram.WebApp;
tg.expand();

let currentUser = null;

// Initial Load
window.onload = () => {
    const user = tg.initDataUnsafe?.user;
    if (user) {
        currentUser = { id: user.id, name: user.first_name, photo: user.photo_url || 'https://via.placeholder.com/44' };
    } else {
        currentUser = { id: "GUEST_" + Date.now(), name: "Guest User", photo: 'https://via.placeholder.com/44' };
    }

    // UI Update (তাত্ক্ষণিক)
    document.getElementById('user-name').innerText = currentUser.name;
    document.getElementById('user-avatar').src = currentUser.photo;
    document.getElementById('profile-pic-large').src = currentUser.photo;
    document.getElementById('profile-name-text').innerText = currentUser.name;
    document.getElementById('profile-id-text').innerText = currentUser.id;

    // Background Data Sync (পেছনে কাজ করবে, অ্যাপ আটকাবে না)
    syncData();
    renderTasks();
};

async function syncData() {
    try {
        const ref = db.ref('users/' + currentUser.id);
        const snap = await ref.once('value');
        
        if (!snap.exists()) {
            const initial = { balance_usdt: 0, balance_owl: 0, streak: 0, tasks_today: 0, name: currentUser.name };
            await ref.set(initial);
            updateUI(initial);
        } else {
            updateUI(snap.val());
        }
        updateLeaderboard();
    } catch (e) { console.error("Firebase Sync Error", e); }
}

function updateUI(data) {
    document.getElementById('balance-usdt').innerText = (data.balance_usdt || 0).toFixed(2);
    document.getElementById('balance-owl').innerText = data.balance_owl || 0;
    document.getElementById('streak-count').innerText = data.streak || 0;
    document.getElementById('total-usdt-p').innerText = '$' + (data.balance_usdt || 0).toFixed(2);
    document.getElementById('total-owl-p').innerText = data.balance_owl || 0;
    
    const done = data.tasks_today || 0;
    document.getElementById('tasks-done').innerText = done;
    document.getElementById('activity-progress').style.width = (Math.min(done/3, 1) * 100) + '%';
}

const tasks = [
    { id: 1, name: 'Follow Twitter', reward: 0.02, owl: 1, icon: '𝕏' },
    { id: 2, name: 'Join Telegram', reward: 0.02, owl: 1, icon: '✈️' },
    { id: 3, name: 'Watch TikTok', reward: 0.02, owl: 1, icon: '🎵' },
    { id: 4, name: 'Like Facebook', reward: 0.02, owl: 1, icon: '🔵' }
];

function renderTasks() {
    let html = '';
    tasks.forEach(t => {
        html += `
            <div class="bg-slate-800/50 p-4 rounded-2xl flex justify-between items-center border border-slate-700">
                <div class="flex items-center gap-3">
                    <div class="text-xl">${t.icon}</div>
                    <div>
                        <p class="font-bold text-sm">${t.name}</p>
                        <p class="text-[10px] text-orange-500">+$${t.reward} USDT | +${t.owl} OWL</p>
                    </div>
                </div>
                <button onclick="doTask(${t.id})" class="bg-orange-500 text-white px-4 py-1 rounded-full text-[10px] font-bold">START</button>
            </div>`;
    });
    document.getElementById('hot-tasks-list').innerHTML = html;
    document.getElementById('all-tasks-list').innerHTML = html;
}

async function doTask(id) {
    tg.showConfirm("Complete task and claim reward?", async (ok) => {
        if (ok) {
            const ref = db.ref('users/' + currentUser.id);
            const snap = await ref.once('value');
            const data = snap.val();
            await ref.update({
                balance_usdt: (data.balance_usdt || 0) + 0.02,
                balance_owl: (data.balance_owl || 0) + 1,
                tasks_today: (data.tasks_today || 0) + 1
            });
            tg.showAlert("Success! Rewards added.");
            syncData();
        }
    });
}

async function checkIn() {
    const ref = db.ref('users/' + currentUser.id);
    const snap = await ref.once('value');
    const data = snap.val();
    await ref.update({ streak: (data.streak || 0) + 1, balance_owl: (data.balance_owl || 0) + 3 });
    tg.showAlert("Checked In! +3 OWL");
    syncData();
}

function switchTab(id) {
    document.querySelectorAll('.tab-content').forEach(s => s.classList.add('hidden'));
    document.getElementById(id + '-screen').classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-tab'));
    document.getElementById('btn-' + id).classList.add('active-tab');
}

async function updateLeaderboard() {
    const snap = await db.ref('users').orderByChild('balance_usdt').limitToLast(5).once('value');
    let html = '';
    snap.forEach(c => {
        const u = c.val();
        html = `<div class="bg-slate-800 p-3 rounded-xl flex justify-between"><span>${u.name}</span><b>$${u.balance_usdt.toFixed(2)}</b></div>` + html;
    });
    document.getElementById('leaderboard-list').innerHTML = html;
}

function shareReferral() {
    const link = `https://t.me/your_bot?start=${currentUser.id}`;
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=Join OwlGrow!`);
}
