// Variables globales
let products = JSON.parse(localStorage.getItem('products')) || [];
let editingProductId = null;
const exchangeRate = 4200;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadDashboard();
    loadProductsTable();
    updateStats();
});

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                showSection(targetId);
                
                // Update active nav
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Modal events
    document.getElementById('addProductBtn').addEventListener('click', openAddProductModal);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('saveProductBtn').addEventListener('click', saveProduct);
    
    // Search
    document.getElementById('searchProducts').addEventListener('input', searchProducts);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('productModal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Dashboard
function loadDashboard() {
    updateStats();
}

function updateStats() {
    const totalProducts = products.length;
    const totalOrders = parseInt(localStorage.getItem('totalOrders')) || 0;
    const totalRevenue = parseFloat(localStorage.getItem('totalRevenue')) || 0;
    
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
}

// Products Management
function loadProductsTable() {
    const tableBody = document.getElementById('productsTableBody');
    tableBody.innerHTML = '';
    
    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #666;">
                    No hay productos registrados. <a href="#" onclick="openAddProductModal()" style="color: #e74c3c;">Agregar el primero</a>
                </td>
            </tr>
        `;
        return;
    }
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${product.image}" alt="${product.name}" class="product-image-small">
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.priceUSD.toFixed(2)}</td>
            <td>$${(product.priceUSD * exchangeRate).toLocaleString('es-CO')} COP</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editProduct(${product.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Product Modal Functions
function openAddProductModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Agregar Producto';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').style.display = 'block';
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    editingProductId = productId;
    document.getElementById('modalTitle').textContent = 'Editar Producto';
    
    // Fill form with product data
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.priceUSD;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDescription').value = product.description || '';
    
    document.getElementById('productModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
    editingProductId = null;
}

function saveProduct() {
    const form = document.getElementById('productForm');
    const formData = new FormData(form);
    
    // Validate form
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const image = document.getElementById('productImage').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    
    if (!name || !category || !price || !image) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
    }
    
    if (price <= 0) {
        alert('El precio debe ser mayor a 0.');
        return;
    }
    
    const productData = {
        name,
        category,
        priceUSD: price,
        image,
        description
    };
    
    if (editingProductId) {
        // Update existing product
        const productIndex = products.findIndex(p => p.id === editingProductId);
        if (productIndex !== -1) {
            products[productIndex] = { ...products[productIndex], ...productData };
        }
    } else {
        // Add new product
        const newProduct = {
            id: Date.now(), // Simple ID generation
            ...productData
        };
        products.push(newProduct);
    }
    
    // Save to localStorage
    localStorage.setItem('products', JSON.stringify(products));
    
    // Update displays
    loadProductsTable();
    updateStats();
    closeModal();
    
    // Show success message
    const action = editingProductId ? 'actualizado' : 'agregado';
    alert(`Producto ${action} exitosamente.`);
}

function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`)) {
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        loadProductsTable();
        updateStats();
        alert('Producto eliminado exitosamente.');
    }
}

// Search functionality
function searchProducts() {
    const searchTerm = document.getElementById('searchProducts').value.toLowerCase();
    const tableBody = document.getElementById('productsTableBody');
    const rows = tableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const productName = row.cells[1]?.textContent.toLowerCase() || '';
        const productCategory = row.cells[2]?.textContent.toLowerCase() || '';
        
        if (productName.includes(searchTerm) || productCategory.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Initialize with sample products if none exist
function initializeSampleProducts() {
    if (products.length === 0) {
        products = [
            {
                id: 1,
                name: "Camiseta Básica",
                category: "hombre",
                priceUSD: 25,
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
                description: "Camiseta de algodón 100% de alta calidad"
            },
            {
                id: 2,
                name: "Vestido Elegante",
                category: "mujer",
                priceUSD: 85,
                image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
                description: "Vestido elegante para ocasiones especiales"
            },
            {
                id: 3,
                name: "Jeans Clásicos",
                category: "hombre",
                priceUSD: 65,
                image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
                description: "Jeans de corte clásico y cómodo"
            },
            {
                id: 4,
                name: "Blusa Casual",
                category: "mujer",
                priceUSD: 45,
                image: "https://images.unsplash.com/photo-1564257577-2d5d8b0c9c1a?w=400&h=400&fit=crop",
                description: "Blusa casual perfecta para el día a día"
            },
            {
                id: 5,
                name: "Reloj Deportivo",
                category: "accesorios",
                priceUSD: 120,
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
                description: "Reloj deportivo resistente al agua"
            },
            {
                id: 6,
                name: "Bolso de Cuero",
                category: "accesorios",
                priceUSD: 95,
                image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
                description: "Bolso de cuero genuino hecho a mano"
            }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }
}

// Call initialization
initializeSampleProducts();