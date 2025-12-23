// ==================== SIMPLE GITHUB DATABASE (NO TOKEN) ====================

class SimpleGitHubDB {
    constructor() {
        this.githubRawURL = null;
        this.lastUpdate = null;
    }
    
    // Setup GitHub URL (dari file JSON yang di-upload manual)
    setup(githubUsername, repoName, fileName = 'orders.json') {
        // Format: https://raw.githubusercontent.com/username/repo/main/filename
        this.githubRawURL = `https://raw.githubusercontent.com/${githubUsername}/${repoName}/main/${fileName}?t=${Date.now()}`;
        console.log('📁 GitHub URL:', this.githubRawURL);
    }
    
    // ==================== READ DATA ====================
    
    // Ambil data dari GitHub (READ ONLY)
    async fetchFromGitHub() {
        if (!this.githubRawURL) {
            console.warn('⚠️ GitHub URL belum disetup');
            return this.getLocalData();
        }
        
        try {
            console.log('📥 Fetching data from GitHub...');
            
            const response = await fetch(this.githubRawURL, {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }
            
            const data = await response.json();
            this.lastUpdate = new Date();
            
            console.log(`✅ Data loaded: ${data.orders?.length || 0} orders`);
            
            // Simpan ke localStorage sebagai cache
            if (data.orders) {
                localStorage.setItem('github_orders_cache', JSON.stringify(data.orders));
                localStorage.setItem('github_last_fetch', this.lastUpdate.toISOString());
            }
            
            return data.orders || [];
            
        } catch (error) {
            console.error('❌ Error fetching from GitHub:', error);
            return this.getLocalData(); // Fallback ke lokal
        }
    }
    
    // ==================== WRITE DATA ====================
    
    // Simpan data (lokal + buat file untuk upload)
    saveData(orders) {
        // 1. Simpan di localStorage
        localStorage.setItem('pangsit_orders', JSON.stringify(orders));
        
        // 2. Buat file JSON untuk diupload ke GitHub
        const fileContent = this.createGitHubFile(orders);
        
        // 3. Tampilkan file untuk download
        this.downloadFile(fileContent, 'orders.json');
        
        // 4. Tampilkan instruksi upload
        this.showUploadInstructions();
        
        return true;
    }
    
    // Tambah order baru
    addOrder(newOrder) {
        // Generate ID jika belum ada
        if (!newOrder.id) {
            newOrder.id = this.generateOrderId();
        }
        
        newOrder.createdAt = new Date().toISOString();
        newOrder.updatedAt = new Date().toISOString();
        
        // Ambil data yang ada
        const currentOrders = this.getLocalData();
        
        // Tambah order baru
        currentOrders.unshift(newOrder);
        
        // Simpan (maks 100 orders)
        const limitedOrders = currentOrders.slice(0, 100);
        
        // Simpan ke semua tempat
        this.saveData(limitedOrders);
        
        // Kirim notifikasi WhatsApp
        this.sendWhatsAppNotification(newOrder);
        
        return newOrder.id;
    }
    
    // Update order
    updateOrder(orderId, updates) {
        const orders = this.getLocalData();
        const index = orders.findIndex(o => o.id === orderId);
        
        if (index !== -1) {
            orders[index] = {
                ...orders[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            this.saveData(orders);
            return true;
        }
        
        return false;
    }
    
    // ==================== SYNC SYSTEM ====================
    
    // Sync data antara lokal dan GitHub
    async sync() {
        console.log('🔄 Syncing data...');
        
        try {
            // 1. Ambil dari GitHub
            const githubData = await this.fetchFromGitHub();
            
            // 2. Ambil data lokal
            const localData = this.getLocalData();
            
            // 3. Merge data (ambil yang terbaru)
            const mergedData = this.mergeData(githubData, localData);
            
            // 4. Simpan hasil merge
            this.saveData(mergedData);
            
            console.log(`✅ Sync complete: ${mergedData.length} orders`);
            
            return mergedData;
            
        } catch (error) {
            console.error('❌ Sync failed:', error);
            return this.getLocalData();
        }
    }
    
    // ==================== HELPER FUNCTIONS ====================
    
    getLocalData() {
        // Coba dari cache GitHub dulu
        const githubCache = localStorage.getItem('github_orders_cache');
        if (githubCache) {
            return JSON.parse(githubCache);
        }
        
        // Fallback ke data utama
        return JSON.parse(localStorage.getItem('pangsit_orders')) || [];
    }
    
    generateOrderId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `PANG${timestamp}${random}`.toUpperCase();
    }
    
    createGitHubFile(orders) {
        const data = {
            app: "Pangsit Store",
            version: "1.0",
            updatedAt: new Date().toISOString(),
            orders: orders
        };
        
        return JSON.stringify(data, null, 2);
    }
    
    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    mergeData(githubData, localData) {
        const dataMap = new Map();
        
        // Tambahkan semua data dari GitHub
        githubData.forEach(order => {
            dataMap.set(order.id, order);
        });
        
        // Update dengan data lokal (jika lebih baru)
        localData.forEach(order => {
            const existing = dataMap.get(order.id);
            if (!existing || new Date(order.updatedAt) > new Date(existing.updatedAt)) {
                dataMap.set(order.id, order);
            }
        });
        
        // Konversi ke array dan urutkan
        return Array.from(dataMap.values())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    sendWhatsAppNotification(order) {
        const message = `📦 *PESANAN BARU - PANGS!T* 📦

🔢 ID: ${order.id.slice(-6)}
👤 Nama: ${order.customer?.name || 'N/A'}
📞 Telp: ${order.customer?.phone || 'N/A'}
💰 Total: ${this.formatRupiah(order.total || 0)}

📋 Items:
${(order.products || []).map(p => `• ${p.name} x${p.quantity}`).join('\n')}

📍 Alamat: ${order.customer?.address?.substring(0, 50) || 'N/A'}...

⏰ Waktu: ${new Date(order.createdAt).toLocaleTimeString('id-ID')}

✅ Status: MENUNGGU`;

        const encoded = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/6283195243139?text=${encoded}`;
        
        // Buka WhatsApp
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 1000);
    }
    
    formatRupiah(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    }
    
    showUploadInstructions() {
        const modalHTML = `
            <div class="modal" style="display: flex;">
                <div class="modal-content" style="max-width: 500px;">
                    <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
                    <div style="padding: 30px; text-align: center;">
                        <div style="font-size: 60px; color: var(--primary); margin-bottom: 20px;">
                            <i class="fab fa-github"></i>
                        </div>
                        
                        <h2 style="color: var(--secondary); margin-bottom: 15px;">
                            Upload ke GitHub
                        </h2>
                        
                        <p style="color: var(--gray); margin-bottom: 25px;">
                            File <strong>orders.json</strong> sudah didownload. 
                            Upload ke GitHub agar admin bisa melihatnya.
                        </p>
                        
                        <div style="background: var(--light); padding: 20px; border-radius: 10px; text-align: left; margin-bottom: 25px;">
                            <h4 style="color: var(--secondary); margin-bottom: 10px;">
                                <i class="fas fa-list-ol"></i> Cara Upload:
                            </h4>
                            <ol style="padding-left: 20px; color: var(--gray);">
                                <li>Buka <a href="https://github.com" target="_blank">GitHub.com</a></li>
                                <li>Pergi ke repository pangsit-database</li>
                                <li>Klik "Add file" → "Upload files"</li>
                                <li>Drag file orders.json yang didownload</li>
                                <li>Klik "Commit changes"</li>
                            </ol>
                        </div>
                        
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <button onclick="this.closest('.modal').remove()" 
                                    style="padding: 12px 25px; background: var(--primary); color: white; border: none; border-radius: 5px; cursor: pointer;">
                                <i class="fas fa-check"></i> Mengerti
                            </button>
                            <button onclick="window.open('https://github.com', '_blank')" 
                                    style="padding: 12px 25px; background: var(--secondary); color: white; border: none; border-radius: 5px; cursor: pointer;">
                                <i class="fab fa-github"></i> Buka GitHub
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHTML;
        document.body.appendChild(modalDiv);
    }
    
    // ==================== ADMIN FUNCTIONS ====================
    
    // Untuk admin: Setup auto-refresh
    setupAdminAutoRefresh(interval = 30000) {
        if (!this.isAdminPage()) return;
        
        console.log('🔄 Admin auto-refresh aktif');
        
        // Refresh pertama
        this.fetchFromGitHub().then(orders => {
            this.onDataUpdated(orders);
        });
        
        // Setup interval
        setInterval(() => {
            this.fetchFromGitHub().then(orders => {
                this.onDataUpdated(orders);
            });
        }, interval);
    }
    
    isAdminPage() {
        return window.location.hash === '#admin' || 
               document.title.includes('Admin') ||
               document.querySelector('.admin-page') !== null;
    }
    
    onDataUpdated(orders) {
        // Callback ketika data diupdate
        console.log('📊 Data updated:', orders.length, 'orders');
        
        // Update UI (implementasi sesuai kebutuhan)
        if (typeof window.renderAdminOrders === 'function') {
            window.renderAdminOrders(orders);
        }
        
        // Update stats
        this.updateStats(orders);
    }
    
    updateStats(orders) {
        const stats = {
            total: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            processing: orders.filter(o => o.status === 'processing').length,
            delivered: orders.filter(o => o.status === 'delivered').length
        };
        
        // Update UI stats
        const statsElement = document.getElementById('orderStats');
        if (statsElement) {
            statsElement.innerHTML = this.createStatsHTML(stats);
        }
    }
    
    createStatsHTML(stats) {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <div style="font-size: 32px; font-weight: bold; color: var(--primary);">${stats.total}</div>
                    <div style="color: var(--gray); font-size: 14px;">Total Pesanan</div>
                </div>
                <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <div style="font-size: 32px; font-weight: bold; color: #ffc107;">${stats.pending}</div>
                    <div style="color: var(--gray); font-size: 14px;">Menunggu</div>
                </div>
                <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <div style="font-size: 32px; font-weight: bold; color: #17a2b8;">${stats.processing}</div>
                    <div style="color: var(--gray); font-size: 14px;">Diproses</div>
                </div>
                <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <div style="font-size: 32px; font-weight: bold; color: #28a745;">${stats.delivered}</div>
                    <div style="color: var(--gray); font-size: 14px;">Selesai</div>
                </div>
            </div>
        `;
    }
}

// ==================== IMPLEMENTASI PRAKTIS ====================

// Inisialisasi database
const simpleDB = new SimpleGitHubDB();

// Setup awal (ganti dengan data GitHub Anda)
simpleDB.setup("username-github", "nama-repo", "orders.json");

// ==================== FUNGSI UTAMA ====================

// Fungsi untuk customer membuat pesanan
async function createOrder(orderData) {
    // Simpan order
    const orderId = simpleDB.addOrder(orderData);
    
    // Tampilkan konfirmasi
    showNotification(`✅ Pesanan ${orderId} berhasil dibuat!`, 'success');
    
    // Tampilkan instruksi upload
    setTimeout(() => {
        simpleDB.showUploadInstructions();
    }, 2000);
    
    return orderId;
}

// Fungsi untuk admin melihat semua pesanan
async function adminLoadOrders() {
    return await simpleDB.fetchFromGitHub();
}

// Fungsi untuk admin update status
function adminUpdateOrder(orderId, status) {
    const success = simpleDB.updateOrder(orderId, { status: status });
    
    if (success) {
        showNotification(`✅ Status order ${orderId} diubah menjadi ${status}`, 'success');
        
        // Download file terbaru untuk diupload
        setTimeout(() => {
            const orders = simpleDB.getLocalData();
            simpleDB.saveData(orders);
        }, 1000);
    }
    
    return success;
}

// Fungsi untuk sync manual
async function manualSync() {
    showNotification('🔄 Melakukan sync data...', 'info');
    
    const orders = await simpleDB.sync();
    
    showNotification(`✅ Sync selesai: ${orders.length} pesanan`, 'success');
    
    return orders;
}

// ==================== INTEGRASI DENGAN KODE LAMA ====================

// Ganti fungsi saveOrderToMaster
window.saveOrderToMaster = function(orderData) {
    // 1. Simpan ke localStorage (untuk kompatibilitas)
    let allOrders = JSON.parse(localStorage.getItem('pangsit_orders_master')) || [];
    allOrders.unshift(orderData);
    localStorage.setItem('pangsit_orders_master', JSON.stringify(allOrders.slice(0, 100)));
    
    // 2. Simpan ke sistem baru
    createOrder(orderData);
    
    return orderData;
};

// ==================== UI COMPONENTS ====================

// Tambahkan tombol sync di UI
function addSyncUI() {
    // Tombol untuk customer
    if (!simpleDB.isAdminPage()) {
        const syncBtn = document.createElement('button');
        syncBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Sync ke Cloud';
        syncBtn.className = 'btn btn-outline';
        syncBtn.style.margin = '10px';
        syncBtn.onclick = manualSync;
        
        const statusSection = document.getElementById('status');
        if (statusSection) {
            statusSection.appendChild(syncBtn);
        }
    }
    
    // Untuk admin: setup auto-refresh
    if (simpleDB.isAdminPage()) {
        simpleDB.setupAdminAutoRefresh(30000); // 30 detik
        
        // Tambahkan tombol refresh manual
        const refreshBtn = document.createElement('button');
        refreshBtn.innerHTML = '<i class="fas fa-redo"></i> Refresh Data';
        refreshBtn.className = 'btn';
        refreshBtn.style.margin = '10px';
        refreshBtn.onclick = async () => {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            const orders = await simpleDB.fetchFromGitHub();
            simpleDB.onDataUpdated(orders);
            refreshBtn.innerHTML = '<i class="fas fa-redo"></i> Refresh Data';
            showNotification(`✅ Data diperbarui: ${orders.length} pesanan`, 'success');
        };
        
        const adminControls = document.querySelector('.admin-controls') || document.getElementById('status');
        if (adminControls) {
            adminControls.appendChild(refreshBtn);
        }
    }
}

// ==================== TUTORIAL SETUP ====================

function showSetupTutorial() {
    const isFirstTime = !localStorage.getItem('db_initialized');
    
    if (isFirstTime && simpleDB.isAdminPage()) {
        const tutorialHTML = `
            <div class="modal" style="display: flex;">
                <div class="modal-content" style="max-width: 600px;">
                    <div style="padding: 30px;">
                        <h2 style="color: var(--primary); text-align: center; margin-bottom: 20px;">
                            <i class="fab fa-github"></i> Setup Database GitHub
                        </h2>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                            <h4 style="color: var(--secondary); margin-bottom: 10px;">
                                📋 Langkah-langkah:
                            </h4>
                            
                            <ol style="padding-left: 20px; color: #555;">
                                <li style="margin-bottom: 10px;">
                                    <strong>Buat repository baru</strong> di GitHub dengan nama: <code>pangsit-database</code>
                                </li>
                                <li style="margin-bottom: 10px;">
                                    <strong>Buat file orders.json</strong> di repository tersebut
                                </li>
                                <li style="margin-bottom: 10px;">
                                    <strong>Isi file dengan:</strong> <code>{"orders": []}</code>
                                </li>
                                <li style="margin-bottom: 10px;">
                                    <strong>Copy URL file:</strong> <code>https://raw.githubusercontent.com/username/pangsit-database/main/orders.json</code>
                                </li>
                                <li style="margin-bottom: 10px;">
                                    <strong>Ganti username</strong> di kode JavaScript dengan username GitHub Anda
                                </li>
                            </ol>
                        </div>
                        
                        <div style="text-align: center;">
                            <button onclick="localStorage.setItem('db_initialized', 'true'); this.closest('.modal').remove();" 
                                    style="padding: 12px 30px; background: var(--primary); color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                                <i class="fas fa-check"></i> Saya Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = tutorialHTML;
        document.body.appendChild(modalDiv);
    }
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Simple GitHub DB Initialized');
    
    // Setup tutorial untuk admin
    showSetupTutorial();
    
    // Tambahkan UI components
    addSyncUI();
    
    // Untuk admin: load data awal
    if (simpleDB.isAdminPage()) {
        simpleDB.fetchFromGitHub().then(orders => {
            simpleDB.onDataUpdated(orders);
        });
    }
});

// ==================== EXPORT FUNCTIONS ====================
window.simpleDB = simpleDB;
window.createOrder = createOrder;
window.adminLoadOrders = adminLoadOrders;
window.adminUpdateOrder = adminUpdateOrder;
window.manualSync = manualSync;
