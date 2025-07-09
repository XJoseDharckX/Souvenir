// Variables globales
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentCurrency = localStorage.getItem('currency') || 'USD';
const exchangeRate = 4200; // 1 USD = 4200 COP (ajustable)

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartCount();
    updateCurrencyDisplay();
    setupEventListeners();
    setupVideoControls();
});

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
    loadProducts();
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

// Product functions
function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        // Productos de ejemplo ampliados
        products = [
            // Ropa para Hombre
            {
                id: 1,
                name: "Camiseta Básica Blanca",
                category: "hombre",
                priceUSD: 25,
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
                description: "Camiseta de algodón 100% de alta calidad, perfecta para el uso diario"
            },
            {
                id: 2,
                name: "Jeans Clásicos Azules",
                category: "hombre",
                priceUSD: 65,
                image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
                description: "Jeans de corte clásico y cómodo, ideal para cualquier ocasión"
            },
            {
                id: 3,
                name: "Camisa Formal Blanca",
                category: "hombre",
                priceUSD: 45,
                image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
                description: "Camisa formal de algodón para ocasiones especiales"
            },
            {
                id: 4,
                name: "Polo Deportivo",
                category: "hombre",
                priceUSD: 35,
                image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop",
                description: "Polo deportivo transpirable, perfecto para actividades físicas"
            },
            {
                id: 5,
                name: "Chaqueta de Cuero",
                category: "hombre",
                priceUSD: 150,
                image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
                description: "Chaqueta de cuero genuino, estilo clásico y duradero"
            },
            
            // Ropa para Mujer
            {
                id: 6,
                name: "Vestido Elegante Negro",
                category: "mujer",
                priceUSD: 85,
                image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
                description: "Vestido elegante para ocasiones especiales y eventos formales"
            },
            {
                id: 7,
                name: "Blusa Casual Floral",
                category: "mujer",
                priceUSD: 45,
                image: "https://images.unsplash.com/photo-1564257577-2d5d8b0c9c1a?w=400&h=400&fit=crop",
                description: "Blusa casual con estampado floral, perfecta para el día a día"
            },
            {
                id: 8,
                name: "Falda Midi Plisada",
                category: "mujer",
                priceUSD: 55,
                image: "https://images.unsplash.com/photo-1583496661160-fb5886a13d77?w=400&h=400&fit=crop",
                description: "Falda midi plisada, elegante y versátil para múltiples ocasiones"
            },
            {
                id: 9,
                name: "Jeans Skinny Mujer",
                category: "mujer",
                priceUSD: 70,
                image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
                description: "Jeans skinny de corte moderno y cómodo ajuste"
            },
            {
                id: 10,
                name: "Blazer Profesional",
                category: "mujer",
                priceUSD: 95,
                image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
                description: "Blazer profesional para el ambiente laboral y reuniones"
            },
            {
                id: 11,
                name: "Vestido Casual Verano",
                category: "mujer",
                priceUSD: 60,
                image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop",
                description: "Vestido casual perfecto para los días de verano"
            },
            
            // Accesorios
            {
                id: 12,
                name: "Reloj Deportivo Digital",
                category: "accesorios",
                priceUSD: 120,
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
                description: "Reloj deportivo resistente al agua con múltiples funciones"
            },
            {
                id: 13,
                name: "Bolso de Cuero Marrón",
                category: "accesorios",
                priceUSD: 95,
                image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
                description: "Bolso de cuero genuino hecho a mano, elegante y duradero"
            },
            {
                id: 14,
                name: "Gafas de Sol Aviador",
                category: "accesorios",
                priceUSD: 75,
                image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
                description: "Gafas de sol estilo aviador con protección UV"
            },
            {
                id: 15,
                name: "Cinturón de Cuero Negro",
                category: "accesorios",
                priceUSD: 40,
                image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
                description: "Cinturón de cuero negro clásico, versátil y elegante"
            },
            {
                id: 16,
                name: "Bufanda de Lana",
                category: "accesorios",
                priceUSD: 30,
                image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop",
                description: "Bufanda de lana suave, perfecta para el clima frío"
            },
            {
                id: 17,
                name: "Mochila Urbana",
                category: "accesorios",
                priceUSD: 85,
                image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
                description: "Mochila urbana resistente con múltiples compartimentos"
            },
            {
                id: 18,
                name: "Collar de Plata",
                category: "accesorios",
                priceUSD: 65,
                image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
                description: "Collar de plata elegante con diseño minimalista"
            }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    displayProducts(products);
}

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
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Agregar al Carrito
                </button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

function filterProducts(category) {
    if (category === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(product => product.category === category);
        displayProducts(filtered);
    }
}

// Cart functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Animación de feedback
    const cartIcon = document.getElementById('cartIcon');
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
    }, 200);
}

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
    
    // Generar código de pedido
    const orderCode = 'SV' + Date.now().toString().slice(-6);
    
    // Calcular total
    const total = cart.reduce((sum, item) => sum + (item.priceUSD * item.quantity), 0);
    
    // Crear mensaje para WhatsApp
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
    
    // Número de WhatsApp (cambiar por el número real)
    const phoneNumber = '573001234567'; // Cambiar por tu número
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Limpiar carrito después del pedido
    clearCart();
    closeCart();
    
    // Mostrar confirmación
    alert(`¡Pedido enviado! Código: ${orderCode}\nSerás redirigido a WhatsApp para completar tu compra.`);
}

// Smooth scrolling para navegación
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

// Header scroll effect
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

// Video Controls
function setupVideoControls() {
    const video = document.querySelector('.hero-video');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const videoControls = document.querySelector('.video-controls');
    
    if (!video || !playPauseBtn || !muteBtn || !videoControls) return;
    
    // Control de reproducir/pausar
    playPauseBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            video.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });
    
    // Control de silenciar/activar sonido
    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        muteBtn.innerHTML = video.muted ? 
            '<i class="fas fa-volume-mute"></i>' : 
            '<i class="fas fa-volume-up"></i>';
    });
    
    // Auto-ocultar controles
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