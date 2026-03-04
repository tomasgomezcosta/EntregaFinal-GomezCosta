// ============================================
// CARRITO DE COMPRAS - SISTEMA DE E-COMMERCE
// ============================================

// Variables globales para gestión del carrito
// Recuperar carrito del localStorage o inicializar vacío
let cart = JSON.parse(localStorage.getItem('nocturneCart')) || [];

// Preferencias del usuario - Guardar última fragancia y cantidad seleccionadas
// Esto permite precargar los valores en los formularios para mejor experiencia
let userPreferences = JSON.parse(localStorage.getItem('nocturneUserPreferences')) || {
    lastFragrance: '',
    lastQuantity: 1
};

// Historial de compras del usuario
// Almacena todas las transacciones realizadas
let purchaseHistory = JSON.parse(localStorage.getItem('nocturnePurchaseHistory')) || [];

// Mapeo de modelos a imágenes
// Asocia cada modelo de vela con su imagen correspondiente
const modelImages = {
    'Staccato': '../assets/model1.png',
    'Legato': '../assets/model2.png',
    'Tenuto': '../assets/model3.png',
    'Crescendo': '../assets/model4.png',
    'Fermata': '../assets/model5.png',
    'Fortissimo': '../assets/model6.png',
    'Maestoso': '../assets/model7.png',
    'Brillante': '../assets/model8.png',
    'Grandioso': '../assets/model9.png'
};

// Mapeo de fragancias a imágenes
const fragranceImages = {
    'White Flowers': '../assets/WhiteFlowers-Label.png',
    'Lemongrass': '../assets/Lemongrass-Label.png',
    'Lavender': '../assets/Lavender-Label.png',
    'Jasmine': '../assets/Jasmine-Label.png',
    'Vanilla': '../assets/Vanilla-Label.png',
    'Freesias': '../assets/Freesias-Label.png',
    'Gardenia': '../assets/Gardenia-Label.png',
    'Coconut': '../assets/Coconut-Label.png',
    'Orange Blossom': '../assets/OrangeBlossom-Label.png'
};

// Función para obtener la ruta absoluta de la imagen
// Detecta la profundidad de la página actual y ajusta la ruta
function getAbsoluteImagePath(relativePath) {
    // Obtener la ruta actual
    const currentPath = window.location.pathname;
    
    // Contar cuántos niveles de profundidad tiene la URL
    const depth = currentPath.split('/').filter(part => part && part !== 'index.html').length - 1;
    
    // Si estamos en la raíz (index.html) o en /pages/
    if (depth === 0 || currentPath.includes('index.html')) {
        return relativePath.replace('../', './');
    } else if (depth === 1 || (currentPath.includes('/pages/') && !currentPath.includes('/pages/Models/') && !currentPath.includes('/pages/fragances/'))) {
        return relativePath;
    } else {
        // Para páginas dentro de subcarpetas (Models/, fragances/)
        return relativePath;
    }
}

// ============================================
// FUNCIONES PRINCIPALES DEL CARRITO
// ============================================

/**
 * Añade una vela al carrito de compras
 * @param {string} modelName - Nombre del modelo de vela
 * @param {number} price - Precio unitario
 * @param {string} weight - Peso de la vela
 * @param {string} fragrance - Fragancia seleccionada
 * @param {number} quantity - Cantidad a agregar (por defecto 1)
 */
function addToCart(modelName, price, weight, fragrance, quantity = 1) {
    // Verificar si ya existe el mismo producto con la misma fragancia
    const existingItem = cart.find(cartItem => 
        cartItem.type === 'candle' && cartItem.name === modelName && cartItem.fragrance === fragrance
    );

    if (existingItem) {
        // Si existe, incrementar cantidad
        existingItem.quantity += quantity;
    } else {
        // Si no existe, crear nuevo item
        const item = {
            id: Date.now(),
            type: 'candle',
            name: modelName,
            price: price,
            weight: weight,
            fragrance: fragrance,
            quantity: quantity,
            image: modelImages[modelName] || '../assets/model1.png'
        };
        cart.push(item);
    }

    saveCart();
    updateCartUI();
    updateDropdownCart();
    showAddedNotification({
        type: 'candle',
        name: modelName,
        fragrance: fragrance,
        quantity: quantity,
        image: modelImages[modelName] || '../assets/model1.png'
    });
}

// Función para agregar fragancia al carrito
function addFragranceToCart(fragranceName, size, price, quantity = 1) {
    // Verificar si ya existe la misma fragancia con el mismo tamaño
    const existingItem = cart.find(cartItem => 
        cartItem.type === 'fragrance' && cartItem.name === fragranceName && cartItem.size === size
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        const item = {
            id: Date.now(),
            type: 'fragrance',
            name: fragranceName,
            price: price,
            size: size,
            quantity: quantity,
            image: fragranceImages[fragranceName] || '../assets/Lemongrass-Label.png'
        };
        cart.push(item);
    }

    saveCart();
    updateCartUI();
    updateDropdownCart();
    showAddedNotification({
        type: 'fragrance',
        name: fragranceName,
        size: size,
        quantity: quantity,
        image: fragranceImages[fragranceName] || '../assets/Lemongrass-Label.png'
    });
}

// Guardar carrito en localStorage
function saveCart() {
    localStorage.setItem('nocturneCart', JSON.stringify(cart));
}

// Guardar preferencias del usuario en localStorage
function saveUserPreferences() {
    localStorage.setItem('nocturneUserPreferences', JSON.stringify(userPreferences));
}

// Guardar historial de compras en localStorage
function savePurchaseHistory() {
    localStorage.setItem('nocturnePurchaseHistory', JSON.stringify(purchaseHistory));
}

// Actualizar la interfaz del carrito
function updateCartUI() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    
    cartCountElements.forEach(element => {
        element.textContent = cartCount;
        if (cartCount > 0) {
            element.style.display = 'flex';
        } else {
            element.style.display = 'none';
        }
    });
}

// Actualizar carrito desplegable
function updateDropdownCart() {
    const dropdownCart = document.querySelector('.cart-dropdown-items');
    const dropdownTotal = document.querySelector('.cart-dropdown-total');
    
    if (!dropdownCart) return;
    
    if (cart.length === 0) {
        dropdownCart.innerHTML = '<p class="empty-dropdown-cart">Tu carrito está vacío</p>';
        if (dropdownTotal) dropdownTotal.textContent = '$0';
        return;
    }
    
    let total = 0;
    dropdownCart.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        // Determinar la imagen según el tipo de producto
        let imagePath;
        if (item.type === 'fragrance') {
            imagePath = item.image || fragranceImages[item.name] || '../assets/Lemongrass-Label.png';
        } else {
            imagePath = item.image || modelImages[item.name] || '../assets/model1.png';
        }
        
        // Determinar la información adicional según el tipo
        let additionalInfo;
        if (item.type === 'fragrance') {
            additionalInfo = `${item.size}`;
        } else {
            additionalInfo = `${item.fragrance} - ${item.weight}g`;
        }
        
        return `
            <div class="dropdown-cart-item">
                <img src="${imagePath}" alt="${item.name}" class="dropdown-item-image">
                <div class="dropdown-item-info">
                    <strong>${item.name}</strong>
                    <small>${additionalInfo}</small>
                    <span>$${item.price.toLocaleString('es-AR')} x ${item.quantity}</span>
                </div>
                <button class="remove-dropdown-btn" onclick="removeFromCart(${item.id})" title="Eliminar">×</button>
            </div>
        `;
    }).join('');
    
    if (dropdownTotal) {
        dropdownTotal.textContent = `$${total.toLocaleString('es-AR')}`;
    }
}

// Mostrar notificación de producto agregado
function showAddedNotification(product) {
    // Si no se proporciona información del producto, usar notificación simple
    if (!product) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <p>✓ Producto agregado al carrito</p>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
        return;
    }

    // Obtener la ruta correcta de la imagen
    const imagePath = getAbsoluteImagePath(product.image);

    // Crear el HTML para mostrar en la notificación
    let htmlContent = `
        <div style="text-align: center;">
            <img src="${imagePath}" alt="${product.name}" 
                 style="max-width: 150px; height: auto; margin: 10px auto; border-radius: 8px; display: block;" 
                 onerror="this.style.display='none'">
            <h3 style="margin: 10px 0; color: #333;">${product.name}</h3>
    `;

    if (product.type === 'candle' && product.fragrance) {
        htmlContent += `<p style="margin: 5px 0; color: #666;">Fragancia: <strong>${product.fragrance}</strong></p>`;
    } else if (product.type === 'fragrance' && product.size) {
        htmlContent += `<p style="margin: 5px 0; color: #666;">Tamaño: <strong>${product.size}</strong></p>`;
    }

    htmlContent += `
            <p style="margin: 5px 0; color: #666;">Cantidad: <strong>${product.quantity}</strong></p>
        </div>
    `;

    // Usar SweetAlert2 para mostrar la notificación
    Swal.fire({
        title: '¡Agregado al carrito!',
        html: htmlContent,
        icon: 'success',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'center',
        backdrop: true,
        showClass: {
            popup: 'animate__animated animate__zoomIn animate__faster'
        },
        hideClass: {
            popup: 'animate__animated animate__zoomOut animate__faster'
        },
        customClass: {
            popup: 'cart-notification-popup'
        }
    });
}

// Eliminar item del carrito
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartUI();
    updateDropdownCart();
    displayCartItems();
}

// Actualizar cantidad
function updateQuantity(itemId, newQuantity) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(itemId);
        } else {
            item.quantity = newQuantity;
            saveCart();
            updateCartUI();
            updateDropdownCart();
            displayCartItems();
        }
    }
}

// Calcular total del carrito
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Calcular subtotal (sin envío ni impuestos)
function calculateSubtotal() {
    return calculateTotal();
}

// Calcular envío
function calculateShipping() {
    const subtotal = calculateSubtotal();
    if (subtotal === 0) return 0;
    if (subtotal > 100000) return 0; // Envío gratis en compras mayores a $100,000
    return 5000; // Costo fijo de envío
}

// Calcular descuento (15% sobre $300,000)
function calculateDiscount() {
    const subtotal = calculateSubtotal();
    if (subtotal > 300000) {
        return Math.round(subtotal * 0.15);
    }
    return 0;
}

// Calcular impuestos (21% IVA sobre subtotal - descuento)
function calculateTaxes() {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return Math.round((subtotal - discount) * 0.21);
}

// Calcular total final
function calculateGrandTotal() {
    return calculateSubtotal() - calculateDiscount() + calculateShipping() + calculateTaxes();
}

// Mostrar items en la página del carrito
function displayCartItems() {
    const cartItemsContainer = document.querySelector('.cart-items-container');
    const subtotalElement = document.querySelector('.cart-subtotal');
    const discountElement = document.querySelector('.cart-discount');
    const shippingElement = document.querySelector('.cart-shipping');
    const taxesElement = document.querySelector('.cart-taxes');
    const grandTotalElement = document.querySelector('.cart-grand-total');
    
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        if (subtotalElement) subtotalElement.textContent = '$0';
        if (discountElement) discountElement.textContent = '$0';
        if (shippingElement) shippingElement.textContent = '$0';
        if (taxesElement) taxesElement.textContent = '$0';
        if (grandTotalElement) grandTotalElement.textContent = '$0';
        return;
    }

    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const shipping = calculateShipping();
    const taxes = calculateTaxes();
    const grandTotal = calculateGrandTotal();
    
    cartItemsContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        
        // Determinar la imagen según el tipo de producto
        let imagePath;
        if (item.type === 'fragrance') {
            imagePath = item.image || fragranceImages[item.name] || '../assets/Lemongrass-Label.png';
        } else {
            imagePath = item.image || modelImages[item.name] || '../assets/model1.png';
        }
        
        // Construir la información específica del producto
        let productDetails;
        if (item.type === 'fragrance') {
            productDetails = `
                <h3>${item.name}</h3>
                <p>Tamaño: ${item.size}</p>
                <p class="item-price">$${item.price.toLocaleString('es-AR')}</p>
            `;
        } else {
            productDetails = `
                <h3>${item.name}</h3>
                <p>Fragancia: ${item.fragrance}</p>
                <p>Peso: ${item.weight}g</p>
                <p class="item-price">$${item.price.toLocaleString('es-AR')}</p>
            `;
        }
        
        return `
            <div class="cart-item">
                <img src="${imagePath}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    ${productDetails}
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Eliminar</button>
                </div>
                <div class="cart-item-total">
                    <strong>$${itemTotal.toLocaleString('es-AR')}</strong>
                </div>
            </div>
        `;
    }).join('');

    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toLocaleString('es-AR')}`;
    if (discountElement) {
        const discountRow = discountElement.closest('.summary-row');
        if (discount > 0) {
            discountElement.textContent = `-$${discount.toLocaleString('es-AR')}`;
            if (discountRow) discountRow.style.display = 'flex';
        } else {
            if (discountRow) discountRow.style.display = 'none';
        }
    }
    if (shippingElement) {
        shippingElement.textContent = shipping === 0 && subtotal > 0 ? 'Gratis' : `$${shipping.toLocaleString('es-AR')}`;
    }
    if (taxesElement) taxesElement.textContent = `$${taxes.toLocaleString('es-AR')}`;
    if (grandTotalElement) grandTotalElement.textContent = `$${grandTotal.toLocaleString('es-AR')}`;
}

// Limpiar todo el carrito
function clearCart() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart = [];
        saveCart();
        updateCartUI();
        updateDropdownCart();
        displayCartItems();
    }
}

// ============================================
// PROCESO DE COMPRA (CHECKOUT)
// ============================================

/**
 * Inicia el proceso de finalización de compra
 * Valida que haya productos en el carrito y que el usuario esté autenticado
 */
function checkout() {
    // Validar que el carrito no esté vacío
    if (cart.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Carrito vacío',
            text: 'No hay productos en tu carrito'
        });
        return;
    }
    
    // Verificar si el usuario está logeado
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        // Mostrar modal de login
        if (typeof showLoginModal === 'function') {
            showLoginModal();
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Iniciar sesión',
                text: 'Por favor, inicia sesión para finalizar tu compra',
                confirmButtonText: 'Ir a cuenta'
            }).then(() => {
                window.location.href = 'account.html';
            });
        }
        return;
    }
    
    // Continuar con el proceso de compra
    proceedWithCheckout();
}

/**
 * Continúa con el checkout después de validar autenticación
 * Procesa el pago, guarda el historial y limpia el carrito
 */
function proceedWithCheckout() {
    const total = calculateGrandTotal();
    const currentUserData = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    
    // Crear objeto de compra con todos los detalles
    const purchase = {
        id: Date.now(),
        date: new Date().toISOString(),
        userEmail: currentUserData ? currentUserData.email : 'invitado',
        items: [...cart],
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        shipping: calculateShipping(),
        taxes: calculateTaxes(),
        total: total
    };
    
    purchaseHistory.push(purchase);
    savePurchaseHistory();
    
    Swal.fire({
        icon: 'success',
        title: '¡Compra finalizada!',
        html: `
            <p>Total: <strong>$${total.toLocaleString('es-AR')}</strong></p>
            <p>¡Gracias por tu compra!</p>
            <p>Recibirás un email de confirmación pronto.</p>
        `,
        confirmButtonText: 'Aceptar'
    }).then(() => {
        // Vaciar el carrito
        cart = [];
        saveCart();
        updateCartUI();
        updateDropdownCart();
        
        // Redirigir al index
        window.location.href = '../index.html';
    });
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();
    updateDropdownCart();
    
    // Si estamos en la página del carrito
    if (document.querySelector('.cart-items-container')) {
        displayCartItems();
    }

    // Resetear campos al cargar la página (para modelos de velas)
    const fragranceSelect = document.getElementById('fragrance-select');
    const quantityInput = document.getElementById('quantity-input');
    
    if (fragranceSelect) {
        fragranceSelect.value = '';
    }
    
    if (quantityInput) {
        quantityInput.value = 1;
    }

    // Resetear campos al cargar la página (para fragancias)
    const sizeSelect = document.getElementById('size-select');
    const fragranceQuantityInput = document.getElementById('quantity-input');
    
    if (sizeSelect) {
        sizeSelect.value = '';
    }
    
    if (fragranceQuantityInput) {
        fragranceQuantityInput.value = 1;
    }

    // Agregar listener al botón de añadir al carrito (MODELOS DE VELAS)
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        const productType = addToCartBtn.dataset.productType;
        
        if (productType === 'fragrance') {
            // Manejo para fragancias
            addToCartBtn.addEventListener('click', function() {
                const fragranceName = this.dataset.productName;
                const sizeSelect = document.getElementById('size-select');
                const selectedOption = sizeSelect.options[sizeSelect.selectedIndex];
                const size = selectedOption.value;
                const price = parseInt(selectedOption.dataset.price);
                const quantityInput = document.getElementById('quantity-input');
                const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

                if (!size) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Tamaño requerido',
                        text: 'Por favor, selecciona un tamaño'
                    });
                    return;
                }

                if (quantity < 1) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Cantidad inválida',
                        text: 'La cantidad debe ser al menos 1'
                    });
                    return;
                }

                addFragranceToCart(fragranceName, size, price, quantity);
                
                // Resetear campos después de agregar al carrito
                sizeSelect.value = '';
                if (quantityInput) {
                    quantityInput.value = 1;
                }
            });
        } else {
            // Manejo para velas (comportamiento original)
            addToCartBtn.addEventListener('click', function() {
                const modelName = this.dataset.model;
                const price = parseInt(this.dataset.price);
                const weight = this.dataset.weight;
                const fragranceSelect = document.getElementById('fragrance-select');
                const selectedFragrance = fragranceSelect.value;
                const quantityInput = document.getElementById('quantity-input');
                const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

                if (!selectedFragrance) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Fragancia requerida',
                        text: 'Por favor, selecciona una fragancia'
                    });
                    return;
                }

                if (quantity < 1) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Cantidad inválida',
                        text: 'La cantidad debe ser al menos 1'
                    });
                    return;
                }

                // Guardar preferencias antes de agregar al carrito
                userPreferences.lastFragrance = selectedFragrance;
                userPreferences.lastQuantity = quantity;
                saveUserPreferences();

                addToCart(modelName, price, weight, selectedFragrance, quantity);
                
                // Resetear campos después de agregar al carrito
                fragranceSelect.value = '';
                if (quantityInput) {
                    quantityInput.value = 1;
                }
            });
        }
    }
    
    // Carrito desplegable - mostrar/ocultar
    const cartIcon = document.querySelector('.cart-icon-wrapper');
    const cartDropdown = document.querySelector('.cart-dropdown');
    
    if (cartIcon && cartDropdown) {
        cartIcon.addEventListener('mouseenter', function() {
            cartDropdown.classList.add('show');
        });
        
        cartIcon.addEventListener('mouseleave', function(e) {
            // Verificar si el mouse se movió al dropdown
            const relatedTarget = e.relatedTarget;
            if (!relatedTarget || !cartDropdown.contains(relatedTarget)) {
                setTimeout(() => {
                    if (!cartDropdown.matches(':hover')) {
                        cartDropdown.classList.remove('show');
                    }
                }, 100);
            }
        });
        
        cartDropdown.addEventListener('mouseleave', function() {
            cartDropdown.classList.remove('show');
        });
    }
});
