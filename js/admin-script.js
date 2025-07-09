// Variables globales
let products = JSON.parse(localStorage.getItem('products')) || [];
let editingProductId = null;
const exchangeRate = 4200;
let currentImageData = null;

// Inicialización
// Verificación de autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación antes de cargar el admin
    if (!isAdminAuthenticated()) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    setupEventListeners();
    loadDashboard();
    loadProductsTable();
    updateStats();
    setupImageUpload();
    addLogoutButton();
});

// Función para verificar autenticación
function isAdminAuthenticated() {
    const sessionData = localStorage.getItem('admin_session');
    
    if (!sessionData) {
        return false;
    }
    
    try {
        const session = JSON.parse(sessionData);
        const now = Date.now();
        
        if (now > session.expires) {
            localStorage.removeItem('admin_session');
            return false;
        }
        
        return session.authenticated === true;
    } catch (error) {
        localStorage.removeItem('admin_session');
        return false;
    }
}

// Agregar botón de logout
function addLogoutButton() {
    const adminActions = document.querySelector('.admin-actions');
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn-secondary';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión';
    logoutBtn.onclick = function() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            localStorage.removeItem('admin_session');
            localStorage.removeItem('admin_remember');
            window.location.href = 'admin-login.html';
        }
    };
    
    adminActions.appendChild(logoutBtn);
}

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

// Configurar eventos de subida de imágenes
function setupImageUpload() {
    const fileInput = document.getElementById('productImageFile');
    const uploadArea = document.getElementById('fileUploadArea');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeImageBtn = document.getElementById('removeImage');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Cambio de tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Actualizar botones
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Actualizar contenido
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabName + '-tab').classList.add('active');
            
            // Limpiar datos
            currentImageData = null;
            imagePreview.style.display = 'none';
            document.getElementById('productImageUrl').value = '';
        });
    });
    
    // Click en área de subida
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    // Selección de archivo
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
    
    // Remover imagen
    removeImageBtn.addEventListener('click', () => {
        currentImageData = null;
        imagePreview.style.display = 'none';
        fileInput.value = '';
    });
}

// Manejar selección de archivo
function handleFileSelect(file) {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido.');
        return;
    }
    
    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB.');
        return;
    }
    
    // Leer archivo
    const reader = new FileReader();
    reader.onload = function(e) {
        currentImageData = e.target.result;
        
        // Mostrar preview
        const previewImg = document.getElementById('previewImg');
        const imagePreview = document.getElementById('imagePreview');
        
        previewImg.src = currentImageData;
        imagePreview.style.display = 'block';
    };
    
    reader.readAsDataURL(file);
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
    currentImageData = null;
    document.getElementById('modalTitle').textContent = 'Agregar Producto';
    document.getElementById('productForm').reset();
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('productModal').style.display = 'block';
    
    // Resetear tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="upload"]').classList.add('active');
    document.getElementById('upload-tab').classList.add('active');
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
    document.getElementById('productDescription').value = product.description || '';
    
    // Manejar imagen existente
    if (product.image.startsWith('data:')) {
        // Es una imagen en base64
        currentImageData = product.image;
        document.getElementById('previewImg').src = product.image;
        document.getElementById('imagePreview').style.display = 'block';
        
        // Activar tab de upload
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelector('.tab-btn[data-tab="upload"]').classList.add('active');
        document.getElementById('upload-tab').classList.add('active');
    } else {
        // Es una URL
        document.getElementById('productImageUrl').value = product.image;
        
        // Activar tab de URL
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelector('.tab-btn[data-tab="url"]').classList.add('active');
        document.getElementById('url-tab').classList.add('active');
    }
    
    document.getElementById('productModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
    editingProductId = null;
    currentImageData = null;
}

function saveProduct() {
    // Validar form
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value.trim();
    
    // Obtener imagen según el tab activo
    let imageUrl = '';
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    
    if (activeTab === 'upload') {
        if (currentImageData) {
            imageUrl = currentImageData; // Base64 data URL
        } else if (editingProductId) {
            // Mantener imagen existente si está editando
            const existingProduct = products.find(p => p.id === editingProductId);
            imageUrl = existingProduct ? existingProduct.image : '';
        }
    } else {
        imageUrl = document.getElementById('productImageUrl').value.trim();
    }
    
    if (!name || !category || !price || !imageUrl) {
        alert('Por favor, completa todos los campos obligatorios incluyendo la imagen.');
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
        image: imageUrl,
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
            id: Date.now(),
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