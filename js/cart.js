// Carrito de compras - Recuperar del localStorage
let cart = JSON.parse(localStorage.getItem('nocturneCart')) || [];

// Preferencias del usuario - Guardar última fragancia y cantidad seleccionadas
let userPreferences = JSON.parse(localStorage.getItem('nocturneUserPreferences')) || {
    lastFragrance: '',
    lastQuantity: 1
};

// Historial de compras
let purchaseHistory = JSON.parse(localStorage.getItem('nocturnePurchaseHistory')) || [];

// Mapeo de modelos a imágenes
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

// Función para agregar vela al carrito
function addToCart(modelName, price, weight, fragrance, quantity = 1) {
    // Verificar si ya existe el mismo producto con la misma fragancia
    const existingItem = cart.find(cartItem => 
        cartItem.type === 'candle' && cartItem.name === modelName && cartItem.fragrance === fragrance
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
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
    showAddedNotification();
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
    showAddedNotification();
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
function showAddedNotification() {
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

// Finalizar compra
function checkout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // Verificar si el usuario está logeado
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        // Mostrar modal de login
        if (typeof showLoginModal === 'function') {
            showLoginModal();
        } else {
            alert('Por favor, inicia sesión para finalizar tu compra');
            window.location.href = 'account.html';
        }
        return;
    }
    
    // Continuar con el proceso de compra
    proceedWithCheckout();
}

// Continuar con el checkout (llamado después de login o si ya está logeado)
function proceedWithCheckout() {
    const total = calculateGrandTotal();
    const currentUserData = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    
    // Guardar compra en el historial
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
    
    alert(`¡Compra finalizada!\n\nTotal: $${total.toLocaleString('es-AR')}\n\n¡Gracias por tu compra!`);
    
    // Vaciar el carrito
    cart = [];
    saveCart();
    updateCartUI();
    updateDropdownCart();
    
    // Redirigir al index
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1500);
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
    const fragranceQuantityInput = document.getElementById('fragrance-quantity-input');
    
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
                const quantityInput = document.getElementById('fragrance-quantity-input');
                const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

                if (!size) {
                    alert('Por favor, selecciona un tamaño');
                    return;
                }

                if (quantity < 1) {
                    alert('La cantidad debe ser al menos 1');
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
                    alert('Por favor, selecciona una fragancia');
                    return;
                }

                if (quantity < 1) {
                    alert('La cantidad debe ser al menos 1');
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
