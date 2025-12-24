// ==================== ADMIN PANEL SCRIPT ====================

let currentOrderId = null;

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    setupEventListeners();
    autoRefreshOrders();
    
    // Cek jika ada order ID di URL (dari link email)
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get('order');
    const focusFromUrl = urlParams.get('focus');
    
    if (orderIdFromUrl && focusFromUrl) {
        // Scroll ke order yang dimaksud
        setTimeout(() => {
            const orderRow = document.querySelector(`[data-order-id="${orderIdFromUrl}"]`);
            if (orderRow) {
                orderRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                orderRow.style.background = '#fff3cd';
                setTimeout(() => orderRow.style.background = '', 3000);
            }
        }, 1000);
    }
});

// Load semua pesanan
function loadOrders() {
    const orders = PANGSIT_DB.getAllOrders();
    renderOrdersTable(orders);
    updateStats(orders);
}

// Render tabel pesanan
function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    
    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 20px; display: block; opacity: 0.3;"></i>
                    Belum ada pesanan
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr class="order-row" data-order-id="${order.id}">
            <td>
                <strong style="color: var(--secondary);">${order.id}</strong>
                ${!order.adminViewed ? '<span style="margin-left: 5px; background: #dc3545; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">BARU</span>' : ''}
            </td>
            <td>
                <div><strong>${order.customer?.name || 'Tidak ada nama'}</strong></div>
                <div style="font-size: 14px; color: #666;">${order.customer?.phone || ''}</div>
            </td>
            <td>
                <div>${order.date || 'Unknown date'}</div>
                <div style="font-size: 14px; color: #666;">${order.time || ''}</div>
            </td>
            <td style="font-weight: bold; color: var(--primary);">
                Rp ${order.total?.toLocaleString() || '0'}
            </td>
            <td>
                <span class="status-badge ${getStatusClass(order.status)}">
                    ${getStatusText(order.status)}
                </span>
            </td>
            <td>
                <button class="btn-action btn-view" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i> Detail
                </button>
                <button class="btn-action btn-update" onclick="openUpdateModal('${order.id}')">
                    <i class="fas fa-edit"></i> Update
                </button>
            </td>
        </tr>
    `).join('');
}

// Update statistik
function updateStats(orders) {
    const today = new Date().toLocaleDateString('id-ID');
    
    // Pesanan hari ini
    const todayOrders = orders.filter(order => order.date === today).length;
    document.getElementById('todayOrders').textContent = todayOrders;
    
    // Menunggu diproses
    const pendingOrders = orders.filter(order => 
        order.status === 'pending' || order.status === 'new'
    ).length;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    
    // Pesanan baru (belum dilihat admin)
    const newOrders = orders.filter(order => !order.adminViewed).length;
    document.getElementById('newOrders').textContent = newOrders;
    
    // Total pendapatan
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    document.getElementById('totalRevenue').textContent = `Rp ${totalRevenue.toLocaleString()}`;
}

// Buka modal update status
function openUpdateModal(orderId) {
    currentOrderId = orderId;
    const orders = PANGSIT_DB.getAllOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    document.getElementById('modalOrderInfo').innerHTML = `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Pelanggan:</strong> ${order.customer?.name || 'Tidak ada nama'}</p>
            <p><strong>Telepon:</strong> ${order.customer?.phone || 'Tidak ada'}</p>
            <p><strong>Status Saat Ini:</strong> 
                <span class="status-badge ${getStatusClass(order.status)}">
                    ${getStatusText(order.status)}
                </span>
            </p>
        </div>
    `;
    
    // Set status option yang aktif
    document.querySelectorAll('.status-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.status === order.status) {
            btn.classList.add('active');
        }
    });
    
    document.getElementById('updateStatusModal').style.display = 'flex';
}

// Setup event listeners
function setupEventListeners() {
    // Tombol refresh
    document.getElementById('refreshBtn').addEventListener('click', loadOrders);
    
    // Status options
    document.querySelectorAll('.status-option').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.status-option').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Tombol cancel update
    document.getElementById('cancelUpdate').addEventListener('click', function() {
        document.getElementById('updateStatusModal').style.display = 'none';
    });
    
    // Tombol confirm update
    document.getElementById('confirmUpdate').addEventListener('click', function() {
        if (!currentOrderId) return;
        
        const selectedStatus = document.querySelector('.status-option.active')?.dataset.status;
        if (!selectedStatus) {
            alert('Pilih status terlebih dahulu!');
            return;
        }
        
        // Update status di database
        const success = PANGSIT_DB.updateStatus(currentOrderId, selectedStatus);
        
        if (success) {
            alert(`Status pesanan ${currentOrderId} berhasil diupdate!`);
            document.getElementById('updateStatusModal').style.display = 'none';
            loadOrders(); // Refresh tabel
            
            // Tandai sudah dilihat admin
            PANGSIT_DB.markAsViewed(currentOrderId);
        } else {
            alert('Gagal update status. Coba lagi.');
        }
    });
}

// Lihat detail pesanan
function viewOrderDetails(orderId) {
    const orders = PANGSIT_DB.getAllOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const detailHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 20px auto;">
            <h3 style="color: var(--secondary); margin-bottom: 20px;">
                Detail Pesanan ${order.id}
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                <div>
                    <h4 style="color: var(--secondary); margin-bottom: 10px;">Info Pelanggan</h4>
                    <p><strong>Nama:</strong> ${order.customer?.name || '-'}</p>
                    <p><strong>Telepon:</strong> ${order.customer?.phone || '-'}</p>
                    <p><strong>Email:</strong> ${order.customer?.email || '-'}</p>
                    <p><strong>Alamat:</strong> ${order.customer?.address || '-'}</p>
                </div>
                <div>
                    <h4 style="color: var(--secondary); margin-bottom: 10px;">Info Pesanan</h4>
                    <p><strong>Tanggal:</strong> ${order.date} ${order.time}</p>
                    <p><strong>Status:</strong> 
                        <span class="status-badge ${getStatusClass(order.status)}">
                            ${getStatusText(order.status)}
                        </span>
                    </p>
                    <p><strong>Total:</strong> 
                        <span style="color: var(--primary); font-weight: bold;">
                            Rp ${order.total?.toLocaleString() || '0'}
                        </span>
                    </p>
                    <p><strong>Metode Bayar:</strong> ${order.paymentMethod?.toUpperCase() || '-'}</p>
                </div>
            </div>
            
            <h4 style="color: var(--secondary); margin-bottom: 15px;">Items Pesanan</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; text-align: left;">Produk</th>
                        <th style="padding: 10px; text-align: center;">Qty</th>
                        <th style="padding: 10px; text-align: right;">Harga</th>
                        <th style="padding: 10px; text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.products?.map(p => `
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${p.name}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${p.quantity}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rp ${p.price?.toLocaleString() || '0'}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rp ${(p.price * p.quantity)?.toLocaleString() || '0'}</td>
                        </tr>
                    `).join('') || ''}
                </tbody>
            </table>
            
            <div style="text-align: center; margin-top: 25px;">
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: var(--primary); color: white; border: none; 
                               padding: 10px 25px; border-radius: 5px; cursor: pointer;">
                    Tutup
                </button>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); z-index: 2000; display: flex;
        align-items: center; justify-content: center; padding: 20px;
    `;
    modal.innerHTML = detailHTML;
    document.body.appendChild(modal);
    
    // Tandai sudah dilihat admin
    PANGSIT_DB.markAsViewed(orderId);
}

// Helper functions
function getStatusClass(status) {
    switch(status) {
        case 'pending': case 'new': return 'status-new';
        case 'processing': return 'status-processing';
        case 'shipped': return 'status-shipped';
        case 'delivered': return 'status-delivered';
        default: return 'status-new';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'pending': case 'new': return 'Menunggu';
        case 'processing': return 'Diproses';
        case 'shipped': return 'Dikirim';
        case 'delivered': return 'Selesai';
        default: return 'Menunggu';
    }
}

// Auto refresh setiap 30 detik
function autoRefreshOrders() {
    setInterval(() => {
        loadOrders();
    }, 30000);
}

// Ekspor fungsi ke global scope
window.viewOrderDetails = viewOrderDetails;
window.openUpdateModal = openUpdateModal;