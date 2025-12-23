// ==================== SISTEM TOKO ONLINE PANGS!T ====================

// Key untuk localStorage (SAMA dengan halaman admin)
const STORAGE_KEY = 'pangsit_orders_master';

// Status yang tersedia
const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

const PAYMENT_STATUS = {
    PENDING: 'menunggu',
    PROCESSING: 'diproses',
    PAID: 'lunas',
    CANCELLED: 'dibatalkan'
};

// Data Produk
const products = [
    {
        id: 1,
        name: "Fire Silk Wonton",
        price: 20000,
        image: "foto/fire silk wonton.jpg",
        description: "Kesan: lembut, pedas aromatik, classy dengan minyak cabai khas Asia.",
        details: "Pangsit dengan tekstur lembut seperti sutra, dibalut dengan minyak cabai pilihan yang memberikan sensasi pedas yang aromatik dan menggugah selera. Cocok untuk pecinta makanan pedas yang ingin pengalaman berbeda.",
        category: "Pedas",
        stock: 50,
        preparation: "10-15 menit",
        rating: 4.8
    },
    {
        id: 2,
        name: "Crispy Melt Deluxe",
        price: 13000,
        image: "foto/crispy melt deluxe.jpg",
        description: "Kesan: garing di luar, lembut & creamy di dalam.",
        details: "Pangsit dengan kulit luar yang super renyah dan garing, namun saat digigit akan meleleh di mulut dengan isian yang creamy dan lembut. Kombinasi tekstur yang sempurna.",
        category: "Original",
        stock: 40,
        preparation: "8-12 menit",
        rating: 4.7
    },
    {
        id: 3,
        name: "Golden Chili Crunch",
        price: 15000,
        image: "foto/Golden chili crunch.jpg",
        description: "Kesan: renyah, gurih dengan sentuhan manis-pedas saus khas.",
        details: "Pangsit goreng dengan topping chili crunch yang renyah, memberikan kombinasi rasa gurih, manis, dan pedas yang seimbang. Sempurna sebagai camilan atau lauk.",
        category: "Pedas",
        stock: 35,
        preparation: "10-15 menit",
        rating: 4.6
    },
    {
        id: 4,
        name: "Bila Bila Ayam Pangsit",
        price: 10000,
        image: "foto/bils bila ayam pangsit.jpg",
        description: "Isi ayam lembut dengan bumbu bawang, merica, dan sedikit sayuran.",
        details: "Pangsit dengan isian ayam cincang pilihan yang dibumbui dengan bawang, merica, dan campuran sayuran segar. Rasa gurih klasik yang selalu dinantikan.",
        category: "Ayam",
        stock: 60,
        preparation: "5-8 menit",
        rating: 4.5
    },
    {
        id: 5,
        name: "Pangsit Kuah Mercon",
        price: 20000,
        image: "foto/pangsit kuah mercon.jpg",
        description: "Cocok untuk pangsit kuah. Menggunakan cabai rawit, sambal mercon, dan bumbu pedas gurih.",
        details: "Pangsit kuah dengan level pedas mercon yang menggugah selera. Kuah kaldu yang gurih dipadukan dengan sambal mercon dan cabai rawit segar.",
        category: "Pedas Kuah",
        stock: 30,
        preparation: "12-18 menit",
        rating: 4.9
    },
    {
        id: 6,
        name: "Pangsit Isi Tahu",
        price: 15000,
        image: "foto/pangsit isi tahu.jpg",
        description: "Pangsit goreng dengan isian tahu yang lembut dan bumbu spesial.",
        details: "Pangsit dengan isian tahu halus yang dibumbui dengan rempah-rempah khas. Cocok untuk vegetarian dan penyuka tahu.",
        category: "Vegetarian",
        stock: 45,
        preparation: "8-10 menit",
        rating: 4.4
    }
];

// Data Keranjang
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Data Pesanan Customer
let customerOrders = JSON.parse(localStorage.getItem('customerOrders')) || [];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const subtotalElement = document.getElementById('subtotal');
const shippingElement = document.getElementById('shipping');
const taxElement = document.getElementById('tax');
const totalElement = document.getElementById('total');
const checkoutBtn = document.getElementById('checkoutBtn');
const productModal = document.getElementById('productModal');
const modalProductContent = document.getElementById('modalProductContent');
const closeModal = document.getElementById('closeModal');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutModal = document.getElementById('closeCheckoutModal');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
const contactForm = document.getElementById('contactForm');
const customerOrdersContainer = document.getElementById('customerOrders');

// ==================== FUNGSI UTAMA ====================

// Format Rupiah
function formatRupiah(amount) {
    if (isNaN(amount)) amount = 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Generate Order ID
function generateOrderId() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `PANG${year}${month}${day}${random}`;
}

// Tampilkan Notifikasi
function showNotification(message, type = 'success') {
    // Hapus notifikasi sebelumnya
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Buat notifikasi baru
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                           type === 'error' ? 'exclamation-circle' : 
                           type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Hapus setelah 3 detik
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// ==================== SISTEM PRODUK ====================

// Render Produk
function renderProducts() {
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='https://via.placeholder.com/300x220/ff6b35/ffffff?text=PANGS!T'">
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${formatRupiah(product.price)}</div>
                <p class="product-desc">${product.description}</p>
                <div class="product-actions">
                    <button class="btn btn-detail" data-id="${product.id}">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                    <button class="btn-add-cart" data-id="${product.id}" title="Tambahkan ke keranjang">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // Event listeners untuk tombol detail
    document.querySelectorAll('.btn-detail').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            showProductDetail(productId);
        });
    });
    
    // Event listeners untuk tombol tambah ke keranjang
    document.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}

// Tampilkan Detail Produk di Modal
function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    modalProductContent.innerHTML = `
        <div>
            <img src="${product.image}" alt="${product.name}" class="modal-product-img" onerror="this.src='https://via.placeholder.com/500x400/ff6b35/ffffff?text=PANGS!T'">
        </div>
        <div class="modal-product-info">
            <h2>${product.name}</h2>
            <div class="modal-product-price">${formatRupiah(product.price)}</div>
            <p class="modal-product-desc">${product.details}</p>
            
            <div class="modal-product-details">
                <div class="detail-item">
                    <span class="detail-label">Kategori:</span>
                    <span class="detail-value">${product.category}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Stok:</span>
                    <span class="detail-value">${product.stok > 0 ? 'Tersedia (' + product.stok + ')' : 'Habis'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Waktu Persiapan:</span>
                    <span class="detail-value">${product.preparation}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Rating:</span>
                    <span class="detail-value">⭐ ${product.rating}/5.0</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 30px;">
                <button class="btn btn-block" id="directCheckout" data-id="${product.id}" style="flex: 2;">
                    <i class="fas fa-bolt"></i> Pesan Sekarang
                </button>
                <button class="btn-add-cart" data-id="${product.id}" style="flex: 1;">
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </div>
        </div>
    `;
    
    productModal.classList.add('active');
    
    // Event listener untuk checkout langsung
    document.getElementById('directCheckout')?.addEventListener('click', function() {
        const productId = parseInt(this.getAttribute('data-id'));
        directCheckout(productId);
    });
    
    // Event listener untuk tombol tambah ke keranjang di modal
    document.querySelector('.modal-product-info .btn-add-cart')?.addEventListener('click', function() {
        const productId = parseInt(this.getAttribute('data-id'));
        addToCart(productId);
        productModal.classList.remove('active');
    });
}

// ==================== SISTEM KERANJANG ====================

// Tambah ke Keranjang
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`${product.name} berhasil ditambahkan ke keranjang!`);
}

// Update Keranjang
function updateCart() {
    // Simpan ke localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update jumlah di ikon keranjang
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Render item keranjang
    renderCartItems();
    
    // Update ringkasan belanja
    updateCartSummary();
}

// Render Item Keranjang
function renderCartItems() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <h3>Keranjang Belanja Kosong</h3>
                <p style="color: var(--gray); margin: 15px 0 25px;">Tambahkan produk ke keranjang untuk melanjutkan</p>
                <a href="#produk" class="btn">
                    <i class="fas fa-shopping-bag"></i> Mulai Belanja
                </a>
            </div>
        `;
        return;
    }
    
    const cartHeader = document.createElement('div');
    cartHeader.className = 'cart-header';
    cartHeader.innerHTML = `
        <h3 style="color: var(--secondary);">Items dalam Keranjang (${cart.reduce((total, item) => total + item.quantity, 0)})</h3>
        <button class="btn btn-outline btn-small" id="clearCartBtn">
            <i class="fas fa-trash"></i> Kosongkan
        </button>
    `;
    cartItemsContainer.appendChild(cartHeader);
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://via.placeholder.com/100x100/ff6b35/ffffff?text=PANGS!T'">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <div class="cart-item-price">${formatRupiah(item.price)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
                    <span class="quantity-number">${item.quantity}</span>
                    <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}" title="Hapus dari keranjang">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Event listeners untuk kuantitas
    document.querySelectorAll('.decrease-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            updateQuantity(productId, -1);
        });
    });
    
    document.querySelectorAll('.increase-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            updateQuantity(productId, 1);
        });
    });
    
    // Event listeners untuk tombol hapus
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromCart(productId);
        });
    });
    
    // Event listener untuk kosongkan keranjang
    document.getElementById('clearCartBtn')?.addEventListener('click', clearCart);
}

// Update Kuantitas Item
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    }
    
    updateCart();
}

// Hapus dari Keranjang
function removeFromCart(productId) {
    const item = cart.find(item => item.id === productId);
    if (item && confirm(`Hapus ${item.name} dari keranjang?`)) {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
        showNotification('Produk dihapus dari keranjang', 'warning');
    }
}

// Kosongkan Keranjang
function clearCart() {
    if (cart.length > 0 && confirm('Kosongkan semua item di keranjang?')) {
        cart = [];
        updateCart();
        showNotification('Keranjang berhasil dikosongkan', 'warning');
    }
}

// Update Ringkasan Belanja
function updateCartSummary() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = 15000;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;
    
    subtotalElement.textContent = formatRupiah(subtotal);
    shippingElement.textContent = formatRupiah(shipping);
    taxElement.textContent = formatRupiah(tax);
    totalElement.textContent = formatRupiah(total);
    
    // Disable/enable checkout button
    checkoutBtn.disabled = cart.length === 0;
    checkoutBtn.style.opacity = cart.length === 0 ? '0.6' : '1';
    checkoutBtn.style.cursor = cart.length === 0 ? 'not-allowed' : 'pointer';
}

// ==================== SISTEM CHECKOUT ====================

// Checkout Langsung dari Detail Produk
function directCheckout(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const tempCart = [{
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
    }];
    
    showCheckoutModal(tempCart);
}

// Tampilkan Modal Checkout
function showCheckoutModal(checkoutItems) {
    // Reset form checkout
    document.getElementById('checkoutForm').reset();
    
    // Reset step checkout
    document.getElementById('step1').classList.add('active');
    document.getElementById('step1').classList.remove('completed');
    document.getElementById('step2').classList.remove('active', 'completed');
    document.getElementById('step3').classList.remove('active', 'completed');
    
    // Tampilkan step 1
    document.getElementById('step1Form').style.display = 'block';
    document.getElementById('step2Form').style.display = 'none';
    document.getElementById('step3Form').style.display = 'none';
    document.getElementById('invoiceContainer').style.display = 'none';
    
    // Reset pilihan pembayaran
    document.querySelectorAll('.payment-method').forEach(method => {
        method.classList.remove('selected');
    });
    
    // Pilih metode pertama secara default
    const firstMethod = document.querySelector('.payment-method');
    if (firstMethod) firstMethod.classList.add('selected');
    
    // Simpan items checkout
    checkoutModal.dataset.checkoutItems = JSON.stringify(checkoutItems);
    
    // Hitung total
    const subtotal = checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = 15000;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;
    
    // Update ringkasan pesanan
    const orderSummary = document.getElementById('checkoutOrderSummary');
    orderSummary.innerHTML = '';
    
    checkoutItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>${formatRupiah(item.price * item.quantity)}</span>
        `;
        orderSummary.appendChild(itemElement);
    });
    
    // Tambahkan subtotal, pengiriman, pajak, dan total
    const subtotalElement = document.createElement('div');
    subtotalElement.className = 'order-item';
    subtotalElement.innerHTML = `<span>Subtotal</span><span>${formatRupiah(subtotal)}</span>`;
    orderSummary.appendChild(subtotalElement);
    
    const shippingElement = document.createElement('div');
    shippingElement.className = 'order-item';
    shippingElement.innerHTML = `<span>Pengiriman</span><span>${formatRupiah(shipping)}</span>`;
    orderSummary.appendChild(shippingElement);
    
    const taxElement = document.createElement('div');
    taxElement.className = 'order-item';
    taxElement.innerHTML = `<span>Pajak (10%)</span><span>${formatRupiah(tax)}</span>`;
    orderSummary.appendChild(taxElement);
    
    const totalElement = document.createElement('div');
    totalElement.className = 'order-item';
    totalElement.style.fontWeight = 'bold';
    totalElement.style.marginTop = '10px';
    totalElement.style.paddingTop = '10px';
    totalElement.style.borderTop = '2px solid var(--primary)';
    totalElement.innerHTML = `<span>Total</span><span>${formatRupiah(total)}</span>`;
    orderSummary.appendChild(totalElement);
    
    // Tampilkan modal
    checkoutModal.classList.add('active');
}

// ==================== SISTEM PEMESANAN ====================

// Simpan Pesanan ke Sistem Terpusat
function saveOrderToMaster(orderData) {
    try {
        // Ambil semua pesanan dari sistem terpusat
        let allOrders = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        // Tambahkan pesanan baru
        allOrders.unshift(orderData);
        
        // Simpan kembali ke localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allOrders));
        
        // Simpan juga ke customerOrders untuk tampilan di halaman ini
        saveCustomerOrder(orderData);
        
        console.log('✅ Pesanan disimpan ke sistem terpusat:', orderData.id);
        return orderData;
        
    } catch (error) {
        console.error('❌ Error menyimpan pesanan:', error);
        return null;
    }
}

// Simpan Pesanan untuk Customer
function saveCustomerOrder(orderData) {
    // Cek apakah pesanan sudah ada
    const existingIndex = customerOrders.findIndex(o => o.id === orderData.id);
    
    if (existingIndex >= 0) {
        // Update pesanan yang sudah ada
        customerOrders[existingIndex] = orderData;
    } else {
        // Tambah pesanan baru di awal array
        customerOrders.unshift(orderData);
    }
    
    // Simpan maksimal 50 pesanan terakhir
    if (customerOrders.length > 50) {
        customerOrders = customerOrders.slice(0, 50);
    }
    
    localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
    renderCustomerOrders();
    
    return orderData;
}

// Buat Pesanan dari Checkout
function createOrderFromCheckout() {
    try {
        // Ambil data dari form checkout
        const checkoutItems = JSON.parse(checkoutModal.dataset.checkoutItems || '[]');
        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const email = document.getElementById('emailOrder').value;
        const notes = document.getElementById('notes').value;
        
        // Ambil metode pembayaran yang dipilih
        const selectedPayment = document.querySelector('.payment-method.selected');
        const paymentMethod = selectedPayment ? selectedPayment.getAttribute('data-method') : 'qris';
        
        // Hitung total
        const subtotal = checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = 15000;
        const tax = subtotal * 0.1;
        const total = subtotal + shipping + tax;
        
        // Generate order ID
        const orderId = generateOrderId();
        const now = new Date();
        
        // Buat objek pesanan
        const orderData = {
            id: orderId,
            customer: {
                name: fullName,
                phone: phone,
                email: email,
                address: address
            },
            products: checkoutItems.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            paymentMethod: paymentMethod,
            status: ORDER_STATUS.PENDING,
            paymentStatus: PAYMENT_STATUS.PENDING,
            date: now.toLocaleDateString('id-ID'),
            time: now.toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            timestamp: now.getTime(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            notes: notes || '',
            shipping: shipping,
            tax: tax,
            subtotal: subtotal,
            total: total
        };
        
        // Simpan pesanan
        const savedOrder = saveOrderToMaster(orderData);
        
        if (savedOrder) {
            console.log('✅ Pesanan berhasil dibuat:', savedOrder.id);
            
            // Reset cart jika checkout dari cart
            const isFromCart = JSON.stringify(checkoutItems) === JSON.stringify(cart);
            if (isFromCart) {
                cart = [];
                updateCart();
            }
            
            return savedOrder;
        }
        
        return null;
        
    } catch (error) {
        console.error('❌ Error membuat pesanan:', error);
        return null;
    }
}

// ==================== SISTEM STATUS PESANAN ====================

// Render Pesanan Customer
function renderCustomerOrders() {
    customerOrdersContainer.innerHTML = '';
    
    // Ambil filter status aktif
    const activeTab = document.querySelector('.order-tab.active');
    const filterStatus = activeTab ? activeTab.getAttribute('data-status') : 'all';
    
    // Filter pesanan berdasarkan status
    let filteredOrders = customerOrders;
    if (filterStatus !== 'all') {
        filteredOrders = customerOrders.filter(order => {
            if (filterStatus === 'pending') {
                return order.status === ORDER_STATUS.PENDING || order.paymentStatus === PAYMENT_STATUS.PENDING;
            }
            return order.status === filterStatus;
        });
    }
    
    if (filteredOrders.length === 0) {
        customerOrdersContainer.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-inbox"></i>
                <h3>Belum Ada Pesanan</h3>
                <p style="color: var(--gray); margin: 15px 0 25px;">
                    ${filterStatus === 'all' ? 
                      'Pesanan yang Anda buat akan muncul di sini' : 
                      `Tidak ada pesanan dengan status ${filterStatus}`}
                </p>
                ${filterStatus !== 'all' ? `
                    <button class="btn" onclick="document.querySelector('[data-status="all"]').click()">
                        <i class="fas fa-list"></i> Lihat Semua Pesanan
                    </button>
                ` : `
                    <a href="#produk" class="btn">
                        <i class="fas fa-shopping-bag"></i> Mulai Belanja
                    </a>
                `}
            </div>
        `;
        return;
    }
    
    filteredOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        // Tentukan status badge
        let statusClass = 'status-pending';
        let statusText = 'Menunggu';
        
        if (order.status === ORDER_STATUS.PROCESSING) {
            statusClass = 'status-processing';
            statusText = 'Diproses';
        } else if (order.status === ORDER_STATUS.SHIPPED) {
            statusClass = 'status-shipped';
            statusText = 'Dikirim';
        } else if (order.status === ORDER_STATUS.DELIVERED) {
            statusClass = 'status-delivered';
            statusText = 'Selesai';
        } else if (order.status === ORDER_STATUS.CANCELLED) {
            statusClass = 'status-cancelled';
            statusText = 'Dibatalkan';
        }
        
        // Tentukan payment status badge
        let paymentClass = 'payment-pending';
        let paymentText = 'Menunggu';
        
        if (order.paymentStatus === PAYMENT_STATUS.PAID) {
            paymentClass = 'payment-paid';
            paymentText = 'Lunas';
        } else if (order.paymentStatus === PAYMENT_STATUS.CANCELLED) {
            paymentClass = 'payment-cancelled';
            paymentText = 'Batal';
        }
        
        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-id">${order.id}</div>
                    <div class="order-date">${order.date} - ${order.time}</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-end;">
                    <span class="order-status-badge ${statusClass}">
                        <i class="fas fa-${order.status === 'processing' ? 'cogs' : 
                                           order.status === 'shipped' ? 'shipping-fast' : 
                                           order.status === 'delivered' ? 'check-circle' : 
                                           order.status === 'cancelled' ? 'times-circle' : 'clock'}"></i>
                        ${statusText}
                    </span>
                    <span class="payment-status-badge ${paymentClass}">
                        <i class="fas fa-${order.paymentStatus === 'lunas' ? 'check' : 
                                           order.paymentStatus === 'dibatalkan' ? 'times' : 'clock'}"></i>
                        ${paymentText}
                    </span>
                </div>
            </div>
            
            <div class="order-details">
                <div class="order-items">
                    <strong>Items:</strong>
                    ${order.products ? order.products.map(product => `
                        <div class="order-item">
                            <span>${product.name} x${product.quantity}</span>
                            <span>${formatRupiah(product.price * product.quantity)}</span>
                        </div>
                    `).join('') : ''}
                </div>
                <div class="order-total">
                    <div>Total Pembayaran:</div>
                    <div class="order-total-amount">${formatRupiah(order.total)}</div>
                    <div style="font-size: 14px; color: var(--gray); margin-top: 5px;">
                        <i class="fas fa-credit-card"></i> ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'QRIS'}
                    </div>
                </div>
            </div>
            
            <div class="order-actions">
                <button class="btn btn-small" onclick="viewOrderDetail('${order.id}')">
                    <i class="fas fa-eye"></i> Detail
                </button>
                <button class="btn btn-outline btn-small" onclick="showPaymentConfirmation('${order.id}')">
                    <i class="fas fa-qrcode"></i> Bayar
                </button>
                <button class="btn btn-outline btn-small" onclick="printInvoice('${order.id}')">
                    <i class="fas fa-print"></i> Invoice
                </button>
            </div>
        `;
        
        customerOrdersContainer.appendChild(orderCard);
    });
}

// Lihat Detail Pesanan
function viewOrderDetail(orderId) {
    const order = customerOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('orderDetailModal');
    const content = document.getElementById('orderDetailContent');
    
    let statusClass = 'status-pending';
    let statusText = 'Menunggu';
    
    if (order.status === ORDER_STATUS.PROCESSING) {
        statusClass = 'status-processing';
        statusText = 'Diproses';
    } else if (order.status === ORDER_STATUS.SHIPPED) {
        statusClass = 'status-shipped';
        statusText = 'Dikirim';
    } else if (order.status === ORDER_STATUS.DELIVERED) {
        statusClass = 'status-delivered';
        statusText = 'Selesai';
    } else if (order.status === ORDER_STATUS.CANCELLED) {
        statusClass = 'status-cancelled';
        statusText = 'Dibatalkan';
    }
    
    let paymentClass = 'payment-pending';
    let paymentText = 'Menunggu';
    
    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
        paymentClass = 'payment-paid';
        paymentText = 'Lunas';
    } else if (order.paymentStatus === PAYMENT_STATUS.CANCELLED) {
        paymentClass = 'payment-cancelled';
        paymentText = 'Batal';
    }
    
    content.innerHTML = `
        <h2 style="color: var(--secondary); margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
            <span>Detail Pesanan</span>
            <span style="font-size: 18px; color: var(--gray);">${order.id}</span>
        </h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; margin-bottom: 30px;">
            <div>
                <h4 style="color: var(--secondary); margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid var(--light-gray);">
                    <i class="fas fa-user"></i> Informasi Pelanggan
                </h4>
                <p><strong>Nama:</strong> ${order.customer?.name || 'N/A'}</p>
                <p><strong>Telepon:</strong> ${order.customer?.phone || 'N/A'}</p>
                <p><strong>Email:</strong> ${order.customer?.email || 'N/A'}</p>
                <p><strong>Alamat:</strong> ${order.customer?.address || 'N/A'}</p>
            </div>
            <div>
                <h4 style="color: var(--secondary); margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid var(--light-gray);">
                    <i class="fas fa-info-circle"></i> Status Pesanan
                </h4>
                <p style="margin-bottom: 10px;">
                    <strong>Status:</strong> 
                    <span class="order-status-badge ${statusClass}" style="margin-left: 10px;">${statusText}</span>
                </p>
                <p style="margin-bottom: 10px;">
                    <strong>Pembayaran:</strong> 
                    <span class="payment-status-badge ${paymentClass}" style="margin-left: 10px;">${paymentText}</span>
                </p>
                <p><strong>Tanggal:</strong> ${order.date}</p>
                <p><strong>Waktu:</strong> ${order.time}</p>
                <p><strong>Metode Bayar:</strong> ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'QRIS'}</p>
            </div>
        </div>
        
        <h4 style="color: var(--secondary); margin-bottom: 15px;">
            <i class="fas fa-box"></i> Items Pesanan
        </h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <thead>
                <tr style="background-color: var(--light);">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--light-gray);">Produk</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--light-gray);">Qty</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid var(--light-gray);">Harga</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid var(--light-gray);">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${order.products ? order.products.map(product => `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid var(--light-gray);">${product.name}</td>
                        <td style="padding: 12px; border-bottom: 1px solid var(--light-gray); text-align: center;">${product.quantity}</td>
                        <td style="padding: 12px; border-bottom: 1px solid var(--light-gray); text-align: right;">${formatRupiah(product.price)}</td>
                        <td style="padding: 12px; border-bottom: 1px solid var(--light-gray); text-align: right;">${formatRupiah(product.price * product.quantity)}</td>
                    </tr>
                `).join('') : ''}
            </tbody>
        </table>
        
        <div style="float: right; width: 300px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Subtotal:</span>
                <span>${formatRupiah(order.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Pengiriman:</span>
                <span>${formatRupiah(order.shipping)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Pajak (10%):</span>
                <span>${formatRupiah(order.tax)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 20px; border-top: 2px solid var(--primary); padding-top: 10px; margin-top: 10px;">
                <span>Total:</span>
                <span style="color: var(--primary);">${formatRupiah(order.total)}</span>
            </div>
        </div>
        <div style="clear: both;"></div>
        
        ${order.notes ? `
            <div style="margin-top: 30px; padding: 20px; background-color: var(--light); border-radius: var(--border-radius);">
                <h4 style="color: var(--secondary); margin-bottom: 10px;">
                    <i class="fas fa-sticky-note"></i> Catatan untuk Penjual
                </h4>
                <p>${order.notes}</p>
            </div>
        ` : ''}
        
        <div style="margin-top: 30px; display: flex; gap: 10px; justify-content: center;">
            <button class="btn" onclick="printInvoice('${order.id}')">
                <i class="fas fa-print"></i> Cetak Invoice
            </button>
            <button class="btn btn-outline" onclick="closeOrderModal()">
                <i class="fas fa-times"></i> Tutup
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

// Tampilkan Konfirmasi Pembayaran
function showPaymentConfirmation(orderId) {
    const order = customerOrders.find(o => o.id === orderId);
    if (!order) return;
    
    // Buat modal pembayaran
    const modalHTML = `
        <div class="modal" id="paymentConfirmationModal" style="display: flex;">
            <div class="modal-content" style="max-width: 500px;">
                <button class="close-modal" onclick="closePaymentModal()">&times;</button>
                <div style="padding: 30px;">
                    <h2 style="color: var(--secondary); margin-bottom: 20px; text-align: center;">
                        <i class="fas fa-qrcode"></i> Pembayaran
                    </h2>
                    
                    <div style="text-align: center; margin-bottom: 25px;">
                        <div style="font-size: 18px; font-weight: bold; color: var(--primary);">
                            Total: ${formatRupiah(order.total)}
                        </div>
                        <div style="font-size: 14px; color: var(--gray); margin-top: 5px;">
                            Order ID: ${order.id}
                        </div>
                    </div>
                    
                    <!-- QRIS Section -->
                    <div class="qris-container">
                        <div class="qris-title">
                            <i class="fas fa-qrcode"></i> QRIS Payment
                        </div>
                        <div class="qris-subtitle">
                            Scan QR Code untuk pembayaran
                        </div>
                        
                        <div class="qris-code">
                            <canvas id="qrcodeCanvas"></canvas>
                        </div>
                        
                        <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                            <div style="font-weight: 600; color: var(--secondary); margin-bottom: 5px;">
                                Total Pembayaran:
                            </div>
                            <div style="font-size: 24px; color: var(--primary); font-weight: 700;">
                                ${formatRupiah(order.total)}
                            </div>
                        </div>
                        
                        <div class="qris-instruction">
                            <p><strong>Cara Pembayaran:</strong></p>
                            <ol class="qris-steps">
                                <li>Buka aplikasi e-wallet atau mobile banking</li>
                                <li>Pilih fitur "Scan QR"</li>
                                <li>Arahkan kamera ke QR Code di atas</li>
                                <li>Periksa jumlah pembayaran</li>
                                <li>Konfirmasi pembayaran</li>
                                <li>Screenshot bukti pembayaran</li>
                            </ol>
                        </div>
                    </div>
                    
                    <!-- Status Pembayaran -->
                    <div style="margin-top: 25px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <h4 style="color: var(--secondary); margin-bottom: 10px;">
                            <i class="fas fa-info-circle"></i> Status Pembayaran
                        </h4>
                        <div id="paymentStatusDisplay" style="
                            padding: 10px;
                            border-radius: 5px;
                            text-align: center;
                            font-weight: bold;
                            margin-bottom: 10px;
                            background: ${order.paymentStatus === 'lunas' ? '#d4edda' : 
                                         order.paymentStatus === 'diproses' ? '#d1ecf1' : 
                                         '#fff3cd'};
                            color: ${order.paymentStatus === 'lunas' ? '#155724' : 
                                    order.paymentStatus === 'diproses' ? '#0c5460' : 
                                    '#856404'};
                        ">
                            ${order.paymentStatus === 'lunas' ? 'LUNAS' : 
                              order.paymentStatus === 'diproses' ? 'DIPROSES' : 
                              'MENUNGGU PEMBAYARAN'}
                        </div>
                        
                        ${order.paymentStatus === 'menunggu' ? `
                            <div style="font-size: 14px; color: var(--gray);">
                                <i class="fas fa-clock"></i> 
                                Setelah transfer, admin akan memverifikasi pembayaran Anda.
                                Status akan berubah otomatis.
                            </div>
                        ` : ''}
                    </div>
                    
                    <div style="margin-top: 25px; display: flex; gap: 10px; justify-content: center;">
                        <button class="btn btn-outline" onclick="closePaymentModal()">
                            Tutup
                        </button>
                        <button class="btn" onclick="checkPaymentStatus('${order.id}')">
                            <i class="fas fa-sync-alt"></i> Cek Status
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Tambahkan modal ke body
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv);
    
    // Generate QR Code
    generateQRCode(order.id, order.total);
}

// Generate QR Code
function generateQRCode(orderId, amount) {
    // Data untuk QR Code
    const qrData = `PANGSIT|${orderId}|${amount}|${Date.now()}`;
    
    try {
        QRCode.toCanvas(document.getElementById('qrcodeCanvas'), qrData, {
            width: 200,
            margin: 1,
            color: {
                dark: '#2d3047',
                light: '#ffffff'
            }
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
    }
}

// Cek Status Pembayaran
function checkPaymentStatus(orderId) {
    // Refresh data dari sistem terpusat
    const allOrders = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const order = allOrders.find(o => o.id === orderId);
    
    if (order) {
        // Update customerOrders
        const customerOrderIndex = customerOrders.findIndex(o => o.id === orderId);
        if (customerOrderIndex >= 0) {
            customerOrders[customerOrderIndex] = { ...customerOrders[customerOrderIndex], ...order };
            localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
        }
        
        // Update tampilan
        const statusDisplay = document.getElementById('paymentStatusDisplay');
        if (statusDisplay) {
            statusDisplay.textContent = order.paymentStatus === 'lunas' ? 'LUNAS' : 
                                       order.paymentStatus === 'diproses' ? 'DIPROSES' : 
                                       'MENUNGGU PEMBAYARAN';
            
            statusDisplay.style.background = order.paymentStatus === 'lunas' ? '#d4edda' : 
                                             order.paymentStatus === 'diproses' ? '#d1ecf1' : 
                                             '#fff3cd';
            
            statusDisplay.style.color = order.paymentStatus === 'lunas' ? '#155724' : 
                                        order.paymentStatus === 'diproses' ? '#0c5460' : 
                                        '#856404';
        }
        
        showNotification('Status pembayaran diperbarui', 'success');
    }
}

// Cetak Invoice
function printInvoice(orderId) {
    const order = customerOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice ${order.id}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .invoice-container { max-width: 800px; margin: 0 auto; }
                .invoice-header { text-align: center; margin-bottom: 30px; }
                .invoice-logo { font-size: 28px; font-weight: bold; color: #ff6b35; }
                .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .invoice-table th, .invoice-table td { padding: 10px; border: 1px solid #ddd; }
                .invoice-table th { background-color: #f5f5f5; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <div class="invoice-header">
                    <div class="invoice-logo">PANGS!T STORE</div>
                    <p>Jl. Panongan, Tangerang | Telepon: +62 831-9524-3139</p>
                    <p>Email: sitirusmi54@gmail.com</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <h4>INVOICE</h4>
                        <p><strong>No:</strong> ${order.id}</p>
                        <p><strong>Tanggal:</strong> ${order.date}</p>
                        <p><strong>Waktu:</strong> ${order.time}</p>
                        <p><strong>Status:</strong> ${order.status === 'processing' ? 'Diproses' : 
                                                   order.status === 'shipped' ? 'Dikirim' : 
                                                   order.status === 'delivered' ? 'Selesai' : 
                                                   order.status === 'cancelled' ? 'Dibatalkan' : 'Menunggu'}</p>
                    </div>
                    <div>
                        <h4>PELANGGAN</h4>
                        <p><strong>Nama:</strong> ${order.customer?.name || 'N/A'}</p>
                        <p><strong>Telp:</strong> ${order.customer?.phone || 'N/A'}</p>
                        <p><strong>Email:</strong> ${order.customer?.email || 'N/A'}</p>
                        <p><strong>Alamat:</strong> ${order.customer?.address || 'N/A'}</p>
                    </div>
                </div>
                
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Produk</th>
                            <th>Qty</th>
                            <th>Harga</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.products ? order.products.map(product => `
                            <tr>
                                <td>${product.name}</td>
                                <td>${product.quantity}</td>
                                <td>Rp ${product.price.toLocaleString()}</td>
                                <td>Rp ${(product.price * product.quantity).toLocaleString()}</td>
                            </tr>
                        `).join('') : ''}
                    </tbody>
                </table>
                
                <div style="float: right; width: 300px; margin-top: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Subtotal:</span>
                        <span>Rp ${(order.subtotal || 0).toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Pengiriman:</span>
                        <span>Rp ${(order.shipping || 0).toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Pajak:</span>
                        <span>Rp ${(order.tax || 0).toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 20px; border-top: 2px solid #ff6b35; padding-top: 10px; margin-top: 10px;">
                        <span>TOTAL:</span>
                        <span style="color: #ff6b35;">Rp ${(order.total || 0).toLocaleString()}</span>
                    </div>
                </div>
                <div style="clear: both;"></div>
                        
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
                            <p><strong>Metode Pembayaran:</strong> ${order.paymentMethod?.toUpperCase() || 'QRIS'}</p>
                            <p><strong>Catatan:</strong> ${order.notes || 'Tidak ada catatan'}</p>
                            <p style="margin-top: 15px; font-style: italic;">Terima kasih telah berbelanja di PANGS!T Store</p>
                        </div>
                    </div>
                    
                    <div class="no-print" style="text-align: center; margin-top: 30px;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #ff6b35; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Cetak Invoice
                        </button>
                        <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                            Tutup
                        </button>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
        
        // Tutup Modal
        function closeOrderModal() {
            document.getElementById('orderDetailModal').classList.remove('active');
        }
        
        function closePaymentModal() {
            const modal = document.getElementById('paymentConfirmationModal');
            if (modal) modal.remove();
        }
        
        // ==================== INISIALISASI ====================
        
        function init() {
            // Render produk
            renderProducts();
            
            // Update keranjang
            updateCart();
            
            // Render pesanan
            renderCustomerOrders();
            
            // Setup mobile menu
            setupMobileMenu();
            
            // Setup form kontak
            setupContactForm();
            
            // Setup checkout
            setupCheckout();
            
            // Setup order tabs
            setupOrderTabs();
            
            // Setup modal listeners
            setupModalListeners();
            
            console.log('✅ Sistem PANGS!T Customer siap!');
        }
        
        // Setup Mobile Menu
        function setupMobileMenu() {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
            
            // Tutup menu saat klik link
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                });
            });
        }
        
        // Setup Contact Form
        function setupContactForm() {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const subject = document.getElementById('subject').value;
                
                showNotification(`Terima kasih ${name}, pesan Anda telah dikirim! Kami akan menghubungi Anda melalui email ${email}.`);
                contactForm.reset();
                
                // Simulasi pengiriman ke WhatsApp
                const message = `Halo PANGS!T, saya ${name}. ${subject}. Email saya: ${email}. Pesan: ${document.getElementById('message').value}`;
                const whatsappUrl = `https://wa.me/6283195243139?text=${encodeURIComponent(message)}`;
                
                // Buka WhatsApp setelah 2 detik
                setTimeout(() => {
                    window.open(whatsappUrl, '_blank');
                }, 2000);
            });
        }
        
        // Setup Checkout
        function setupCheckout() {
            // Event listener untuk tombol checkout
            checkoutBtn.addEventListener('click', () => {
                if (cart.length === 0) {
                    showNotification('Keranjang belanja masih kosong!', 'error');
                    return;
                }
                showCheckoutModal(cart);
            });
            
            // Event listener untuk metode pembayaran
            document.querySelectorAll('.payment-method').forEach(method => {
                method.addEventListener('click', function() {
                    document.querySelectorAll('.payment-method').forEach(m => {
                        m.classList.remove('selected');
                    });
                    this.classList.add('selected');
                });
            });
            
            // Event listener untuk step checkout
            document.getElementById('nextToStep2').addEventListener('click', () => {
                // Validasi form step 1
                const fullName = document.getElementById('fullName').value;
                const phone = document.getElementById('phone').value;
                const address = document.getElementById('address').value;
                const email = document.getElementById('emailOrder').value;
                
                if (!fullName || !phone || !address || !email) {
                    showNotification('Harap lengkapi semua informasi pengiriman', 'error');
                    return;
                }
                
                // Validasi email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    showNotification('Format email tidak valid', 'error');
                    return;
                }
                
                // Update step
                document.getElementById('step1').classList.remove('active');
                document.getElementById('step1').classList.add('completed');
                document.getElementById('step2').classList.add('active');
                
                // Tampilkan step 2
                document.getElementById('step1Form').style.display = 'none';
                document.getElementById('step2Form').style.display = 'block';
            });
            
            document.getElementById('backToStep1').addEventListener('click', () => {
                // Kembali ke step 1
                document.getElementById('step1').classList.add('active');
                document.getElementById('step1').classList.remove('completed');
                document.getElementById('step2').classList.remove('active');
                
                // Tampilkan step 1
                document.getElementById('step1Form').style.display = 'block';
                document.getElementById('step2Form').style.display = 'none';
            });
            
            document.getElementById('nextToStep3').addEventListener('click', () => {
                // Pastikan metode pembayaran dipilih
                const selectedPayment = document.querySelector('.payment-method.selected');
                if (!selectedPayment) {
                    showNotification('Pilih metode pembayaran terlebih dahulu', 'error');
                    return;
                }
                
                // Update step
                document.getElementById('step2').classList.remove('active');
                document.getElementById('step2').classList.add('completed');
                document.getElementById('step3').classList.add('active');
                
                // Tampilkan step 3
                document.getElementById('step2Form').style.display = 'none';
                document.getElementById('step3Form').style.display = 'block';
                document.getElementById('invoiceContainer').style.display = 'none';
                document.getElementById('printInvoiceBtn').style.display = 'none';
                
                // Buat dan simpan pesanan
                const savedOrder = createOrderFromCheckout();
                
                if (savedOrder) {
                    // Tampilkan instruksi pembayaran
                    showPaymentInstructions(savedOrder);
                    
                    // Tampilkan invoice
                    showInvoice(savedOrder);
                    
                    showNotification(`Pesanan ${savedOrder.id} berhasil dibuat!`, 'success');
                } else {
                    showNotification('Gagal membuat pesanan. Silakan coba lagi.', 'error');
                }
            });
            
            // Event listener untuk tombol batal checkout
            document.getElementById('cancelCheckout').addEventListener('click', () => {
                checkoutModal.classList.remove('active');
            });
            
            // Event listener untuk tombol selesai
            document.getElementById('closeOrderModal').addEventListener('click', () => {
                checkoutModal.classList.remove('active');
                showNotification('Pesanan berhasil diproses! Silakan cek status pesanan Anda.');
            });
            
            // Event listener untuk tombol cetak invoice
            document.getElementById('printInvoiceBtn').addEventListener('click', () => {
                const invoiceElement = document.getElementById('printableInvoice');
                if (!invoiceElement) return;
                
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Invoice</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            @media print {
                                body { margin: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        ${invoiceElement.innerHTML}
                        <div style="text-align: center; margin-top: 30px;">
                            <button onclick="window.print()" style="padding: 10px 20px; background: #ff6b35; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                Cetak Invoice
                            </button>
                            <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                                Tutup
                            </button>
                        </div>
                    </body>
                    </html>
                `);
                printWindow.document.close();
            });
        }
        
        // Setup Order Tabs
        function setupOrderTabs() {
            document.querySelectorAll('.order-tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    // Update active tab
                    document.querySelectorAll('.order-tab').forEach(t => {
                        t.classList.remove('active');
                    });
                    this.classList.add('active');
                    
                    // Render ulang pesanan
                    renderCustomerOrders();
                });
            });
        }
        
        // Setup Modal Listeners
        function setupModalListeners() {
            // Modal produk
            closeModal.addEventListener('click', () => {
                productModal.classList.remove('active');
            });
            
            productModal.addEventListener('click', (e) => {
                if (e.target === productModal) {
                    productModal.classList.remove('active');
                }
            });
            
            // Modal checkout
            closeCheckoutModal.addEventListener('click', () => {
                checkoutModal.classList.remove('active');
            });
            
            checkoutModal.addEventListener('click', (e) => {
                if (e.target === checkoutModal) {
                    checkoutModal.classList.remove('active');
                }
            });
            
            // Modal order detail
            window.addEventListener('click', (e) => {
                const orderModal = document.getElementById('orderDetailModal');
                if (orderModal && e.target === orderModal) {
                    orderModal.classList.remove('active');
                }
            });
        }
        
        // Tampilkan Instruksi Pembayaran
        function showPaymentInstructions(order) {
            const paymentContainer = document.getElementById('paymentInstructionsContainer');
            const paymentMethod = order.paymentMethod || 'qris';
            
            if (paymentMethod === 'qris') {
                paymentContainer.innerHTML = `
                    <div class="qris-container">
                        <div class="qris-title">
                            <i class="fas fa-qrcode"></i> QRIS Payment
                        </div>
                        <div class="qris-subtitle">
                            Scan QR Code di bawah untuk pembayaran via QRIS
                        </div>
                        
                        <div class="qris-code">
                            <canvas id="checkoutQrcode"></canvas>
                        </div>
                        
                        <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                            <div style="font-weight: 600; color: var(--secondary); margin-bottom: 5px;">Total Pembayaran:</div>
                            <div style="font-size: 24px; color: var(--primary); font-weight: 700;">${formatRupiah(order.total)}</div>
                        </div>
                        
                        <div class="qris-instruction">
                            <p><strong>Cara Pembayaran:</strong></p>
                            <ol class="qris-steps">
                                <li>Buka aplikasi e-wallet atau mobile banking yang mendukung QRIS</li>
                                <li>Pilih fitur "Scan QR" di menu utama</li>
                                <li>Arahkan kamera ke QR Code di atas</li>
                                <li>Periksa jumlah pembayaran: <strong>${formatRupiah(order.total)}</strong></li>
                                <li>Konfirmasi pembayaran</li>
                                <li>Screenshot bukti transfer untuk konfirmasi admin</li>
                            </ol>
                        </div>
                    </div>
                `;
                
                // Generate QR Code
                setTimeout(() => {
                    try {
                        const qrData = `PANGSIT|${order.id}|${order.total}|${Date.now()}`;
                        QRCode.toCanvas(document.getElementById('checkoutQrcode'), qrData, {
                            width: 200,
                            margin: 1,
                            color: {
                                dark: '#2d3047',
                                light: '#ffffff'
                            }
                        });
                    } catch (error) {
                        console.error('Error generating QR code:', error);
                    }
                }, 100);
            } else {
                paymentContainer.innerHTML = `
                    <div style="text-align: center; padding: 20px; background: var(--light); border-radius: 10px;">
                        <h4 style="color: var(--secondary); margin-bottom: 15px;">
                            <i class="fas fa-credit-card"></i> Transfer via ${paymentMethod.toUpperCase()}
                        </h4>
                        <div style="font-size: 24px; color: var(--primary); font-weight: 700; margin: 20px 0;">
                            ${formatRupiah(order.total)}
                        </div>
                        <p style="color: var(--gray);">
                            Silakan transfer ke rekening ${paymentMethod.toUpperCase()} yang akan dikirim via WhatsApp
                        </p>
                        <button class="btn" style="margin-top: 20px;" onclick="sendPaymentInfo('${order.id}')">
                            <i class="fab fa-whatsapp"></i> Minta Info Rekening
                        </button>
                    </div>
                `;
            }
        }
        
        // Tampilkan Invoice
        function showInvoice(order) {
            const invoiceContainer = document.getElementById('invoiceContainer');
            
            invoiceContainer.innerHTML = `
                <div class="invoice-container" id="printableInvoice">
                    <div class="invoice-header">
                        <div class="invoice-logo">PANGS!T STORE</div>
                        <p>Jl. Panongan, Tangerang | Telepon: +62 831-9524-3139</p>
                        <p>Email: sitirusmi54@gmail.com</p>
                    </div>
                    
                    <div class="invoice-details">
                        <div>
                            <h4>INVOICE</h4>
                            <p><strong>No:</strong> ${order.id}</p>
                            <p><strong>Tanggal:</strong> ${order.date}</p>
                            <p><strong>Waktu:</strong> ${order.time}</p>
                            <p><strong>Status:</strong> Menunggu Pembayaran</p>
                        </div>
                        <div>
                            <h4>PELANGGAN</h4>
                            <p><strong>Nama:</strong> ${order.customer.name}</p>
                            <p><strong>Telp:</strong> ${order.customer.phone}</p>
                            <p><strong>Email:</strong> ${order.customer.email}</p>
                            <p><strong>Alamat:</strong> ${order.customer.address}</p>
                        </div>
                    </div>
                    
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Produk</th>
                                <th>Qty</th>
                                <th>Harga</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.products.map(product => `
                                <tr>
                                    <td>${product.name}</td>
                                    <td>${product.quantity}</td>
                                    <td>${formatRupiah(product.price)}</td>
                                    <td>${formatRupiah(product.price * product.quantity)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="invoice-totals">
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span>${formatRupiah(order.subtotal)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Pengiriman:</span>
                            <span>${formatRupiah(order.shipping)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Pajak (10%):</span>
                            <span>${formatRupiah(order.tax)}</span>
                        </div>
                        <div class="summary-row" style="font-weight: bold; font-size: 20px; border-top: 2px solid var(--primary); padding-top: 10px; margin-top: 10px;">
                            <span>TOTAL:</span>
                            <span style="color: var(--primary);">${formatRupiah(order.total)}</span>
                        </div>
                    </div>
                    <div style="clear: both;"></div>
                    
                    <div class="invoice-note">
                        <p><strong>Metode Pembayaran:</strong> ${order.paymentMethod.toUpperCase()}</p>
                        <p><strong>Catatan:</strong> ${order.notes || 'Tidak ada catatan'}</p>
                        <p style="margin-top: 15px;">Terima kasih telah berbelanja di PANGS!T STORE</p>
                    </div>
                </div>
            `;
            
            invoiceContainer.style.display = 'block';
            document.getElementById('printInvoiceBtn').style.display = 'block';
        }
        
        // Kirim Info Pembayaran via WhatsApp
        function sendPaymentInfo(orderId) {
            const order = customerOrders.find(o => o.id === orderId);
            if (!order) return;
            
            const message = `Halo PANGS!T, saya ${order.customer.name}. Saya ingin informasi rekening untuk pembayaran Order ID: ${order.id} sebesar ${formatRupiah(order.total)} via ${order.paymentMethod.toUpperCase()}.`;
            const whatsappUrl = `https://wa.me/6283195243139?text=${encodeURIComponent(message)}`;
            
            window.open(whatsappUrl, '_blank');
        }
        
        // Ekspor fungsi ke global scope
        window.viewOrderDetail = viewOrderDetail;
        window.showPaymentConfirmation = showPaymentConfirmation;
        window.printInvoice = printInvoice;
        window.closeOrderModal = closeOrderModal;
        window.closePaymentModal = closePaymentModal;
        window.sendPaymentInfo = sendPaymentInfo;
        
        // Inisialisasi saat halaman dimuat
        document.addEventListener('DOMContentLoaded', init);
        
        // Auto-refresh status pesanan setiap 10 detik
        setInterval(() => {
            // Refresh dari sistem terpusat
            const allOrders = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
            
            // Update customerOrders jika ada perubahan
            let updated = false;
            allOrders.forEach(masterOrder => {
                const customerOrderIndex = customerOrders.findIndex(o => o.id === masterOrder.id);
                if (customerOrderIndex >= 0) {
                    // Cek apakah ada perubahan
                    if (JSON.stringify(customerOrders[customerOrderIndex]) !== JSON.stringify(masterOrder)) {
                        customerOrders[customerOrderIndex] = { ...customerOrders[customerOrderIndex], ...masterOrder };
                        updated = true;
                    }
                }
            });
            
            if (updated) {
                localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
                renderCustomerOrders();
            }
        }, 10000);
