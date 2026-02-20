// Firebase Configuration from user
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

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
const tg = window.Telegram.WebApp;

let currentUser = null;

// অ্যাপ লোড হওয়ার সময় যা হবে
window.onload = async () => {
    // ১. ইউজার ডাটা ডিটেক্ট করা
    const tgUser = tg.initDataUnsafe?.user;
    
    if (tgUser) {
        currentUser = {
            id: tgUser.id,
            name: tgUser.first_name,
            photo: tgUser.photo_url || 'https://via.placeholder.com/40'
        };
    } else {
        // গেস্ট আইডি (ব্রাউজারের জন্য)
        let guestId = localStorage.getItem('owlgrow_guest_id');
        if (!guestId) {
            guestId = 'guest_' + Math.floor(Math.random() * 1000000);
            localStorage.setItem('owlgrow_guest_id', guestId);
        }
        currentUser = {
            id: guestId,
            name: "Guest User",
            photo: 'https://via.placeholder.com/40'
        };
    }

    // ২. UI আপডেট
    document.getElementById('user-name').innerText = currentUser.name;
    document.getElementById('user-avatar').src = currentUser.photo;
    document.getElementById('profile-pic-large').src = currentUser.photo;
    document.getElementById('profile-name-text').innerText = currentUser.name;
    document.getElementById('profile-id-text').innerText = currentUser.id;

    // ৩. ডাটাবেসের সাথে কানেক্ট হওয়া
    try {
        await syncUser();
        renderTasks();
        updateLeaderboard();
    } catch (e) {
        console.error("Firebase Error:", e);
    } finally {
        // লোডিং স্ক্রিন বন্ধ করা (ফোর্সলি বন্ধ করা হলো যাতে আটকে না থাকে)
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 1000);
    }
};

async function syncUser() {
    const ref = db.ref('users/' + currentUser.id);
    const snap = await ref.once('value');
    
    if (!snap.exists()) {
        const newUser = {
            name: currentUser.name,
            balance_usdt: 0.00,
            balance_owl: 0,
            streak: 0,
            last_checkin: 0,
            tasks_today: 0
        };
        await ref.set(newUser);
        updateUI(newUser);
    } else {
        updateUI(snap.val());
    }
}

function updateUI(data) {
    document.getElementById('balance-usdt').innerText = (data.balance_usdt || 0).toFixed(2);
    document.getElementById('balance-owl').innerText = data.balance_owl || 0;
    document.getElementById('streak-count').innerText = data.streak || 0;
    document.getElementById('total-usdt-p').innerText = '$' + (data.balance_usdt || 0).toFixed(2);
    document.getElementById('total-owl-p').innerText = data.balance_owl || 0;
    
    const tasksToday = data.tasks_today || 0;
    document.getElementById('tasks-today').innerText = tasksToday;
    const progress = Math.min((tasksToday / 3) * 100, 100);
    document.getElementById('activity-progress').style.width = progress + '%';
}

// ট্যাব পরিবর্তনের লজিক
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(s => s.classList.add('hidden'));
    document.getElementById(tabId + '-screen').classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-tab'));
    document.getElementById('btn-' + tabId).classList.add('active-tab');
    
    if(tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

// টাস্ক ডাটা এবং রেন্ডার
const tasks = [
    { id: 1, type: 'twitter', name: 'Follow & Repost X', reward: 0.02, owl: 1, icon: '𝕏', stats: '1874 completed' },
    { id: 2, type: 'telegram', name: 'Join Official Channel', reward: 0.02, owl: 1, icon: '✈️', stats: '702 running' },
    { id: 3, type: 'tiktok', name: 'Watch & Like TikTok', reward: 0.02, owl: 1, icon: '🎵', stats: '1200 completed' }
];

function renderTasks() {
    const hotList = document.getElementById('hot-tasks-list');
    const allList = document.getElementById('all-tasks-list');
    let html = '';
    tasks.forEach(t => {
        html += `
            <div class="card flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-xl">${t.icon}</div>
                    <div>
                        <p class="font-bold text-sm">${t.name}</p>
                        <p class="text-[10px] text-orange-400">+$${t.reward} USDT | +${t.owl} OWL</p>
                    </div>
                </div>
                <button onclick="startTask(${t.id})" class="bg-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold">START</button>
            </div>
        `;
    });
    hotList.innerHTML = html;
    allList.innerHTML = html;
}

// টাস্ক কমপ্লিট লজিক
async function startTask(id) {
    tg.showConfirm("Complete the task in the social app and return to claim.", (ok) => {
        if(ok) setTimeout(() => completeTask(id), 3000);
    });
}

async function completeTask(id) {
    const ref = db.ref('users/' + currentUser.id);
    const snap = await ref.once('value');
    const data = snap.val();
    
    await ref.update({
        balance_usdt: (data.balance_usdt || 0) + 0.02,
        balance_owl: (data.balance_owl || 0) + 1,
        tasks_today: (data.tasks_today || 0) + 1
    });
    
    tg.showAlert("Success! Rewards added.");
    syncUser();
}

// লিডারবোর্ড আপডেট
async function updateLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    const snapshot = await db.ref('users').orderByChild('balance_usdt').limitToLast(5).once('value');
    
    let html = '';
    snapshot.forEach(child => {
        const user = child.val();
        html = `
            <div class="card flex justify-between items-center py-3 bg-slate-800/50">
                <p class="text-sm font-bold">${user.name}</p>
                <p class="text-sm font-bold text-orange-500">$${(user.balance_usdt || 0).toFixed(2)}</p>
            </div>
        ` + html;
    });
    list.innerHTML = html || '<p class="text-center text-slate-500">No data</p>';
}

// ডেইলি চেক ইন
async function checkIn() {
    const ref = db.ref('users/' + currentUser.id);
    const snap = await ref.once('value');
    const data = snap.val();
    const now = Date.now();
    
    if (now - (data.last_checkin || 0) < 86400000) {
        tg.showAlert("Come back tomorrow!");
        return;
    }
    
    await ref.update({
        streak: (data.streak || 0) + 1,
        balance_owl: (data.balance_owl || 0) + 3,
        last_checkin: now
    });
    
    tg.showAlert("Claimed +3 OWL!");
    syncUser();
}

function shareReferral() {
    const link = `https://t.me/rkxrakibxyzbot?start=${currentUser.id}`;
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=Earn USDT on OwlGrow!`);
}
