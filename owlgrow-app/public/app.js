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
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const tg = window.Telegram.WebApp;
tg.expand();

let currentUser = null;

// Initialization
window.onload = async () => {
    const user = tg.initDataUnsafe?.user;
    if (user) {
        currentUser = {
            id: user.id,
            name: user.first_name,
            username: user.username,
            photo: user.photo_url || 'https://via.placeholder.com/40'
        };
        
        // UI Updates
        document.getElementById('user-name').innerText = currentUser.name;
        document.getElementById('user-avatar').src = currentUser.photo;
        document.getElementById('profile-pic-large').src = currentUser.photo;
        document.getElementById('profile-name').innerText = currentUser.name;
        document.getElementById('profile-id').innerText = currentUser.id;
        
        await syncUser();
    }
    
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 1500);
    
    renderTasks();
};

async function syncUser() {
    const ref = db.ref('users/' + currentUser.id);
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) {
        await ref.set({
            name: currentUser.name,
            balance_usdt: 0.00,
            balance_owl: 0,
            streak: 0,
            last_checkin: 0,
            tasks_completed: 0
        });
    } else {
        const data = snapshot.val();
        document.getElementById('balance-usdt').innerText = (data.balance_usdt || 0).toFixed(2);
        document.getElementById('balance-owl').innerText = data.balance_owl || 0;
        document.getElementById('streak-count').innerText = data.streak || 0;
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(s => s.classList.add('hidden'));
    document.getElementById(tabId + '-screen').classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-tab'));
    event.currentTarget.classList.add('active-tab');
    
    tg.HapticFeedback.impactOccurred('light');
}

const tasks = [
    { id: 1, type: 'twitter', name: 'Follow OwlGrow X', reward: 0.02, owl: 1, icon: '𝕏', progress: '1874 completed' },
    { id: 2, type: 'telegram', name: 'Join Announcement', reward: 0.02, owl: 1, icon: '✈️', progress: '702 running' },
    { id: 3, type: 'tiktok', name: 'Like Latest Video', reward: 0.02, owl: 1, icon: '🎵', progress: '540 completed' }
];

function renderTasks() {
    const container = document.getElementById('hot-tasks-list');
    const allTasks = document.getElementById('all-tasks-list');
    
    let html = '';
    tasks.forEach(task => {
        html += `
            <div class="card flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <span class="text-2xl bg-slate-700 w-10 h-10 flex items-center justify-center rounded-lg">${task.icon}</span>
                    <div>
                        <p class="font-bold text-sm text-white">${task.name}</p>
                        <p class="text-[10px] text-orange-400 font-bold">+$${task.reward} USDT | +${task.owl} OWL</p>
                        <p class="text-[9px] text-slate-500 uppercase mt-1">${task.progress}</p>
                    </div>
                </div>
                <button onclick="startTask(${task.id})" class="bg-orange-500 hover:bg-orange-600 text-white text-[10px] px-4 py-2 rounded-full font-bold transition-all">START</button>
            </div>
        `;
    });
    container.innerHTML = html;
    allTasks.innerHTML = html;
}

function startTask(id) {
    tg.showConfirm("Complete task on social media to claim rewards.", (ok) => {
        if(ok) {
            tg.HapticFeedback.notificationOccurred('success');
            setTimeout(() => completeTask(id), 3000);
        }
    });
}

async function completeTask(id) {
    const ref = db.ref('users/' + currentUser.id);
    const snap = await ref.once('value');
    const data = snap.val();

    await ref.update({
        balance_usdt: (data.balance_usdt || 0) + 0.02,
        balance_owl: (data.balance_owl || 0) + 1,
        tasks_completed: (data.tasks_completed || 0) + 1
    });
    
    tg.showAlert("Congrats! $0.02 USDT added to your wallet.");
    syncUser();
}

function shareReferral() {
    const refLink = `https://t.me/your_bot_user_name?start=${currentUser.id}`;
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=Join OwlGrow and earn USDT! 🦉💰`);
                      }
