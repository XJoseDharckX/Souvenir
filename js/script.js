// Variables globales
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentCurrency = localStorage.getItem('currency') || 'USD';
const exchangeRate = 4200;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadProductsFromServer();
    updateCartCount();
    updateCurrencyDisplay();
    setupEventListeners();
    setupVideoControls();
    
    // Verificar actualizaciones cada 30 segundos
    setInterval(checkForProductUpdates, 30000);
});

// Cargar productos desde el servidor
async function loadProductsFromServer() {
    try {
        const response = await fetch('products.json');
        if (response.ok) {
            const data = await response.json();
            products = data.products || [];
            localStorage.setItem('products', JSON.stringify(products));
            localStorage.setItem('productsLastUpdated', data.lastUpdated);
        } else {
            // Fallback a localStorage si no se puede cargar desde servidor
            loadProductsFromLocalStorage();
        }
    } catch (error) {
        console.log('No se pudo cargar desde servidor, usando datos locales');
        loadProductsFromLocalStorage();
    }
    
    displayProducts(products);
}

// Verificar actualizaciones de productos
async function checkForProductUpdates() {
    try {
        const response = await fetch('products.json');
        if (response.ok) {
            const data = await response.json();
            const lastUpdated = localStorage.getItem('productsLastUpdated');
            
            if (data.lastUpdated !== lastUpdated) {
                products = data.products || [];
                localStorage.setItem('products', JSON.stringify(products));
                localStorage.setItem('productsLastUpdated', data.lastUpdated);
                displayProducts(products);
                console.log('Productos actualizados desde el servidor');
            }
        }
    } catch (error) {
        console.log('Error verificando actualizaciones:', error);
    }
}

// Cargar productos desde localStorage (fallback)
function loadProductsFromLocalStorage() {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
    } else {
        // Productos de ejemplo si no hay nada
        products = [
            {
                id: 1,
                name: "Camiseta Básica Blanca",
                category: "hombre",
                priceUSD: 25,
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
                description: "Camiseta de algodón 100% de alta calidad"
            }
        ];
    }
}

// Event Listeners
function setupEventListeners() {
    // Currency toggle
    document.getElementById('currencyBtn').addEventListener('click', toggleCurrency);
    
    // Cart modal
    document.getElementById('cartIcon').addEventListener('click', openCart);
    document.getElementById('closeCart').addEventListener('click', closeCart);
    document.getElementById('clearCart').addEventListener('click', clearCart);
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProducts(this.dataset.filter);
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('cartModal');
        if (event.target === modal) {
            closeCart();
        }
    });
}

// Currency functions
function toggleCurrency() {
    currentCurrency = currentCurrency === 'USD' ? 'COP' : 'USD';
    localStorage.setItem('currency', currentCurrency);
    updateCurrencyDisplay();
    displayProducts(products);
    updateCartDisplay();
}

function updateCurrencyDisplay() {
    document.getElementById('currencyText').textContent = currentCurrency;
}

function formatPrice(priceUSD) {
    if (currentCurrency === 'USD') {
        return `$${priceUSD.toFixed(2)}`;
    } else {
        const priceCOP = priceUSD * exchangeRate;
        return `$${priceCOP.toLocaleString('es-CO')} COP`;
    }
}

function getSecondaryPrice(priceUSD) {
    if (currentCurrency === 'USD') {
        const priceCOP = priceUSD * exchangeRate;
        return `($${priceCOP.toLocaleString('es-CO')} COP)`;
    } else {
        return `($${priceUSD.toFixed(2)} USD)`;
    }
}

// Mostrar productos con selector de cantidad
function displayProducts(productsToShow) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card fade-in';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/400x400?text=Imagen+No+Disponible'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
                <div class="product-prices">
                    <span class="price">${formatPrice(product.priceUSD)}</span>
                    <span class="price-secondary">${getSecondaryPrice(product.priceUSD)}</span>
                </div>
                <p class="product-description">${product.description}</p>
                
                <!-- Selector de cantidad -->
                <div class="quantity-selector">
                    <label for="quantity-${product.id}">Cantidad:</label>
                    <div class="quantity-controls">
                        <button type="button" class="quantity-btn" onclick="updateProductQuantity(${product.id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" id="quantity-${product.id}" class="quantity-input" value="1" min="1" max="99">
                        <button type="button" class="quantity-btn" onclick="updateProductQuantity(${product.id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <button class="add-to-cart" onclick="addToCartWithQuantity(${product.id})">
                    <i class="fas fa-cart-plus"></i> Agregar al Carrito
                </button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Actualizar cantidad en selector de producto
function updateProductQuantity(productId, change) {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    let currentValue = parseInt(quantityInput.value) || 1;
    let newValue = currentValue + change;
    
    if (newValue < 1) newValue = 1;
    if (newValue > 99) newValue = 99;
    
    quantityInput.value = newValue;
}

// Agregar al carrito con cantidad específica
function addToCartWithQuantity(productId) {
    const product = products.find(p => p.id === productId);
    const quantityInput = document.getElementById(`quantity-${productId}`);
    const quantity = parseInt(quantityInput.value) || 1;
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Reset quantity selector
    quantityInput.value = 1;
    
    // Animación de feedback
    const cartIcon = document.getElementById('cartIcon');
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
    }, 200);
    
    // Mostrar mensaje de confirmación
    showAddToCartMessage(product.name, quantity);
}

// Mostrar mensaje de confirmación
function showAddToCartMessage(productName, quantity) {
    const message = document.createElement('div');
    message.className = 'cart-notification';
    message.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${quantity}x ${productName} agregado al carrito</span>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(message);
        }, 300);
    }, 3000);
}

function filterProducts(category) {
    if (category === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(product => product.category === category);
        displayProducts(filtered);
    }
}

// Mantener las funciones del carrito existentes...
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        }
    }
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function openCart() {
    document.getElementById('cartModal').style.display = 'block';
    updateCartDisplay();
}

function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Tu carrito está vacío</p>';
        cartTotal.textContent = formatPrice(0);
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.priceUSD * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x80?text=Img'">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${formatPrice(item.priceUSD)}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = formatPrice(total);
}

function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
}

function checkout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    const orderCode = 'SV' + Date.now().toString().slice(-6);
    const total = cart.reduce((sum, item) => sum + (item.priceUSD * item.quantity), 0);
    
    let message = `🛍️ *NUEVO PEDIDO - Suvenil*\n\n`;
    message += `📋 *Código de Pedido:* ${orderCode}\n\n`;
    message += `🛒 *Productos:*\n`;
    
    cart.forEach(item => {
        message += `• ${item.name} x${item.quantity} - ${formatPrice(item.priceUSD * item.quantity)}\n`;
    });
    
    message += `\n💰 *Total:* ${formatPrice(total)}`;
    
    if (currentCurrency === 'USD') {
        message += ` (${formatPrice(total * exchangeRate).replace('$', '$').replace(' COP', '')} COP)`;
    } else {
        message += ` ($${total.toFixed(2)} USD)`;
    }
    
    message += `\n\n📱 *Enviado desde Suvenil*`;
    
    const phoneNumber = '573044386586';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    clearCart();
    closeCart();
    
    alert(`¡Pedido enviado! Código: ${orderCode}\nSerás redirigido a WhatsApp para completar tu compra.`);
}

// Resto de funciones existentes (smooth scrolling, header scroll, video controls)...
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

function setupVideoControls() {
    const video = document.querySelector('.hero-video');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const videoControls = document.querySelector('.video-controls');
    
    if (!video || !playPauseBtn || !muteBtn || !videoControls) return;
    
    playPauseBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            video.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });
    
    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        muteBtn.innerHTML = video.muted ? 
            '<i class="fas fa-volume-mute"></i>' : 
            '<i class="fas fa-volume-up"></i>';
    });
    
    let hideControlsTimeout;
    
    const showControls = () => {
        videoControls.style.opacity = '1';
        clearTimeout(hideControlsTimeout);
        hideControlsTimeout = setTimeout(() => {
            videoControls.style.opacity = '0';
        }, 3000);
    };
    
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.addEventListener('mousemove', showControls);
        heroSection.addEventListener('click', showControls);
    }
    
    videoControls.addEventListener('mouseenter', () => {
        videoControls.style.opacity = '1';
        clearTimeout(hideControlsTimeout);
    });
    
    videoControls.addEventListener('mouseleave', () => {
        hideControlsTimeout = setTimeout(() => {
            videoControls.style.opacity = '0';
        }, 1000);
    });
}