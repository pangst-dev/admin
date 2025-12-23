// ==================== PANGS!T ADMIN PANEL ====================
// File: script-admin.js
// Tanggal: 2025
// Author: PANGS!T Team

// ==================== KONFIGURASI ====================

// Data awal
let semuaOrders = [];
let soundEnabled = true;
let lastUpdateTime = null;
let refreshInterval = null;

// Nama toko
const TOKO_NAMA = "PANGS!T STORE";

// ==================== FUNGSI UTAMA ====================

// Inisialisasi admin panel
function initAdminPanel() {
    console.log("🚀 Admin Panel PANGS!T dimulai...");
    
    // Setup awal
    setupEventListeners();
    loadOrdersFromStorage();
    startAutoRefresh();
    setupSoundToggle();
    
    // Tambah data contoh jika kosong
    if (semuaOrders.length === 0) {
        addSampleOrders();
    }
    
    // Update tampilan
    updateDashboard();
    
    console.log("✅ Admin Panel siap digunakan!");
}

// Setup event listeners
function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadOrdersFromStorage);
    }
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportOrdersToJSON);
    }
    
    // Clear button
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllOrders);
    }
    
    // Sound toggle
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', toggleSound);
    }
    
    // File upload
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    // Setup drag & drop
    setupDragAndDrop();
}

// ==================== LOAD & SAVE DATA ====================

// Load orders dari localStorage
function loadOrdersFromStorage() {
    try {
        console.log("📥 Memuat data orders...");
        
        // Tampilkan loading
        showLoading(true);
        
        // Ambil dari localStorage
        const ordersData = localStorage.getItem('pangsit_orders');
        const adminData = localStorage.getItem('pangsit_admin_orders');
        
        // Gabungkan data
        let loadedOrders = [];
        
        if (ordersData) {
            const customerOrders = JSON.parse(ordersData);
            loadedOrders = [...loadedOrders, ...customerOrders];
        }
        
        if (adminData) {
            const adminOrders = JSON.parse(adminData);
            loadedOrders = [...loadedOrders, ...adminOrders];
        }
        
        // Filter duplikat berdasarkan ID
        const uniqueOrders = [];
        const seenIds = new Set();
        
        loadedOrders.forEach(order => {
            const orderId = order.id || order.order_id;
            if (!seenIds.has(orderId)) {
                seenIds.add(orderId);
                
                // Standarisasi format order
                const standardizedOrder = {
                    id: orderId,
                    customer: {
                        name: order.customer?.name || order.nama || "Tidak ada nama",
                        phone: order.customer?.phone || order.telp || "Tidak ada telp",
                        address: order.customer?.address || order.alamat || "Tidak ada alamat",
                        email: order.customer?.email || ""
                    },
                    products: order.products || [],
                    total: order.total || 0,
                    status: order.status || 'pending',
                    date: order.date || new Date().toLocaleDateString('id-ID'),
                    time: order.time || new Date().toLocaleTimeString('id-ID'),
                    timestamp: order.timestamp || Date.now(),
                    payment: order.paymentMethod || order.payment || "Unknown",
                    notes: order.notes || ""
                };
                
                uniqueOrders.push(standardizedOrder);
            }
        });
        
        // Urutkan berdasarkan waktu (terbaru dulu)
        uniqueOrders.sort((a, b) => b.timestamp - a.timestamp);
        
        semuaOrders = uniqueOrders;
        
        // Simpan versi terbaru ke localStorage admin
        localStorage.setItem('pangsit_admin_orders', JSON.stringify(semuaOrders));
        
        // Update tampilan
        updateDashboard();
        
        // Cek order baru
        checkNewOrders();
        
        // Sembunyikan loading
        showLoading(false);
        
        console.log(`✅ ${semuaOrders.length} orders berhasil dimuat`);
        
    } catch (error) {
        console.error("❌ Error loading orders:", error);
        showLoading(false);
        alert("Error memuat data orders: " + error.message);
    }
}

// Simpan orders ke localStorage
function saveOrdersToStorage() {
    try {
        localStorage.setItem('pangsit_admin_orders', JSON.stringify(semuaOrders));
        console.log(`💾 ${semuaOrders.length} orders disimpan`);
    } catch (error) {
        console.error("Error saving orders:", error);
    }
}

// ==================== DASHBOARD UPDATE ====================

// Update seluruh dashboard
function updateDashboard() {
    updateOrderStats();
    renderOrdersList();
    updateLastUpdateTime();
}

// Update statistics
function updateOrderStats() {
    const totalOrders = semuaOrders.length;
    const newOrders = semuaOrders.filter(o => o.status === 'pending').length;
    const processingOrders = semuaOrders.filter(o => o.status === 'processing').length;
    const completedOrders = semuaOrders.filter(o => o.status === 'completed').length;
    
    // Hitung total pendapatan
    const totalRevenue = semuaOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Update elemen di halaman
    updateElementText('totalOrders', totalOrders.toString());
    updateElementText('newOrders', newOrders.toString());
    updateElementText('processingOrders', processingOrders.toString());
    updateElementText('completedOrders', completedOrders.toString());
    updateElementText('totalRevenue', formatRupiah(totalRevenue));
}

// Render orders list
function renderOrdersList() {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;
    
    if (semuaOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <h4>Belum ada orders</h4>
                <p class="text-muted">Tunggu customer melakukan pemesanan</p>
            </div>
        `;
        return;
    }
    
    // Buat HTML untuk setiap order
    let ordersHTML = '';
    
    semuaOrders.forEach(order => {
        const isNew = order.status === 'pending';
        const isProcessing = order.status === 'processing';
        const isCompleted = order.status === 'completed';
        
        // Tentukan class CSS
        let statusClass = 'badge-secondary';
        let statusText = 'Menunggu';
        
        if (isNew) {
            statusClass = 'badge-warning';
            statusText = 'BARU';
        } else if (isProcessing) {
            statusClass = 'badge-info';
            statusText = 'DIPROSES';
        } else if (isCompleted) {
            statusClass = 'badge-success';
            statusText = 'SELESAI';
        }
        
        // Format items
        let itemsHTML = '';
        if (order.products && order.products.length > 0) {
            itemsHTML = order.products.map(product => 
                `<div class="small">${product.name} x${product.quantity}</div>`
            ).join('');
        } else {
            itemsHTML = '<div class="small text-muted">Tidak ada detail items</div>';
        }
        
        // Order card HTML
        ordersHTML += `
            <div class="order-card ${isNew ? 'new-order' : ''}" data-id="${order.id}">
                <div class="order-header">
                    <div class="order-id">#${order.id}</div>
                    <div class="order-time">${order.date} ${order.time}</div>
                </div>
                
                <div class="order-customer">
                    <div class="customer-name">
                        <i class="fas fa-user mr-2"></i>${order.customer.name}
                    </div>
                    <div class="customer-phone">
                        <i class="fas fa-phone mr-2"></i>${order.customer.phone}
                    </div>
                    <div class="customer-address small text-muted">
                        <i class="fas fa-map-marker-alt mr-2"></i>${order.customer.address}
                    </div>
                </div>
                
                <div class="order-details">
                    ${itemsHTML}
                    <div class="order-total mt-2">
                        <strong>Total: ${formatRupiah(order.total)}</strong>
                    </div>
                </div>
                
                <div class="order-status">
                    <span class="badge ${statusClass}">${statusText}</span>
                </div>
                
                <div class="order-actions">
                    <button class="btn btn-sm btn-success" onclick="updateOrderStatus('${order.id}')">
                        <i class="fas fa-check"></i> Update
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="whatsappCustomer('${order.customer.phone}', '${order.id}')">
                        <i class="fab fa-whatsapp"></i> WA
                    </button>
                    <button class="btn btn-sm btn-info" onclick="callCustomer('${order.customer.phone}')">
                        <i class="fas fa-phone"></i> Call
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    ordersContainer.innerHTML = ordersHTML;
}

// Update last update time
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID');
    const dateString = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    updateElementText('lastUpdate', `Terakhir update: ${timeString}`);
    updateElementText('currentDate', dateString);
}

// ==================== ORDER MANAGEMENT ====================

// Update status order
function updateOrderStatus(orderId) {
    const orderIndex = semuaOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        alert("Order tidak ditemukan!");
        return;
    }
    
    const order = semuaOrders[orderIndex];
    
    // Tentukan status berikutnya
    const statusFlow = ['pending', 'processing', 'completed'];
    const currentIndex = statusFlow.indexOf(order.status);
    const nextIndex = (currentIndex + 1) % statusFlow.length;
    const nextStatus = statusFlow[nextIndex];
    
    // Update status
    semuaOrders[orderIndex].status = nextStatus;
    
    // Simpan perubahan
    saveOrdersToStorage();
    
    // Update tampilan
    updateDashboard();
    
    // Kirim notifikasi ke customer (opsional)
    if (nextStatus === 'completed') {
        const confirmSend = confirm(`Order #${orderId} selesai. Kirim notifikasi ke customer?`);
        if (confirmSend) {
            sendCompletionNotification(order);
        }
    }
    
    // Play sound
    playNotificationSound();
    
    alert(`Status order #${orderId} diubah menjadi: ${getStatusText(nextStatus)}`);
}

// Delete order
function deleteOrder(orderId) {
    if (!confirm(`Hapus order #${orderId}?`)) {
        return;
    }
    
    const orderIndex = semuaOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;
    
    // Hapus order
    semuaOrders.splice(orderIndex, 1);
    
    // Simpan perubahan
    saveOrdersToStorage();
    
    // Update tampilan
    updateDashboard();
    
    alert(`Order #${orderId} telah dihapus`);
}

// ==================== CUSTOMER COMMUNICATION ====================

// WhatsApp customer
function whatsappCustomer(phoneNumber, orderId) {
    if (!phoneNumber || phoneNumber === "Tidak ada telp") {
        alert("Nomor telepon tidak tersedia");
        return;
    }
    
    // Format nomor (hapus karakter non-digit)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Buat pesan
    const message = `Halo, ini dari ${TOKO_NAMA}.\n\nOrder #${orderId} sedang kami proses.\nTerima kasih telah berbelanja di toko kami!`;
    
    // Encode untuk URL
    const encodedMessage = encodeURIComponent(message);
    
    // Buat URL WhatsApp
    const whatsappURL = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    // Buka WhatsApp
    window.open(whatsappURL, '_blank');
}

// Call customer
function callCustomer(phoneNumber) {
    if (!phoneNumber || phoneNumber === "Tidak ada telp") {
        alert("Nomor telepon tidak tersedia");
        return;
    }
    
    // Format nomor untuk telepon
    const telURL = `tel:${phoneNumber}`;
    
    // Buka dialer
    window.location.href = telURL;
}

// Kirim notifikasi order selesai
function sendCompletionNotification(order) {
    if (!order.customer.phone || order.customer.phone === "Tidak ada telp") {
        return;
    }
    
    const cleanPhone = order.customer.phone.replace(/\D/g, '');
    const message = `Halo ${order.customer.name},\n\nOrder #${order.id} sudah SELESAI dan siap diantar.\n\nTotal: ${formatRupiah(order.total)}\n\nTerima kasih,\n${TOKO_NAMA}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
}

// ==================== DATA EXPORT & IMPORT ====================

// Export orders ke JSON
function exportOrdersToJSON() {
    if (semuaOrders.length === 0) {
        alert("Tidak ada data untuk diexport");
        return;
    }
    
    try {
        // Buat data untuk export
        const exportData = {
            toko: TOKO_NAMA,
            exportDate: new Date().toISOString(),
            totalOrders: semuaOrders.length,
            orders: semuaOrders
        };
        
        // Convert ke JSON string
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // Buat blob dan download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `pangsit_orders_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert(`✅ ${semuaOrders.length} orders berhasil diexport`);
        
    } catch (error) {
        console.error("Error exporting orders:", error);
        alert("Error mengexport data: " + error.message);
    }
}

// Import orders dari file
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
        alert("Hanya file JSON yang didukung");
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (!importedData.orders || !Array.isArray(importedData.orders)) {
                alert("Format file tidak valid");
                return;
            }
            
            // Tambah orders baru
            const newOrders = importedData.orders;
            const currentOrderIds = new Set(semuaOrders.map(o => o.id));
            
            let addedCount = 0;
            newOrders.forEach(order => {
                if (!currentOrderIds.has(order.id)) {
                    // Standarisasi format
                    const standardizedOrder = {
                        id: order.id,
                        customer: {
                            name: order.customer?.name || "Tidak ada nama",
                            phone: order.customer?.phone || "Tidak ada telp",
                            address: order.customer?.address || "Tidak ada alamat"
                        },
                        products: order.products || [],
                        total: order.total || 0,
                        status: order.status || 'pending',
                        date: order.date || new Date().toLocaleDateString('id-ID'),
                        time: order.time || new Date().toLocaleTimeString('id-ID'),
                        timestamp: order.timestamp || Date.now()
                    };
                    
                    semuaOrders.push(standardizedOrder);
                    addedCount++;
                }
            });
            
            // Simpan dan update
            saveOrdersToStorage();
            updateDashboard();
            
            alert(`✅ ${addedCount} orders baru berhasil diimport`);
            
        } catch (error) {
            console.error("Error importing file:", error);
            alert("Error membaca file: " + error.message);
        }
    };
    
    reader.readAsText(file);
}

// Setup drag & drop
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    if (!dropZone) return;
    
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', function() {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            const file = e.dataTransfer.files[0];
            const fakeEvent = { target: { files: [file] } };
            handleFileUpload(fakeEvent);
        }
    });
}

// ==================== UTILITY FUNCTIONS ====================

// Format rupiah
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Get status text
function getStatusText(status) {
    const statusMap = {
        'pending': 'BARU',
        'processing': 'DIPROSES',
        'completed': 'SELESAI'
    };
    return statusMap[status] || status;
}

// Update element text
function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

// Show/hide loading
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}

// Play notification sound
function playNotificationSound() {
    if (!soundEnabled) return;
    
    try {
        // Buat audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
    } catch (error) {
        console.log("Audio not supported, using fallback");
        // Fallback: buat elemen audio sederhana
        const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
        audio.volume = 0.3;
        audio.play().catch(e => console.log("Audio play failed"));
    }
}

// Toggle sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    
    const soundIcon = document.getElementById('soundIcon');
    const soundToggle = document.getElementById('soundToggle');
    
    if (soundIcon && soundToggle) {
        if (soundEnabled) {
            soundIcon.className = 'fas fa-volume-up';
            soundToggle.title = 'Sound ON';
            soundToggle.classList.remove('text-muted');
        } else {
            soundIcon.className = 'fas fa-volume-mute';
            soundToggle.title = 'Sound OFF';
            soundToggle.classList.add('text-muted');
        }
    }
    
    // Simpan preference
    localStorage.setItem('pangsit_sound_enabled', soundEnabled.toString());
}

// Setup sound toggle dari localStorage
function setupSoundToggle() {
    const savedSoundPref = localStorage.getItem('pangsit_sound_enabled');
    if (savedSoundPref !== null) {
        soundEnabled = savedSoundPref === 'true';
    }
    
    // Update icon awal
    toggleSound();
}

// Check new orders
function checkNewOrders() {
    if (!lastUpdateTime) {
        lastUpdateTime = Date.now();
        return;
    }
    
    const newOrders = semuaOrders.filter(order => 
        order.timestamp > lastUpdateTime
    );
    
    if (newOrders.length > 0) {
        // Play sound
        playNotificationSound();
        
        // Show notification
        showNewOrderNotification(newOrders.length);
        
        // Update last update time
        lastUpdateTime = Date.now();
    }
}

// Show new order notification
function showNewOrderNotification(count) {
    // Buat notifikasi element
    const notification = document.createElement('div');
    notification.className = 'new-order-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-bell text-warning mr-2"></i>
            <strong>${count} ORDER BARU!</strong>
            <button class="close-notification" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Tambah ke body
    document.body.appendChild(notification);
    
    // Auto remove setelah 5 detik
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Start auto-refresh
function startAutoRefresh() {
    // Hentikan interval sebelumnya jika ada
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    // Set interval baru (30 detik)
    refreshInterval = setInterval(() => {
        loadOrdersFromStorage();
    }, 30000); // 30 detik
    
    console.log("🔄 Auto-refresh diaktifkan (30 detik)");
}

// Clear all orders
function clearAllOrders() {
    if (semuaOrders.length === 0) {
        alert("Tidak ada data untuk dihapus");
        return;
    }
    
    if (!confirm(`Hapus SEMUA ${semuaOrders.length} orders? Tindakan ini tidak bisa dibatalkan!`)) {
        return;
    }
    
    // Hapus dari localStorage
    localStorage.removeItem('pangsit_admin_orders');
    
    // Reset data
    semuaOrders = [];
    
    // Update tampilan
    updateDashboard();
    
    alert("Semua data orders telah dihapus");
}

// Add sample orders untuk testing
function addSampleOrders() {
    const sampleOrders = [
        {
            id: 'PANG-' + Date.now(),
            customer: {
                name: 'Customer Contoh',
                phone: '081234567890',
                address: 'Jl. Contoh No. 123',
                email: 'contoh@email.com'
            },
            products: [
                { name: 'Pangsit Pedas', quantity: 2, price: 20000 },
                { name: 'Pangsit Ayam', quantity: 1, price: 15000 }
            ],
            total: 55000,
            status: 'pending',
            date: new Date().toLocaleDateString('id-ID'),
            time: new Date().toLocaleTimeString('id-ID'),
            timestamp: Date.now(),
            payment: 'QRIS',
            notes: 'Contoh order untuk testing'
        }
    ];
    
    semuaOrders = sampleOrders;
    saveOrdersToStorage();
    
    console.log("📝 Sample orders ditambahkan untuk testing");
}

// ==================== CSS HELPER ====================

// Tambah CSS untuk admin panel
function addAdminCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .order-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            border-left: 4px solid #ff6b35;
            transition: all 0.3s ease;
        }
        
        .order-card:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        
        .order-card.new-order {
            border-left-color: #25D366;
            animation: pulse 2s infinite;
        }
        
        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .order-id {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: #2d3047;
        }
        
        .order-time {
            color: #6c757d;
            font-size: 14px;
        }
        
        .customer-name {
            font-weight: 600;
            font-size: 18px;
            color: #2d3047;
            margin-bottom: 5px;
        }
        
        .customer-phone {
            color: #ff6b35;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .order-total {
            font-size: 18px;
            font-weight: bold;
            color: #ff6b35;
            margin-top: 10px;
        }
        
        .order-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        
        .btn-sm {
            padding: 5px 10px;
            font-size: 14px;
        }
        
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #6c757d;
        }
        
        .new-order-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease;
            border-left: 4px solid #25D366;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .close-notification {
            background: none;
            border: none;
            color: #6c757d;
            cursor: pointer;
            margin-left: 15px;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .dragover {
            border-color: #ff6b35 !important;
            background: rgba(255, 107, 53, 0.05) !important;
        }
    `;
    
    document.head.appendChild(style);
}

// ==================== INITIALIZATION ====================

// Jalankan saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Tambah CSS khusus
    addAdminCSS();
    
    // Inisialisasi admin panel
    initAdminPanel();
    
    // Export fungsi ke global scope
    window.updateOrderStatus = updateOrderStatus;
    window.whatsappCustomer = whatsappCustomer;
    window.callCustomer = callCustomer;
    window.deleteOrder = deleteOrder;
    window.exportOrdersToJSON = exportOrdersToJSON;
    window.clearAllOrders = clearAllOrders;
    window.toggleSound = toggleSound;
    window.loadOrdersFromStorage = loadOrdersFromStorage;
});

// ==================== EVENT LISTENERS UNTUK DATA BARU ====================

// Listen untuk data baru dari halaman lain
window.addEventListener('storage', function(event) {
    if (event.key === 'pangsit_orders' || event.key === 'new_order_added') {
        console.log("📬 Data baru terdeteksi, memuat ulang...");
        loadOrdersFromStorage();
    }
});

// Listen untuk custom events
window.addEventListener('newOrderNotification', function() {
    playNotificationSound();
    loadOrdersFromStorage();
});

console.log("📄 script-admin.js loaded successfully");
