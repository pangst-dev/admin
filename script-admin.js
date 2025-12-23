// ==================== KONSTANTA DAN KONFIGURASI ====================
const STORAGE_KEY = 'pangsit_orders_master';
const PRODUCTS_KEY = 'pangsit_products';
const CART_KEY = 'pangsit_cart';
const CUSTOMER_ORDERS_KEY = 'pangsit_customer_orders';

// Status Pembayaran
const PAYMENT_STATUS = {
    PENDING: 'menunggu',
    PROCESSING: 'diproses',
    PAID: 'lunas',
    CANCELLED: 'dibatalkan',
    REFUNDED: 'dikembalikan'
};

// Status Pesanan
const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

// ==================== DATA PRODUK ====================
const products = [
    {
        id: 1,
        name: "Fire Silk Wonton",
        price: 20000,
        image: "foto/fire silk wonton.jpg",
        description: "Kesan: lembut, pedas aromatik, classy dengan minyak cabai khas Asia.",
        details: "Kesan: lembut, pedas aromatik, classy dengan minyak cabai khas Asia. Dibuat dengan bahan premium dan rempah pilihan.",
        category: "pedas"
    },
    {
        id: 2,
        name: "Dumpling",
        price: 25000,
        image: "foto/Dumpling.jpg",
        description: "Kesan: berisi, juicy, wholesome, fresh ingredients.",
        details: "Kesan: berisi, juicy, wholesome, fresh ingredients. Setiap gigitan memberikan cita rasa autentik dengan isian yang melimpah.",
        category: "klasik"
    },
    {
        id: 3,
        name: "Siomay",
        price: 18000,
        image: "foto/siomay.jpg",
        description: "Kesan: tradisional, manis gurih, cocok untuk semua.",
        details: "Kesan: tradisional, manis gurih, cocok untuk semua. Resep turun temurun dengan cita rasa yang khas.",
        category: "klasik"
    },
    {
        id: 4,
        name: "Shrimp Roll",
        price: 22000,
        image: "foto/shrimp roll.jpg",
        description: "Kesan: crunchy, seafood, aromatic, tasty.",
        details: "Kesan: crunchy, seafood, aromatic, tasty. Menggunakan udang segar pilihan dengan kulit yang renyah.",
        category: "seafood"
    },
    {
        id: 5,
        name: "Shu Mai",
        price: 15000,
        image: "foto/shu mai.jpg",
        description: "Kesan: steamed, juicy, filling, satisfying.",
        details: "Kesan: steamed, juicy, filling, satisfying. Dimasak dengan teknik steaming tradisional.",
        category: "klasik"
    },
    {
        id: 6,
        name: "Crispy Wonton",
        price: 17000,
        image: "foto/crispy wonton.jpg",
        description: "Kesan: crunchy, savoury, perfect snack, addictive.",
        details: "Kesan: crunchy, savoury, perfect snack, addictive. Gorengan sempurna dengan kerenyahan yang tahan lama.",
        category: "goreng"
    },
    {
        id: 7,
        name: "Vegetable Dumpling",
        price: 16000,
        image: "foto/vegetable dumpling.jpg",
        description: "Kesan: healthy, fresh, light, vegetarian-friendly.",
        details: "Kesan: healthy, fresh, light, vegetarian-friendly. Pilihan tepat untuk yang menyukai makanan sehat.",
        category: "vegetarian"
    },
    {
        id: 8,
        name: "Spicy Chili Wonton",
        price: 23000,
        image: "foto/spicy chili wonton.jpg",
        description: "Kesan: hot, spicy, bold, flavourful.",
        details: "Kesan: hot, spicy, bold, flavourful. Untuk pecinta pedas sejati dengan level kepedasan yang bisa disesuaikan.",
        category: "pedas"
    }
];

// ==================== STATE APLIKASI ====================
let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
let customerOrders = JSON.parse(localStorage.getItem(CUSTOMER_ORDERS_KEY)) || [];
let currentProduct = null;

// ==================== DOM ELEMENTS ====================
const navLinks = document.getElementById('navLinks');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const cartCount = document.getElementById('cartCount');
const productsContainer = document.getElementById('productsContainer');
const customerOrdersContainer = document.getElementById('customerOrdersContainer');

// ==================== FUNGSI UTILITAS ====================
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function showNotification(message, type = 'success') {
    // Hapus notifikasi sebelumnya
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Buat notifikasi baru
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    // Auto remove setelah 3 detik
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `PANG-${timestamp}-${random}`;
}

function setupMobileMenu() {
    if (!mobileMenuBtn || !navLinks) return;

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

function setActiveNav() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// ==================== SISTEM PRODUK ====================
function renderProducts() {
    if (!productsContainer) return;

    productsContainer.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=PANGSIT'">
                <div class="product-category">${product.category}</div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${formatRupiah(product.price)}</div>
                <div class="product-actions">
                    <button class="btn btn-outline" onclick="viewProductDetail(${product.id})">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                    <button class="btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Tambah
                    </button>
                </div>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
    });
}

function viewProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentProduct = product;

    const productModal = document.getElementById('productModal');
    const modalContent = document.querySelector('.modal-content');

    if (productModal && modalContent) {
        modalContent.innerHTML = `
            <button class="close-modal" id="closeModal">&times;</button>
            <div class="product-detail-container">
                <div class="product-detail-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x300?text=PANGSIT'">
                </div>
                <div class="product-detail-info">
                    <div class="product-detail-header">
                        <h2>${product.name}</h2>
                        <div class="product-category-badge">${product.category}</div>
                    </div>
                    <div class="product-price-large">${formatRupiah(product.price)}</div>
                    <div class="product-detail-description">
                        <h3>Deskripsi Produk</h3>
                        <p>${product.details}</p>
                    </div>
                    <div class="product-detail-actions">
                        <button class="btn btn-outline" onclick="addToCart(${product.id}, 1)">
                            <i class="fas fa-cart-plus"></i> Tambah ke Keranjang
                        </button>
                        <button class="btn" onclick="addToCart(${product.id}, 1); productModal.classList.remove('active');">
                            <i class="fas fa-bolt"></i> Beli Sekarang
                        </button>
                    </div>
                </div>
            </div>
        `;

        productModal.classList.add('active');

        // Setup close button
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                productModal.classList.remove('active');
            });
        }

        productModal.addEventListener('click', (e) => {
            if (e.target === productModal) {
                productModal.classList.remove('active');
            }
        });
    }
}

// ==================== SISTEM KERANJANG ====================
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showNotification('Produk tidak ditemukan', 'error');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }

    updateCart();
    showNotification(`${product.name} ditambahkan ke keranjang`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    showNotification('Produk dihapus dari keranjang', 'info');
}

function updateCart() {
    // Update cart count
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    // Update cart display
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const emptyCartElement = document.getElementById('emptyCart');

    if (cartItemsContainer && cartTotalElement && emptyCartElement) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '';
            cartTotalElement.textContent = formatRupiah(0);
            emptyCartElement.style.display = 'block';
            cartItemsContainer.style.display = 'none';
        } else {
            emptyCartElement.style.display = 'none';
            cartItemsContainer.style.display = 'block';
            cartItemsContainer.innerHTML = '';

            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">${formatRupiah(item.price)}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="cart-item-subtotal">
                        ${formatRupiah(item.price * item.quantity)}
                    </div>
                `;
                cartItemsContainer.appendChild(cartItem);
            });

            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotalElement.textContent = formatRupiah(total);
        }
    }

    // Save to localStorage
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCart();
    }
}

// ==================== SISTEM PEMBAYARAN TERPUSAT ====================
function saveOrderToMaster(orderData) {
    try {
        let allOrders = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        // Cek apakah pesanan sudah ada
        const existingIndex = allOrders.findIndex(o => o.id === orderData.id);
        
        if (existingIndex >= 0) {
            // Update pesanan yang sudah ada
            allOrders[existingIndex] = orderData;
        } else {
            // Tambah pesanan baru
            allOrders.push(orderData);
        }
        
        // Simpan kembali ke localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allOrders));
        
        // Simpan juga ke localStorage customer untuk tampilan di halaman ini
        saveCustomerOrder(orderData);
        
        console.log('✅ Pesanan disimpan ke sistem terpusat:', orderData.id);
        return orderData;
        
    } catch (error) {
        console.error('❌ Error menyimpan pesanan:', error);
        return null;
    }
}

function getOrdersFromMaster() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        console.error('❌ Error mengambil pesanan:', error);
        return [];
    }
}

function saveCustomerOrder(orderData) {
    // Cek apakah pesanan sudah ada di customerOrders
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
    
    localStorage.setItem(CUSTOMER_ORDERS_KEY, JSON.stringify(customerOrders));
    renderCustomerOrders();
    
    return orderData;
}

function updatePaymentStatus(orderId, status, adminNote = '') {
    try {
        let allOrders = getOrdersFromMaster();
        
        const orderIndex = allOrders.findIndex(o => o.id === orderId);
        
        if (orderIndex >= 0) {
            // Update status pembayaran
            allOrders[orderIndex].paymentStatus = status;
            allOrders[orderIndex].adminNote = adminNote;
            allOrders[orderIndex].updatedAt = new Date().toISOString();
            
            // Jika status "lunas", update status pesanan menjadi "diproses"
            if (status === PAYMENT_STATUS.PAID) {
                allOrders[orderIndex].status = ORDER_STATUS.PROCESSING;
            }
            
            // Simpan kembali
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allOrders));
            
            // Update juga di customerOrders
            const customerOrderIndex = customerOrders.findIndex(o => o.id === orderId);
            if (customerOrderIndex >= 0) {
                customerOrders[customerOrderIndex].paymentStatus = status;
                customerOrders[customerOrderIndex].status = allOrders[orderIndex].status;
                localStorage.setItem(CUSTOMER_ORDERS_KEY, JSON.stringify(customerOrders));
            }
            
            console.log(`✅ Status pembayaran diupdate: ${orderId} -> ${status}`);
            renderCustomerOrders();
            
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ Error update status pembayaran:', error);
        return false;
    }
}

// ==================== MODAL PEMBAYARAN ====================
function showPaymentConfirmation(orderId) {
    const order = customerOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const modalHTML = `
        <div class="modal" id="paymentModal" style="display: flex;">
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
                    
                    <div class="qris-container">
                        <div class="qris-title">
                            <i class="fas fa-qrcode"></i> QRIS Payment
                        </div>
                        <div class="qris-subtitle">
                            Scan QR Code untuk pembayaran
                        </div>
                        
                        <div class="qris-code">
                            <div id="qrcodeCanvas"></div>
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
                                         order.paymentStatus === 'dibatalkan' ? '#f8d7da' : '#fff3cd'};
                            color: ${order.paymentStatus === 'lunas' ? '#155724' : 
                                    order.paymentStatus === 'diproses' ? '#0c5460' : 
                                    order.paymentStatus === 'dibatalkan' ? '#721c24' : '#856404'};
                        ">
                            ${order.paymentStatus === 'lunas' ? 'LUNAS' : 
                              order.paymentStatus === 'diproses' ? 'DIPROSES' : 
                              order.paymentStatus === 'dibatalkan' ? 'DIBATALKAN' : 'MENUNGGU PEMBAYARAN'}
                        </div>
                        
                        ${order.paymentStatus === 'menunggu' ? `
                            <div style="font-size: 14px; color: var(--gray);">
                                <i class="fas fa-clock"></i> 
                                Setelah transfer, admin akan memverifikasi pembayaran Anda.
                                Status akan berubah otomatis.
                            </div>
                        ` : ''}
                        
                        ${order.adminNote ? `
                            <div style="margin-top: 10px; font-size: 14px;">
                                <strong>Catatan Admin:</strong> ${order.adminNote}
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
    
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv);
    
    generateQRCodeForPayment(order.id, order.total);
}

function generateQRCodeForPayment(orderId, amount) {
    const qrData = `PANGSTORE|${orderId}|${amount}|${new Date().getTime()}`;
    
    if (!window.QRCode) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
        script.onload = function() {
            createQRCode(qrData);
        };
        document.head.appendChild(script);
    } else {
        createQRCode(qrData);
    }
    
    function createQRCode(data) {
        const qrElement = document.getElementById('qrcodeCanvas');
        if (qrElement && window.QRCode) {
            qrElement.innerHTML = '';
            
            QRCode.toCanvas(qrElement, data, {
                width: 180,
                margin: 1,
                color: {
                    dark: '#2d3047',
                    light: '#ffffff'
                }
            }, function(error) {
                if (error) console.error(error);
            });
        }
    }
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.remove();
    }
}

function checkPaymentStatus(orderId) {
    const allOrders = getOrdersFromMaster();
    const order = allOrders.find(o => o.id === orderId);
    
    if (order) {
        const statusDisplay = document.getElementById('paymentStatusDisplay');
        if (statusDisplay) {
            statusDisplay.textContent = order.paymentStatus === 'lunas' ? 'LUNAS' : 
                                       order.paymentStatus === 'diproses' ? 'DIPROSES' : 
                                       order.paymentStatus === 'dibatalkan' ? 'DIBATALKAN' : 'MENUNGGU PEMBAYARAN';
            
            statusDisplay.style.background = order.paymentStatus === 'lunas' ? '#d4edda' : 
                                             order.paymentStatus === 'diproses' ? '#d1ecf1' : 
                                             order.paymentStatus === 'dibatalkan' ? '#f8d7da' : '#fff3cd';
            
            statusDisplay.style.color = order.paymentStatus === 'lunas' ? '#155724' : 
                                        order.paymentStatus === 'diproses' ? '#0c5460' : 
                                        order.paymentStatus === 'dibatalkan' ? '#721c24' : '#856404';
        }
        
        showNotification('Status pembayaran diperbarui', 'success');
    }
}

// ==================== SISTEM CHECKOUT ====================
function showCheckoutModal() {
    if (cart.length === 0) {
        showNotification('Keranjang belanja masih kosong!', 'error');
        return;
    }

    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutContent = document.querySelector('#checkoutModal .modal-content');

    if (checkoutModal && checkoutContent) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        checkoutContent.innerHTML = `
            <button class="close-modal" id="closeCheckoutModal">&times;</button>
            <div class="checkout-container">
                <h2><i class="fas fa-shopping-cart"></i> Checkout</h2>
                
                <div class="checkout-items">
                    ${cart.map(item => `
                        <div class="checkout-item">
                            <div class="checkout-item-info">
                                <h4>${item.name}</h4>
                                <div>${formatRupiah(item.price)} × ${item.quantity}</div>
                            </div>
                            <div class="checkout-item-subtotal">
                                ${formatRupiah(item.price * item.quantity)}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="checkout-total">
                    <div>Total Pembayaran:</div>
                    <div class="checkout-total-amount">${formatRupiah(total)}</div>
                </div>
                
                <form id="checkoutForm" class="checkout-form">
                    <h3><i class="fas fa-user"></i> Informasi Penerima</h3>
                    
                    <div class="form-group">
                        <label for="customerName">
                            <i class="fas fa-user-circle"></i> Nama Lengkap
                        </label>
                        <input type="text" id="customerName" required placeholder="Masukkan nama lengkap">
                    </div>
                    
                    <div class="form-group">
                        <label for="customerPhone">
                            <i class="fas fa-phone"></i> No. WhatsApp
                        </label>
                        <input type="tel" id="customerPhone" required placeholder="Contoh: 081234567890">
                    </div>
                    
                    <div class="form-group">
                        <label for="customerAddress">
                            <i class="fas fa-map-marker-alt"></i> Alamat Lengkap
                        </label>
                        <textarea id="customerAddress" rows="3" required placeholder="Masukkan alamat lengkap untuk pengiriman"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="paymentMethod">
                            <i class="fas fa-credit-card"></i> Metode Pembayaran
                        </label>
                        <select id="paymentMethod" required>
                            <option value="">Pilih metode pembayaran</option>
                            <option value="qris">QRIS (Semua e-wallet)</option>
                            <option value="bank_transfer">Transfer Bank</option>
                            <option value="cod">Cash on Delivery (COD)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="orderNotes">
                            <i class="fas fa-sticky-note"></i> Catatan Pesanan (Opsional)
                        </label>
                        <textarea id="orderNotes" rows="2" placeholder="Contoh: Jangan pakai sambel, minta kantong ekstra, dll."></textarea>
                    </div>
                    
                    <div class="checkout-actions">
                        <button type="button" class="btn btn-outline" onclick="closeCheckoutModal()">
                            <i class="fas fa-times"></i> Batal
                        </button>
                        <button type="submit" class="btn">
                            <i class="fas fa-paper-plane"></i> Buat Pesanan
                        </button>
                    </div>
                </form>
            </div>
        `;

        checkoutModal.classList.add('active');

        // Setup form submission
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', handleCheckout);
        }

        // Setup close button
        const closeModal = document.getElementById('closeCheckoutModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                checkoutModal.classList.remove('active');
            });
        }

        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) {
                checkoutModal.classList.remove('active');
            }
        });
    }
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function handleCheckout(e) {
    e.preventDefault();
    
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();
    const paymentMethod = document.getElementById('paymentMethod').value;
    const orderNotes = document.getElementById('orderNotes').value.trim();
    
    if (!customerName || !customerPhone || !customerAddress || !paymentMethod) {
        showNotification('Harap lengkapi semua informasi yang diperlukan', 'error');
        return;
    }
    
    // Validasi nomor telepon
    const phoneRegex = /^[0-9]{10,13}$/;
    if (!phoneRegex.test(customerPhone)) {
        showNotification('Format nomor telepon tidak valid. Gunakan 10-13 digit angka', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderId = generateOrderId();
    const now = new Date();
    
    const orderData = {
        id: orderId,
        date: now.toLocaleDateString('id-ID'),
        time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        customer: {
            name: customerName,
            phone: customerPhone,
            address: customerAddress
        },
        products: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        total: total,
        paymentMethod: paymentMethod,
        notes: orderNotes,
        status: ORDER_STATUS.PENDING,
        paymentStatus: PAYMENT_STATUS.PENDING,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
    };
    
    // Simpan pesanan
    const savedOrder = saveOrderToMaster(orderData);
    
    if (savedOrder) {
        // Reset keranjang
        cart = [];
        updateCart();
        
        // Tutup modal
        closeCheckoutModal();
        
        // Tampilkan konfirmasi
        showNotification('Pesanan berhasil dibuat! ID: ' + orderId, 'success');
        
        // Scroll ke status pesanan
        setTimeout(() => {
            const statusSection = document.getElementById('status');
            if (statusSection) {
                statusSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 500);
        
        // Tampilkan modal pembayaran jika bukan COD
        if (paymentMethod !== 'cod') {
            setTimeout(() => {
                showPaymentConfirmation(orderId);
            }, 1000);
        }
    } else {
        showNotification('Gagal membuat pesanan. Silakan coba lagi.', 'error');
    }
}

// ==================== SISTEM STATUS PESANAN ====================
function renderCustomerOrders() {
    if (!customerOrdersContainer) return;

    customerOrdersContainer.innerHTML = '';
    
    // Ambil data dari sistem terpusat untuk sinkronisasi
    const masterOrders = getOrdersFromMaster();
    
    if (masterOrders.length === 0 && customerOrders.length === 0) {
        customerOrdersContainer.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 20px; color: var(--light-gray);"></i>
                <p>Belum ada pesanan</p>
                <p style="font-size: 14px; margin-top: 10px;">Pesanan yang Anda buat akan muncul di sini</p>
                <a href="#produk" class="btn" style="margin-top: 20px;">Mulai Belanja</a>
            </div>
        `;
        return;
    }
    
    // Gabungkan dan urutkan pesanan
    let allOrders = [...customerOrders];
    
    // Sinkronkan dengan master orders
    masterOrders.forEach(masterOrder => {
        const existingIndex = allOrders.findIndex(o => o.id === masterOrder.id);
        if (existingIndex >= 0) {
            allOrders[existingIndex] = { ...allOrders[existingIndex], ...masterOrder };
        } else {
            allOrders.push(masterOrder);
        }
    });
    
    // Urutkan berdasarkan tanggal terbaru
    allOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.timestamp || 0);
        const dateB = new Date(b.createdAt || b.timestamp || 0);
        return dateB - dateA;
    });
    
    // Tampilkan pesanan
    allOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        // Tentukan class status berdasarkan status pesanan
        let statusClass = 'status-pending';
        let statusText = 'Menunggu';
        
        if (order.status === 'processing') {
            statusClass = 'status-processing';
            statusText = 'Diproses';
        } else if (order.status === 'shipped') {
            statusClass = 'status-shipped';
            statusText = 'Dikirim';
        } else if (order.status === 'delivered') {
            statusClass = 'status-delivered';
            statusText = 'Selesai';
        } else if (order.status === 'cancelled') {
            statusClass = 'status-cancelled';
            statusText = 'Dibatalkan';
        }
        
        // Tentukan class status pembayaran
        let paymentStatusClass = 'status-pending';
        let paymentStatusText = 'Menunggu';
        
        if (order.paymentStatus === 'lunas') {
            paymentStatusClass = 'status-delivered';
            paymentStatusText = 'Lunas';
        } else if (order.paymentStatus === 'diproses') {
            paymentStatusClass = 'status-processing';
            paymentStatusText = 'Diproses';
        } else if (order.paymentStatus === 'dibatalkan') {
            paymentStatusClass = 'status-cancelled';
            paymentStatusText = 'Dibatalkan';
        }
        
        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-id">${order.id}</div>
                    <div class="order-date">${order.date || 'N/A'} - ${order.time || 'N/A'}</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
                    <div class="order-status ${statusClass}">${statusText}</div>
                    <div class="order-status ${paymentStatusClass}" style="font-size: 12px; padding: 3px 10px;">
                        ${paymentStatusText}
                    </div>
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
                    <div class="order-total-amount">${formatRupiah(order.total || 0)}</div>
                    <div style="font-size: 14px; color: var(--gray); margin-top: 5px;">
                        ${order.paymentMethod ? 'Metode: ' + order.paymentMethod.toUpperCase() : ''}
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn" style="padding: 8px 15px; font-size: 14px;" 
                        onclick="showPaymentConfirmation('${order.id}')">
                    <i class="fas fa-qrcode"></i> Bayar
                </button>
                <button class="btn btn-outline" style="padding: 8px 15px; font-size: 14px;" 
                        onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i> Detail
                </button>
                <button class="btn btn-outline" style="padding: 8px 15px; font-size: 14px;" 
                        onclick="printInvoice('${order.id}')">
                    <i class="fas fa-print"></i> Invoice
                </button>
            </div>
        `;
        
        customerOrdersContainer.appendChild(orderCard);
    });
}

function viewOrderDetails(orderId) {
    const order = customerOrders.find(o => o.id === orderId) || getOrdersFromMaster().find(o => o.id === orderId);
    if (!order) return;

    const modalHTML = `
        <div class="modal" style="display: flex;">
            <div class="modal-content" style="max-width: 600px;">
                <button class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</button>
                <div style="padding: 30px;">
                    <h2 style="color: var(--primary); margin-bottom: 20px; border-bottom: 2px solid var(--light-gray); padding-bottom: 10px;">
                        <i class="fas fa-file-invoice"></i> Detail Pesanan
                    </h2>
                    
                    <div class="order-info-grid">
                        <div class="info-item">
                            <strong>ID Pesanan:</strong> ${order.id}
                        </div>
                        <div class="info-item">
                            <strong>Tanggal:</strong> ${order.date} ${order.time}
                        </div>
                        <div class="info-item">
                            <strong>Status:</strong> 
                            <span class="order-status ${order.status === 'processing' ? 'status-processing' : 
                                                     order.status === 'shipped' ? 'status-shipped' : 
                                                     order.status === 'delivered' ? 'status-delivered' : 
                                                     order.status === 'cancelled' ? 'status-cancelled' : 'status-pending'}">
                                ${order.status === 'processing' ? 'Diproses' : 
                                  order.status === 'shipped' ? 'Dikirim' : 
                                  order.status === 'delivered' ? 'Selesai' : 
                                  order.status === 'cancelled' ? 'Dibatalkan' : 'Menunggu'}
                            </span>
                        </div>
                        <div class="info-item">
                            <strong>Pembayaran:</strong>
                            <span class="order-status ${order.paymentStatus === 'lunas' ? 'status-delivered' : 
                                                     order.paymentStatus === 'diproses' ? 'status-processing' : 
                                                     order.paymentStatus === 'dibatalkan' ? 'status-cancelled' : 'status-pending'}">
                                ${order.paymentStatus === 'lunas' ? 'Lunas' : 
                                  order.paymentStatus === 'diproses' ? 'Diproses' : 
                                  order.paymentStatus === 'dibatalkan' ? 'Dibatalkan' : 'Menunggu'}
                            </span>
                        </div>
                    </div>
                    
                    <div style="margin: 30px 0;">
                        <h3 style="color: var(--secondary); margin-bottom: 15px;">
                            <i class="fas fa-user"></i> Informasi Pelanggan
                        </h3>
                        <div class="customer-info">
                            <p><strong>Nama:</strong> ${order.customer?.name || 'N/A'}</p>
                            <p><strong>Telepon:</strong> ${order.customer?.phone || 'N/A'}</p>
                            <p><strong>Alamat:</strong> ${order.customer?.address || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div style="margin: 30px 0;">
                        <h3 style="color: var(--secondary); margin-bottom: 15px;">
                            <i class="fas fa-shopping-basket"></i> Detail Produk
                        </h3>
                        <div class="order-products">
                            ${order.products ? order.products.map(product => `
                                <div class="order-product-item">
                                    <div>
                                        <div class="product-name">${product.name}</div>
                                        <div class="product-quantity">${product.quantity} × ${formatRupiah(product.price)}</div>
                                    </div>
                                    <div class="product-subtotal">
                                        ${formatRupiah(product.price * product.quantity)}
                                    </div>
                                </div>
                            `).join('') : ''}
                        </div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 30px 0;">
                        <div class="order-summary">
                            <div class="summary-row">
                                <span>Subtotal:</span>
                                <span>${formatRupiah(order.total || 0)}</span>
                            </div>
                            <div class="summary-row">
                                <span>Ongkos Kirim:</span>
                                <span>${formatRupiah(0)}</span>
                            </div>
                            <div class="summary-row total">
                                <span><strong>Total:</strong></span>
                                <span><strong>${formatRupiah(order.total || 0)}</strong></span>
                            </div>
                        </div>
                        
                        <div style="margin-top: 20px;">
                            <p><strong>Metode Pembayaran:</strong> ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A'}</p>
                            ${order.notes ? `<p><strong>Catatan:</strong> ${order.notes}</p>` : ''}
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                        <button class="btn btn-outline" onclick="this.parentElement.parentElement.parentElement.remove()">
                            <i class="fas fa-times"></i> Tutup
                        </button>
                        <button class="btn" onclick="printInvoice('${order.id}')">
                            <i class="fas fa-print"></i> Cetak Invoice
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

function printInvoice(orderId) {
    const order = customerOrders.find(o => o.id === orderId) || getOrdersFromMaster().find(o => o.id === orderId);
    if (!order) {
        showNotification('Data pesanan tidak ditemukan', 'error');
        return;
    }

    const printWindow = window.open('', '_blank');
    
    const invoiceContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice ${order.id}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .invoice-title { font-size: 24px; font-weight: bold; color: #2d3047; }
                .invoice-id { font-size: 14px; color: #666; }
                .section { margin: 25px 0; }
                .section-title { font-weight: bold; color: #2d3047; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .order-items { width: 100%; border-collapse: collapse; margin: 15px 0; }
                .order-items th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
                .order-items td { padding: 10px; border-bottom: 1px solid #eee; }
                .total-row { font-weight: bold; font-size: 18px; background: #f8f9fa; }
                .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="invoice-header">
                <div class="invoice-title">PANGS!T STORE</div>
                <div class="invoice-id">Invoice: ${order.id}</div>
                <div>Tanggal: ${order.date} ${order.time}</div>
            </div>
            
            <div class="section">
                <div class="section-title">Informasi Pelanggan</div>
                <div class="info-grid">
                    <div>
                        <p><strong>Nama:</strong> ${order.customer?.name || 'N/A'}</p>
                        <p><strong>Telepon:</strong> ${order.customer?.phone || 'N/A'}</p>
                    </div>
                    <div>
                        <p><strong>Alamat:</strong> ${order.customer?.address || 'N/A'}</p>
                        <p><strong>Status:</strong> ${order.status}</p>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Detail Pesanan</div>
                <table class="order-items">
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
                                <td>${formatRupiah(product.price)}</td>
                                <td>${formatRupiah(product.price * product.quantity)}</td>
                            </tr>
                        `).join('') : ''}
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right;">TOTAL:</td>
                            <td>${formatRupiah(order.total || 0)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">Informasi Pembayaran</div>
                <p><strong>Metode Pembayaran:</strong> ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A'}</p>
                <p><strong>Status Pembayaran:</strong> ${order.paymentStatus}</p>
                ${order.notes ? `<p><strong>Catatan:</strong> ${order.notes}</p>` : ''}
            </div>
            
            <div class="footer">
                <p>Terima kasih telah berbelanja di PANGS!T Store</p>
                <p>Jl. Panongan, Desa Panongan, Kec. Panongan, Kabupaten Tangerang</p>
                <p>Telp: +62 831-9524-3139 | Email: sitirusmi54@gmail.com</p>
            </div>
            
            <div class="no-print" style="margin-top: 20px; text-align: center;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #2d3047; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Cetak Invoice
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                    Tutup
                </button>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
}

// ==================== INISIALISASI APLIKASI ====================
function init() {
    // Setup mobile menu
    setupMobileMenu();
    
    // Set active navigation
    setActiveNav();
    
    // Render produk
    renderProducts();
    
    // Update keranjang
    updateCart();
    
    // Render pesanan
    renderCustomerOrders();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ Sistem PANGS!T berhasil diinisialisasi');
}

function setupEventListeners() {
    // Tombol checkout dari keranjang
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', showCheckoutModal);
    }
    
    // Tombol checkout dari produk detail
    const buyNowBtn = document.getElementById('buyNowBtn');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            if (currentProduct) {
                addToCart(currentProduct.id, 1);
                showCheckoutModal();
            }
        });
    }
}

// ==================== EKSPOR FUNGSI KE GLOBAL SCOPE ====================
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.viewProductDetail = viewProductDetail;
window.showCheckoutModal = showCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.showPaymentConfirmation = showPaymentConfirmation;
window.closePaymentModal = closePaymentModal;
window.checkPaymentStatus = checkPaymentStatus;
window.viewOrderDetails = viewOrderDetails;
window.printInvoice = printInvoice;

// ==================== JALANKAN APLIKASI ====================
document.addEventListener('DOMContentLoaded', init);
