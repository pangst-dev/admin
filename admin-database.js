// PANGS!T Admin Database System
class AdminDatabase {
  constructor() {
    this.dbName = 'pangsit_admin_db';
    this.version = '2.0.0';
    this.localDB = {};
    
    this.init();
  }
  
  async init() {
    console.log('🔧 Admin Database Initializing...');
    
    // Load from localStorage
    this.loadFromLocal();
    
    // If empty, create default structure
    if (!this.localDB.system_info) {
      await this.createDefaultDatabase();
    }
    
    // Auto-save every minute
    setInterval(() => this.saveToLocal(), 60000);
    
    console.log('✅ Admin Database Ready');
    return this;
  }
  
  loadFromLocal() {
    try {
      const saved = localStorage.getItem(this.dbName);
      if (saved) {
        this.localDB = JSON.parse(saved);
        console.log('📂 Admin database loaded from localStorage');
        return true;
      }
    } catch (error) {
      console.error('❌ Error loading admin database:', error);
    }
    return false;
  }
  
  saveToLocal() {
    try {
      this.localDB.system_info.last_update = new Date().toISOString();
      localStorage.setItem(this.dbName, JSON.stringify(this.localDB));
      return true;
    } catch (error) {
      console.error('❌ Error saving admin database:', error);
      return false;
    }
  }
  
  async createDefaultDatabase() {
    console.log('📝 Creating default admin database...');
    
    // Load product data from main database
    const mainDB = JSON.parse(localStorage.getItem('pangsit_online_db_v2') || '{}');
    
    this.localDB = {
      system_info: {
        system_name: "PANGS!T Admin System",
        version: this.version,
        last_update: new Date().toISOString(),
        created_by: "Siti Rusmi",
        contact: "sitirusmi54@gmail.com",
        whatsapp: "6283195243139"
      },
      
      admin_accounts: [
        {
          id: "admin_001",
          username: "admin",
          password: "admin123", // Default password
          full_name: "Administrator",
          email: "sitirusmi54@gmail.com",
          phone: "083195243139",
          role: "super_admin",
          created_at: new Date().toISOString(),
          last_login: null,
          status: "active"
        }
      ],
      
      toko_settings: {
        nama_toko: "PANGS!T TOKO ONLINE",
        pemilik: "Siti Rusmi",
        telepon: "+62 831-9524-3139",
        email: "sitirusmi54@gmail.com",
        alamat: "Jl.panongan desa panongan kec panongan kabupaten tangerang",
        toko_id: "PANGSIT_001",
        deskripsi: "Toko pangsit terlezat dengan cita rasa autentik",
        tahun_berdiri: 2010,
        
        jam_operasional: {
          senin: { buka: "10:00", tutup: "21:00" },
          selasa: { buka: "10:00", tutup: "21:00" },
          rabu: { buka: "10:00", tutup: "21:00" },
          kamis: { buka: "10:00", tutup: "21:00" },
          jumat: { buka: "10:00", tutup: "21:00" },
          sabtu: { buka: "10:00", tutup: "21:00" },
          minggu: { buka: "10:00", tutup: "21:00" }
        },
        
        pengiriman: {
          ongkir_dasar: 15000,
          gratis_ongkir_minimum: 100000,
          estimasi_waktu: "1-2 hari kerja",
          area_pengiriman: ["Tangerang", "Jakarta", "Bekasi", "Depok"],
          kurir: ["Grab", "Gojek", "Maxim", "J&T", "SiCepat"]
        },
        
        pembayaran: {
          metode: ["QRIS", "GOPAY", "OVO", "DANA", "BCA", "Mandiri", "BNI", "BRI"],
          pajak: 10,
          biaya_admin: 0,
          minimum_pembelian: 0
        }
      },
      
      produk_database: mainDB.products || [],
      
      kategori_produk: [
        { id: 1, nama: "pedas", deskripsi: "Produk dengan level pedas berbeda", jumlah_produk: 0, status: "active" },
        { id: 2, nama: "original", deskripsi: "Rasa original tanpa pedas", jumlah_produk: 0, status: "active" },
        { id: 3, nama: "ayam isi 4", deskripsi: "Paket isi ayam 4 pcs", jumlah_produk: 0, status: "active" },
        { id: 4, nama: "udang", deskripsi: "Produk dengan isian udang", jumlah_produk: 0, status: "active" }
      ],
      
      pelanggan: [],
      
      statistik: {
        total_pendapatan: 0,
        total_order: 0,
        order_hari_ini: 0,
        pelanggan_aktif: 0,
        produk_terlaris: "",
        produk_terlaris_id: null,
        rating_avg: 0,
        konversi: 0,
        updated_at: new Date().toISOString()
      },
      
      orders: [],
      
      transactions: [],
      
      inventory: [],
      
      reports: {},
      
      activity_log: []
    };
    
    // Update product counts
    this.updateCategoryCounts();
    
    // Initialize inventory
    this.initializeInventory();
    
    this.saveToLocal();
    console.log('✅ Default admin database created');
  }
  
  // ==================== AUTHENTICATION ====================
  login(username, password) {
    const admin = this.localDB.admin_accounts.find(
      acc => acc.username === username && acc.password === password && acc.status === "active"
    );
    
    if (admin) {
      // Update last login
      admin.last_login = new Date().toISOString();
      this.saveToLocal();
      
      // Log activity
      this.logActivity('login', `Admin login: ${username}`);
      
      return {
        success: true,
        admin: {
          id: admin.id,
          username: admin.username,
          full_name: admin.full_name,
          role: admin.role,
          email: admin.email
        }
      };
    }
    
    return {
      success: false,
      message: "Username atau password salah"
    };
  }
  
  changePassword(username, oldPassword, newPassword) {
    const admin = this.localDB.admin_accounts.find(
      acc => acc.username === username && acc.password === oldPassword
    );
    
    if (admin) {
      admin.password = newPassword;
      this.saveToLocal();
      
      this.logActivity('password_change', `Password changed for: ${username}`);
      
      return { success: true, message: "Password berhasil diubah" };
    }
    
    return { success: false, message: "Password lama salah" };
  }
  
  // ==================== PRODUCT MANAGEMENT ====================
  getProducts() {
    return this.localDB.produk_database;
  }
  
  getProduct(id) {
    return this.localDB.produk_database.find(p => p.id == id);
  }
  
  addProduct(productData) {
    // Generate new ID
    const maxId = this.localDB.produk_database.reduce((max, p) => Math.max(max, p.id), 0);
    const newId = maxId + 1;
    
    const product = {
      id: newId,
      kode_produk: `P${String(newId).padStart(3, '0')}`,
      ...productData,
      created_at: new Date().toISOString(),
      terjual: 0,
      rating: 0,
      status: "active"
    };
    
    this.localDB.produk_database.push(product);
    this.updateCategoryCounts();
    this.saveToLocal();
    
    // Add to inventory
    this.addToInventory(product);
    
    this.logActivity('product_added', `Product added: ${product.nama}`);
    
    return product;
  }
  
  updateProduct(id, productData) {
    const index = this.localDB.produk_database.findIndex(p => p.id == id);
    
    if (index !== -1) {
      this.localDB.produk_database[index] = {
        ...this.localDB.produk_database[index],
        ...productData,
        updated_at: new Date().toISOString()
      };
      
      this.saveToLocal();
      
      // Update inventory if stock changed
      if (productData.stok !== undefined) {
        this.updateInventoryStock(id, productData.stok);
      }
      
      this.logActivity('product_updated', `Product updated: ${this.localDB.produk_database[index].nama}`);
      
      return { success: true, product: this.localDB.produk_database[index] };
    }
    
    return { success: false, message: "Produk tidak ditemukan" };
  }
  
  deleteProduct(id) {
    const index = this.localDB.produk_database.findIndex(p => p.id == id);
    
    if (index !== -1) {
      const productName = this.localDB.produk_database[index].nama;
      this.localDB.produk_database[index].status = "inactive";
      this.saveToLocal();
      
      this.logActivity('product_deleted', `Product marked as inactive: ${productName}`);
      
      return { success: true, message: "Produk dinonaktifkan" };
    }
    
    return { success: false, message: "Produk tidak ditemukan" };
  }
  
  updateCategoryCounts() {
    this.localDB.kategori_produk.forEach(category => {
      const count = this.localDB.produk_database.filter(
        p => p.kategori === category.nama && p.status === "active"
      ).length;
      category.jumlah_produk = count;
    });
    
    this.saveToLocal();
  }
  
  // ==================== ORDER MANAGEMENT ====================
  getOrders(filter = 'all') {
    let orders = this.localDB.orders || [];
    
    // Get live orders from localStorage
    const liveOrders = JSON.parse(localStorage.getItem('pangsit_live_orders') || '[]');
    
    // Merge with database orders
    if (liveOrders.length > 0) {
      orders = [...orders, ...liveOrders.map(this.formatLiveOrder)];
    }
    
    // Sort by timestamp (newest first)
    orders.sort((a, b) => new Date(b.timestamp || b.created) - new Date(a.timestamp || a.created));
    
    // Apply filter
    if (filter === 'new') {
      orders = orders.filter(o => o.status === 'new' || o.status === 'BARU');
    } else if (filter === 'process') {
      orders = orders.filter(o => o.status === 'processing' || o.status === 'PROSES');
    } else if (filter === 'done') {
      orders = orders.filter(o => o.status === 'completed' || o.status === 'SELESAI');
    } else if (filter === 'cancel') {
      orders = orders.filter(o => o.status === 'cancelled' || o.status === 'BATAL');
    }
    
    return orders;
  }
  
  formatLiveOrder(liveOrder) {
    return {
      order_id: liveOrder.order_id,
      customer_name: liveOrder.customer_name,
      customer_phone: liveOrder.customer_phone,
      items: liveOrder.items,
      total: liveOrder.total,
      status: liveOrder.status,
      timestamp: liveOrder.timestamp,
      date: liveOrder.date,
      time: liveOrder.time,
      payment_method: liveOrder.payment_method || 'Unknown'
    };
  }
  
  updateOrderStatus(orderId, newStatus) {
    // Update in live orders
    let liveOrders = JSON.parse(localStorage.getItem('pangsit_live_orders') || '[]');
    const orderIndex = liveOrders.findIndex(o => o.order_id === orderId);
    
    if (orderIndex !== -1) {
      liveOrders[orderIndex].status = newStatus;
      liveOrders[orderIndex].updated_at = Date.now();
      localStorage.setItem('pangsit_live_orders', JSON.stringify(liveOrders));
      
      this.logActivity('order_status_updated', `Order ${orderId} status: ${newStatus}`);
      
      return { success: true, order: liveOrders[orderIndex] };
    }
    
    // Update in database orders
    const dbOrderIndex = (this.localDB.orders || []).findIndex(o => o.order_id === orderId);
    if (dbOrderIndex !== -1) {
      this.localDB.orders[dbOrderIndex].status = newStatus;
      this.saveToLocal();
      
      return { success: true, order: this.localDB.orders[dbOrderIndex] };
    }
    
    return { success: false, message: "Order tidak ditemukan" };
  }
  
  // ==================== INVENTORY MANAGEMENT ====================
  initializeInventory() {
    this.localDB.inventory = this.localDB.produk_database.map(product => ({
      product_id: product.id,
      product_name: product.nama,
      current_stock: product.stok || 0,
      minimum_stock: 10,
      reorder_point: 15,
      unit: "pcs",
      last_restock: new Date().toISOString(),
      restock_quantity: 50,
      supplier: "Supplier Utama",
      lead_time: "2 hari",
      status: product.stok > 15 ? "in_stock" : product.stok > 5 ? "low_stock" : "out_of_stock",
      location: "Rak Utama"
    }));
    
    this.saveToLocal();
  }
  
  addToInventory(product) {
    this.localDB.inventory.push({
      product_id: product.id,
      product_name: product.nama,
      current_stock: product.stok || 0,
      minimum_stock: 10,
      reorder_point: 15,
      unit: "pcs",
      last_restock: new Date().toISOString(),
      restock_quantity: 50,
      supplier: "Supplier Utama",
      lead_time: "2 hari",
      status: "in_stock",
      location: "Rak Utama"
    });
    
    this.saveToLocal();
  }
  
  updateInventoryStock(productId, newStock) {
    const item = this.localDB.inventory.find(i => i.product_id == productId);
    if (item) {
      item.current_stock = newStock;
      
      // Update status
      if (newStock > item.reorder_point) {
        item.status = "in_stock";
      } else if (newStock > item.minimum_stock) {
        item.status = "low_stock";
      } else {
        item.status = "out_of_stock";
      }
      
      this.saveToLocal();
      return true;
    }
    return false;
  }
  
  getInventoryAlerts() {
    return this.localDB.inventory.filter(item => 
      item.status === "low_stock" || item.status === "out_of_stock"
    );
  }
  
  // ==================== STATISTICS ====================
  updateStatistics() {
    // Calculate from live orders
    const liveOrders = JSON.parse(localStorage.getItem('pangsit_live_orders') || '[]');
    const today = new Date().toDateString();
    
    const todayOrders = liveOrders.filter(o => 
      new Date(o.timestamp).toDateString() === today
    );
    
    const completedOrders = liveOrders.filter(o => 
      o.status === 'SELESAI' || o.status === 'completed'
    );
    
    // Calculate best selling product
    const productSales = {};
    liveOrders.forEach(order => {
      // Simple parsing of items string
      if (order.items) {
        const items = order.items.split(', ');
        items.forEach(item => {
          const [productName] = item.split(' x');
          productSales[productName] = (productSales[productName] || 0) + 1;
        });
      }
    });
    
    let bestSeller = "";
    let bestSellerId = null;
    let maxSales = 0;
    
    Object.entries(productSales).forEach(([productName, sales]) => {
      if (sales > maxSales) {
        maxSales = sales;
        bestSeller = productName;
        
        // Find product ID
        const product = this.localDB.produk_database.find(p => 
          p.nama.toLowerCase() === productName.toLowerCase()
        );
        bestSellerId = product ? product.id : null;
      }
    });
    
    // Calculate total revenue
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    // Update statistics
    this.localDB.statistik = {
      total_pendapatan: totalRevenue,
      total_order: liveOrders.length,
      order_hari_ini: todayOrders.length,
      pelanggan_aktif: this.localDB.pelanggan.length,
      produk_terlaris: bestSeller,
      produk_terlaris_id: bestSellerId,
      rating_avg: 4.7, // Hardcoded for now
      konversi: 15.5, // Hardcoded for now
      updated_at: new Date().toISOString()
    };
    
    this.saveToLocal();
    
    return this.localDB.statistik;
  }
  
  getDashboardStats() {
    const stats = this.updateStatistics();
    const alerts = this.getInventoryAlerts();
    const recentOrders = this.getOrders().slice(0, 5);
    
    return {
      stats,
      alerts_count: alerts.length,
      recent_orders: recentOrders,
      low_stock_items: alerts
    };
  }
  
  // ==================== CUSTOMER MANAGEMENT ====================
  getCustomers() {
    return this.localDB.pelanggan;
  }
  
  addCustomer(customerData) {
    const customerId = `CUST${String(this.localDB.pelanggan.length + 1).padStart(3, '0')}`;
    
    const customer = {
      id: customerId,
      ...customerData,
      tanggal_daftar: new Date().toISOString(),
      total_order: 0,
      total_belanja: 0,
      status: "active",
      catatan: ""
    };
    
    this.localDB.pelanggan.push(customer);
    this.saveToLocal();
    
    this.logActivity('customer_added', `Customer added: ${customerData.nama}`);
    
    return customer;
  }
  
  // ==================== ACTIVITY LOG ====================
  logActivity(type, description, user = "system") {
    const log = {
      id: `ACT${String((this.localDB.activity_log || []).length + 1).padStart(3, '0')}`,
      type,
      description,
      user,
      timestamp: new Date().toISOString()
    };
    
    this.localDB.activity_log = this.localDB.activity_log || [];
    this.localDB.activity_log.unshift(log);
    
    // Keep only last 100 logs
    if (this.localDB.activity_log.length > 100) {
      this.localDB.activity_log = this.localDB.activity_log.slice(0, 100);
    }
    
    this.saveToLocal();
    
    return log;
  }
  
  getActivityLog(limit = 20) {
    return (this.localDB.activity_log || []).slice(0, limit);
  }
  
  // ==================== SETTINGS ====================
  updateSettings(settings) {
    this.localDB.toko_settings = {
      ...this.localDB.toko_settings,
      ...settings
    };
    
    this.saveToLocal();
    
    this.logActivity('settings_updated', "Toko settings diperbarui");
    
    return { success: true, settings: this.localDB.toko_settings };
  }
  
  getSettings() {
    return this.localDB.toko_settings;
  }
  
  // ==================== BACKUP & EXPORT ====================
  exportDatabase() {
    const dataStr = JSON.stringify(this.localDB, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportName = `pangsit-admin-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', exportName);
    link.click();
    
    this.logActivity('database_exported', `Database exported: ${exportName}`);
    
    return exportName;
  }
  
  importDatabase(jsonData) {
    try {
      const imported = JSON.parse(jsonData);
      
      // Validate structure
      if (imported.system_info && imported.produk_database) {
        this.localDB = imported;
        this.saveToLocal();
        
        this.logActivity('database_imported', "Database imported successfully");
        
        return { success: true, message: "Database berhasil diimpor" };
      } else {
        return { success: false, message: "Format database tidak valid" };
      }
    } catch (error) {
      console.error('❌ Error importing database:', error);
      return { success: false, message: "Error parsing JSON data" };
    }
  }
  
  resetDatabase() {
    if (confirm('⚠️ PERINGATAN: Semua data akan dihapus! Yakin ingin reset database?')) {
      localStorage.removeItem(this.dbName);
      this.init();
      
      this.logActivity('database_reset', "Database direset ke default");
      
      return { success: true, message: "Database berhasil direset" };
    }
    
    return { success: false, message: "Reset dibatalkan" };
  }
  
  // ==================== UTILITIES ====================
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }
  
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Create global instance
const adminDB = new AdminDatabase();
window.adminDB = adminDB;

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminDatabase;
}