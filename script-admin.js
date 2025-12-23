// ==================== ORDER FORM - FIXED VERSION ====================
// Script ini harus digunakan di halaman pemesanan (order.html)

document.addEventListener('DOMContentLoaded', function() {
    // Initialize form
    initializeOrderForm();
    
    // Update cart display
    updateCartDisplay();
});

// Product price mapping (harus sama dengan di admin)
const productPrices = {
    'Pangsit Original': 15000,
    'Pangsit Pedas': 20000,
    'Pangsit Ayam': 25000,
    'Pangsit Udang': 30000,
    'Pangsit Sayur': 18000,
    'Pangsit Goreng': 20000,
    'Pangsit Kuah': 22000,
    'Pangsit Special': 35000,
    'Es Teh': 5000,
    'Es Jeruk': 6000,
    'Air Mineral': 3000,
    'Kopi': 8000
};

// Cart items
let cartItems = [];

// Initialize order form
function initializeOrderForm() {
    // Add event listeners for quantity inputs
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            updateCartItem(this.dataset.product, this.value);
        });
    });
    
    // Add event listeners for menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const productName = this.dataset.product;
            addToCart(productName, 1);
        });
    });
    
    // Setup form submission
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', submitOrder);
    }
    
    // Load cart from localStorage if exists
    loadCartFromStorage();
}

// Add item to cart
function addToCart(productName, quantity) {
    const price = productPrices[productName] || 15000;
    
    // Check if item already in cart
    const existingIndex = cartItems.findIndex(item => item.name === productName);
    
    if (existingIndex > -1) {
        // Update quantity
        cartItems[existingIndex].quantity += parseInt(quantity);
    } else {
        // Add new item
        cartItems.push({
            name: productName,
            price: price,
            quantity: parseInt(quantity)
        });
    }
    
    // Save to localStorage
    saveCartToStorage();
    
    // Update display
    updateCartDisplay();
    showToast(`${productName} ditambahkan ke keranjang!`);
}

// Update cart item quantity
function updateCartItem(productName, quantity) {
    const qty = parseInt(quantity);
    
    if (qty < 1) {
        // Remove item from cart
        cartItems = cartItems.filter(item => item.name !== productName);
    } else {
        // Update quantity
        const itemIndex = cartItems.findIndex(item => item.name === productName);
        if (itemIndex > -1) {
            cartItems[itemIndex].quantity = qty;
        }
    }
    
    // Save to localStorage
    saveCartToStorage();
    
    // Update display
    updateCartDisplay();
}

// Remove item from cart
function removeFromCart(productName) {
    cartItems = cartItems.filter(item => item.name !== productName);
    
    // Save to localStorage
    saveCartToStorage();
    
    // Update display
    updateCartDisplay();
    showToast(`${productName} dihapus dari keranjang!`);
}

// Clear cart
function clearCart() {
    cartItems = [];
    
    // Save to localStorage
    saveCartToStorage();
    
    // Update display
    updateCartDisplay();
    showToast('Keranjang dikosongkan!');
}

// Update cart display
function updateCartDisplay() {
    const cartContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');
    
    if (!cartContainer) return;
    
    if (cartItems.length === 0) {
        cartContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #666;">
                <i class="fas fa-shopping-cart" style="font-size: 48px; margin-bottom: 10px; color: #ddd;"></i>
                <p>Keranjang kosong</p>
                <p style="font-size: 14px;">Pilih menu di atas</p>
            </div>
        `;
        if (cartTotal) cartTotal.textContent = 'Rp 0';
        if (cartCount) cartCount.textContent = '0';
        return;
    }
    
    // Calculate total
    let total = 0;
    
    cartContainer.innerHTML = cartItems.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        return `
            <div class="cart-item" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background: white;
                border-radius: 8px;
                margin-bottom: 10px;
                border: 1px solid #eee;
            ">
                <div style="flex: 2;">
                    <div style="font-weight: 600; margin-bottom: 5px;">${item.name}</div>
                    <div style="font-size: 14px; color: #666;">Rp ${item.price.toLocaleString()}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button onclick="updateCartItem('${item.name}', ${item.quantity - 1})" style="
                        width: 30px;
                        height: 30px;
                        border: 1px solid #ddd;
                        border-radius: 50%;
                        background: white;
                        cursor: pointer;
                    ">-</button>
                    <span style="font-weight: 600; min-width: 30px; text-align: center;">${item.quantity}</span>
                    <button onclick="updateCartItem('${item.name}', ${item.quantity + 1})" style="
                        width: 30px;
                        height: 30px;
                        border: 1px solid #ddd;
                        border-radius: 50%;
                        background: white;
                        cursor: pointer;
                    ">+</button>
                </div>
                <div style="text-align: right; flex: 1;">
                    <div style="font-weight: 600;">Rp ${subtotal.toLocaleString()}</div>
                    <button onclick="removeFromCart('${item.name}')" style="
                        background: none;
                        border: none;
                        color: #ff6b35;
                        cursor: pointer;
                        font-size: 12px;
                        padding: 5px;
                    ">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Add total section
    cartContainer.innerHTML += `
        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px dashed #eee;">
            <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 18px;">
                <span>Total:</span>
                <span id="dynamicTotal">Rp ${total.toLocaleString()}</span>
            </div>
        </div>
    `;
    
    if (cartTotal) cartTotal.textContent = 'Rp ' + total.toLocaleString();
    if (cartCount) cartCount.textContent = cartItems.length.toString();
    
    // Update form total
    const totalInput = document.getElementById('total');
    if (totalInput) {
        totalInput.value = total;
    }
}

// Submit order
function submitOrder(event) {
    event.preventDefault();
    
    if (cartItems.length === 0) {
        alert('Keranjang kosong! Silakan pilih menu terlebih dahulu.');
        return false;
    }
    
    // Get form data
    const formData = new FormData(event.target);
    const customerData = {
        name: formData.get('nama') || formData.get('name') || 'Pelanggan',
        phone: formData.get('telepon') || formData.get('phone') || formData.get('hp') || '',
        address: formData.get('alamat') || formData.get('address') || ''
    };
    
    // Validate required fields
    if (!customerData.name || customerData.name.trim() === '') {
        alert('Harap masukkan nama Anda!');
        return false;
    }
    
    if (!customerData.phone || customerData.phone.trim() === '') {
        alert('Harap masukkan nomor telepon!');
        return false;
    }
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order object with STANDARD STRUCTURE
    const order = {
        id: 'PANG-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).substr(2, 3).toUpperCase(),
        customer: customerData, // STANDARD STRUCTURE
        products: cartItems.map(item => ({
            name: item.name,    // STANDARD STRUCTURE
            price: item.price,  // STANDARD STRUCTURE
            quantity: item.quantity // STANDARD STRUCTURE
        })),
        total: total,
        note: formData.get('note') || formData.get('catatan') || '',
        status: 'pending',
        timestamp: Date.now(),
        date: new Date().toLocaleString('id-ID')
    };
    
    console.log('Order data to be saved:', order);
    
    // Save order to localStorage
    saveOrder(order);
    
    // Clear cart
    clearCart();
    
    // Reset form
    event.target.reset();
    
    // Show success message
    showOrderSuccess(order.id, total);
    
    return false;
}

// Save order to localStorage
function saveOrder(order) {
    try {
        // Get existing orders
        const existingOrders = JSON.parse(localStorage.getItem('pangsit_orders') || '[]');
        
        // Add new order
        existingOrders.push(order);
        
        // Save back to localStorage
        localStorage.setItem('pangsit_orders', JSON.stringify(existingOrders));
        
        // Trigger event for admin panel
        localStorage.setItem('new_order', Date.now().toString());
        window.dispatchEvent(new CustomEvent('newOrder', { detail: order }));
        
        console.log('Order saved successfully:', order.id);
        return true;
    } catch (error) {
        console.error('Error saving order:', error);
        alert('Gagal menyimpan pesanan. Silakan coba lagi.');
        return false;
    }
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('pangsit_cart', JSON.stringify(cartItems));
}

// Load cart from localStorage
function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('pangsit_cart');
        if (savedCart) {
            cartItems = JSON.parse(savedCart);
            updateCartDisplay();
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// Show order success message
function showOrderSuccess(orderId, total) {
    // Create success modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 40px;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            animation: slideUp 0.4s ease;
        ">
            <div style="
                width: 80px;
                height: 80px;
                background: #25D366;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                color: white;
                font-size: 36px;
            ">
                <i class="fas fa-check"></i>
            </div>
            
            <h2 style="color: #2d3047; margin-bottom: 15px;">Pesanan Berhasil!</h2>
            
            <div style="
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: left;
            ">
                <div style="margin-bottom: 10px;">
                    <strong>ID Pesanan:</strong> ${orderId}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Total:</strong> Rp ${total.toLocaleString()}
                </div>
                <div>
                    <strong>Status:</strong> 
                    <span style="
                        background: #fff3cd;
                        color: #856404;
                        padding: 3px 10px;
                        border-radius: 15px;
                        font-size: 12px;
                        font-weight: bold;
                        margin-left: 10px;
                    ">MENUNGGU</span>
                </div>
            </div>
            
            <p style="color: #666; margin-bottom: 25px;">
                Pesanan Anda telah diterima. Admin akan segera menghubungi Anda untuk konfirmasi.
            </p>
            
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button onclick="window.location.href='index.html'" style="
                    padding: 12px 25px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    <i class="fas fa-home"></i> Ke Home
                </button>
                <button onclick="closeSuccessModal(this)" style="
                    padding: 12px 25px;
                    background: #ff6b35;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    <i class="fas fa-shopping-cart"></i> Pesan Lagi
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Close success modal
function closeSuccessModal(button) {
    const modal = button.closest('div[style*="position: fixed"]');
    if (modal) {
        modal.remove();
    }
}

// Show toast notification
function showToast(message) {
    // Remove existing toast
    const existingToast = document.getElementById('pangsitToast');
    if (existingToast) existingToast.remove();
    
    // Create toast
    const toast = document.createElement('div');
    toast.id = 'pangsitToast';
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2d3047;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 300px;
    `;
    
    toast.innerHTML = `
        <i class="fas fa-check-circle" style="color: #25D366;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Add animation style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentElement) toast.remove();
            }, 300);
        }
    }, 3000);
}

// Auto-save form data
function setupAutoSave() {
    const form = document.getElementById('orderForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // Save form data to localStorage
            const formData = {
                nama: form.querySelector('[name="nama"], [name="name"]')?.value || '',
                telepon: form.querySelector('[name="telepon"], [name="phone"], [name="hp"]')?.value || '',
                alamat: form.querySelector('[name="alamat"], [name="address"]')?.value || '',
                note: form.querySelector('[name="note"], [name="catatan"]')?.value || ''
            };
            
            localStorage.setItem('pangsit_form_data', JSON.stringify(formData));
        });
    });
    
    // Load saved form data
    loadSavedFormData();
}

// Load saved form data
function loadSavedFormData() {
    try {
        const savedData = localStorage.getItem('pangsit_form_data');
        if (savedData) {
            const formData = JSON.parse(savedData);
            const form = document.getElementById('orderForm');
            
            if (formData.nama) {
                const nameInput = form.querySelector('[name="nama"], [name="name"]');
                if (nameInput) nameInput.value = formData.nama;
            }
            
            if (formData.telepon) {
                const phoneInput = form.querySelector('[name="telepon"], [name="phone"], [name="hp"]');
                if (phoneInput) phoneInput.value = formData.telepon;
            }
            
            if (formData.alamat) {
                const addressInput = form.querySelector('[name="alamat"], [name="address"]');
                if (addressInput) addressInput.value = formData.alamat;
            }
            
            if (formData.note) {
                const noteInput = form.querySelector('[name="note"], [name="catatan"]');
                if (noteInput) noteInput.value = formData.note;
            }
        }
    } catch (error) {
        console.error('Error loading form data:', error);
    }
}

// Direct order function (for quick order)
function directOrder(productName, quantity = 1) {
    addToCart(productName, quantity);
    showToast(`${productName} (x${quantity}) ditambahkan!`);
}

// View cart summary
function viewCartSummary() {
    if (cartItems.length === 0) {
        alert('Keranjang kosong!');
        return;
    }
    
    let summary = 'RINGKASAN PESANAN:\n\n';
    let total = 0;
    
    cartItems.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        summary += `• ${item.name} (x${item.quantity}) = Rp ${subtotal.toLocaleString()}\n`;
    });
    
    summary += `\nTOTAL: Rp ${total.toLocaleString()}`;
    alert(summary);
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeOrderForm();
        setupAutoSave();
    });
} else {
    initializeOrderForm();
    setupAutoSave();
}

console.log('✅ Order Form System Ready!');
console.log('✅ Cart system initialized');
console.log('✅ Data will be saved with proper structure for admin panel');
