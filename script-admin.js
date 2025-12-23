// ==================== GITHUB PAGES INTEGRATION ====================

const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN_HERE'; // Ganti dengan token GitHub Anda
const REPO_OWNER = 'YOUR_USERNAME'; // Ganti dengan username GitHub Anda
const REPO_NAME = 'YOUR_REPO_NAME'; // Ganti dengan nama repository
const DATA_FILE = 'orders.json'; // File untuk menyimpan data di GitHub

let githubEnabled = false;

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    // Cek apakah GitHub token sudah diatur
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
        GITHUB_TOKEN = savedToken;
        githubEnabled = true;
        showGitHubStatus('GitHub Connected', 'success');
    }
    
    loadOrders();
    setInterval(loadOrders, 10000);
});

// ==================== GITHUB FUNCTIONS ====================

// Simpan token GitHub
function setGitHubToken() {
    const token = prompt('Masukkan GitHub Personal Access Token:');
    if (token) {
        GITHUB_TOKEN = token;
        localStorage.setItem('github_token', token);
        githubEnabled = true;
        showGitHubStatus('GitHub Connected', 'success');
        saveToGitHub();
    }
}

// Simpan data ke GitHub
async function saveToGitHub() {
    if (!githubEnabled) {
        if (confirm('GitHub belum dikoneksikan. Ingin setup sekarang?')) {
            setGitHubToken();
        }
        return;
    }
    
    try {
        // Get current data
        const data = {
            orders: orders,
            last_updated: new Date().toISOString(),
            stats: {
                total: orders.length,
                pending: orders.filter(o => o.status === 'pending').length,
                processing: orders.filter(o => o.status === 'processing').length,
                completed: orders.filter(o => o.status === 'completed').length
            }
        };
        
        // Get existing file to get SHA
        let sha = null;
        try {
            const existing = await fetch(
                `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`,
                {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (existing.ok) {
                const fileData = await existing.json();
                sha = fileData.sha;
            }
        } catch (e) {
            // File doesn't exist yet
            console.log('Creating new file on GitHub');
        }
        
        // Create or update file
        const content = btoa(JSON.stringify(data, null, 2));
        
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update orders - ${new Date().toLocaleString()}`,
                    content: content,
                    sha: sha
                })
            }
        );
        
        if (response.ok) {
            showGitHubStatus('Data saved to GitHub!', 'success');
            console.log('✅ Data saved to GitHub');
        } else {
            const error = await response.json();
            showGitHubStatus('GitHub Error: ' + error.message, 'error');
            console.error('GitHub error:', error);
        }
        
    } catch (error) {
        console.error('Error saving to GitHub:', error);
        showGitHubStatus('Connection error', 'error');
    }
}

// Load data dari GitHub
async function loadFromGitHub() {
    if (!githubEnabled) {
        alert('Please set GitHub token first');
        return;
    }
    
    try {
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (response.ok) {
            const fileData = await response.json();
            const content = atob(fileData.content);
            const data = JSON.parse(content);
            
            // Merge dengan data lokal
            orders = data.orders || [];
            localStorage.setItem('pangsit_orders', JSON.stringify(orders));
            
            // Update display
            updateStats();
            renderOrders();
            
            showGitHubStatus('Data loaded from GitHub', 'success');
            console.log('✅ Data loaded from GitHub');
            
        } else if (response.status === 404) {
            console.log('No data file on GitHub yet');
            showGitHubStatus('No data on GitHub yet', 'info');
        }
        
    } catch (error) {
        console.error('Error loading from GitHub:', error);
        showGitHubStatus('Connection error', 'error');
    }
}

// Sync data (two-way sync)
async function syncWithGitHub() {
    if (!githubEnabled) {
        setGitHubToken();
        return;
    }
    
    try {
        // Load from GitHub first
        await loadFromGitHub();
        
        // Then save back (merge)
        await saveToGitHub();
        
        showGitHubStatus('Sync completed', 'success');
        
    } catch (error) {
        console.error('Sync error:', error);
        showGitHubStatus('Sync failed', 'error');
    }
}

// Buat repository baru di GitHub
async function createGitHubRepo() {
    if (!githubEnabled) {
        setGitHubToken();
        return;
    }
    
    const repoName = prompt('Nama repository baru:', 'pangsit-orders');
    if (!repoName) return;
    
    try {
        const response = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: repoName,
                description: 'PANGS!T Orders Database',
                private: false,
                auto_init: true,
                license_template: 'mit'
            })
        });
        
        if (response.ok) {
            REPO_NAME = repoName;
            localStorage.setItem('github_repo', repoName);
            showGitHubStatus(`Repository ${repoName} created`, 'success');
            
            // Simpan data pertama
            setTimeout(saveToGitHub, 1000);
            
        } else {
            const error = await response.json();
            showGitHubStatus('Error: ' + error.message, 'error');
        }
        
    } catch (error) {
        console.error('Error creating repo:', error);
        showGitHubStatus('Connection error', 'error');
    }
}

// Tampilkan status GitHub
function showGitHubStatus(message, type) {
    // Hapus notifikasi sebelumnya
    const existing = document.getElementById('github-notification');
    if (existing) existing.remove();
    
    // Buat notifikasi baru
    const notif = document.createElement('div');
    notif.id = 'github-notification';
    notif.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#fff3cd'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#856404'};
        padding: 12px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        border: 2px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#ffeeba'};
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 300px;
    `;
    
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    notif.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span style="font-weight: 600;">${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: inherit;
            font-size: 18px;
            cursor: pointer;
            margin-left: auto;
        ">×</button>
    `;
    
    document.body.appendChild(notif);
    
    // Auto remove setelah 5 detik
    setTimeout(() => {
        if (notif.parentElement) notif.remove();
    }, 5000);
}

// ==================== MODIFIED FUNCTIONS ====================

// Modifikasi fungsi loadOrders untuk include GitHub
function loadOrders() {
    try {
        // Update last update time
        document.getElementById('lastUpdate').textContent = 
            `Last update: ${new Date().toLocaleTimeString('id-ID')}`;
        
        // Get orders from localStorage
        const ordersData = localStorage.getItem('pangsit_orders');
        
        if (ordersData) {
            orders = JSON.parse(ordersData);
            orders.sort((a, b) => b.timestamp - a.timestamp);
            updateStats();
            renderOrders();
            checkNewOrders();
        } else {
            orders = [];
            updateStats();
            renderOrders();
        }
        
        // Auto save ke GitHub jika enabled
        if (githubEnabled && orders.length > 0) {
            setTimeout(saveToGitHub, 2000);
        }
        
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Modifikasi fungsi updateStatus untuk auto-save ke GitHub
function updateStatus(orderId) {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;
    
    const statuses = ['pending', 'processing', 'completed'];
    const currentStatus = orders[orderIndex].status || 'pending';
    const currentIndex = statuses.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    
    orders[orderIndex].status = nextStatus;
    orders[orderIndex].updated_at = new Date().toISOString();
    
    localStorage.setItem('pangsit_orders', JSON.stringify(orders));
    renderOrders();
    updateStats();
    
    // Auto save ke GitHub
    if (githubEnabled) {
        saveToGitHub();
    }
    
    alert(`Status order ${orderId} diubah menjadi: ${nextStatus.toUpperCase()}`);
}

// Modifikasi fungsi clearOrders
function clearOrders() {
    if (confirm('Hapus SEMUA data order? Tindakan ini tidak bisa dibatalkan!')) {
        localStorage.removeItem('pangsit_orders');
        orders = [];
        updateStats();
        renderOrders();
        
        // Hapus juga dari GitHub jika enabled
        if (githubEnabled) {
            if (confirm('Hapus juga dari GitHub?')) {
                deleteFromGitHub();
            }
        }
        
        alert('Semua data order telah dihapus');
    }
}

// Hapus file dari GitHub
async function deleteFromGitHub() {
    try {
        // Get SHA of existing file
        const existing = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (existing.ok) {
            const fileData = await existing.json();
            
            // Delete file
            const response = await fetch(
                `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: 'Delete all orders data',
                        sha: fileData.sha
                    })
                }
            );
            
            if (response.ok) {
                showGitHubStatus('Data deleted from GitHub', 'success');
            }
        }
        
    } catch (error) {
        console.error('Error deleting from GitHub:', error);
    }
}

// ==================== UI ENHANCEMENTS ====================

// Tambahkan controls GitHub ke HTML
function addGitHubControls() {
    const controls = document.querySelector('.controls');
    
    const githubControls = document.createElement('div');
    githubControls.style.cssText = `
        display: flex;
        gap: 10px;
        margin-left: 20px;
        border-left: 2px solid #eee;
        padding-left: 20px;
    `;
    
    githubControls.innerHTML = `
        <button class="btn btn-secondary" onclick="setGitHubToken()" style="background: #24292e;">
            <i class="fab fa-github"></i> Connect GitHub
        </button>
        <button class="btn btn-success" onclick="syncWithGitHub()">
            <i class="fas fa-sync"></i> Sync
        </button>
        <button class="btn" onclick="saveToGitHub()" style="background: #6f42c1;">
            <i class="fas fa-cloud-upload-alt"></i> Save to Cloud
        </button>
    `;
    
    controls.appendChild(githubControls);
}

// Panggil setelah DOM loaded
setTimeout(addGitHubControls, 1000);

console.log('🚀 GitHub Integration ready!');