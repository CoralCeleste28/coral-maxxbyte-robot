/**
 * BiteBot ordering flow: Home → Login → Restaurant → Order → Payment → Review → Order Status
 */
const TAX_RATE = 0.08;
const STATUS_UPDATE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const bitebotMenu = {
    taco: { id: 'taco', name: 'Taco Combo', price: 15, image: 'tacoImage' },
    butterChicken: { id: 'butterChicken', name: 'Butter Chicken', price: 15, image: 'butterChickenImage' }
};

let bitebotOrder = {
    items: [],
    payment: null,
    deliveryAddress: null,
    orderId: null,
    status: 'PLACED'
};

function getOrderSubtotal() {
    return bitebotOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getOrderTax() {
    return Math.round(getOrderSubtotal() * TAX_RATE * 100) / 100;
}

function getOrderTotal() {
    return getOrderSubtotal() + getOrderTax();
}

function addToOrder(mealId) {
    const menuItem = bitebotMenu[mealId];
    if (!menuItem) return;
    const existing = bitebotOrder.items.find(i => i.id === menuItem.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        bitebotOrder.items.push({
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
            imageUrl: config.assets[menuItem.image]
        });
    }
    goToOrderScreen();
}

function setOrderQuantity(mealId, delta) {
    const item = bitebotOrder.items.find(i => i.id === mealId);
    if (!item) return;
    item.quantity = Math.max(0, item.quantity + delta);
    if (item.quantity === 0) {
        bitebotOrder.items = bitebotOrder.items.filter(i => i.id !== mealId);
    }
    renderOrderScreen();
}

function renderOrderScreen() {
    const listEl = document.getElementById('order-items-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    bitebotOrder.items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'order-item-row';
        div.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" class="order-item-thumb">
            <div class="order-item-info">
                <strong>${item.name}</strong>
                <span class="order-item-price">$${item.price.toFixed(2)}</span>
            </div>
            <div class="order-item-qty">
                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="setOrderQuantity('${item.id}', -1)">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="setOrderQuantity('${item.id}', 1)">+</button>
            </div>
        `;
        listEl.appendChild(div);
    });
    const subtotal = getOrderSubtotal();
    const tax = getOrderTax();
    const total = getOrderTotal();
    const subtotalEl = document.getElementById('order-subtotal');
    const taxesEl = document.getElementById('order-taxes');
    const totalEl = document.getElementById('order-total');
    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (taxesEl) taxesEl.textContent = '$' + tax.toFixed(2);
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}

function goToLoginScreen() {
    templateBuilder.build('login-screen', {}, 'main');
}

function loginAndGoToRestaurant() {
    const username = document.getElementById('login-username')?.value?.trim();
    const password = document.getElementById('login-password')?.value;
    const errEl = document.getElementById('login-error');
    if (!username || !password) {
        if (errEl) errEl.textContent = 'Please enter username and password.';
        return;
    }
    if (errEl) errEl.textContent = '';
    const url = `${config.baseUrl}/auth/login`;
    axios.post(url, { username, password })
        .then(response => {
            const data = response.data;
            if (data && typeof userService !== 'undefined') {
                userService.saveUser(data);
                userService.setHeaderLogin();
                const token = data.token || data.jwt;
                if (token) axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                if (typeof productService !== 'undefined' && productService.enableButtons) productService.enableButtons();
                if (typeof cartService !== 'undefined' && cartService.loadCart) cartService.loadCart();
            }
            goToRestaurantScreen();
        })
        .catch((err) => {
            const msg = err.response?.data?.message || err.response?.data?.error || err.message;
            if (errEl) {
                errEl.textContent = msg || 'Login failed. Check username and password.';
            }
        });
}

function goToRestaurantScreen() {
    const data = {
        restaurantLogo: config.assets.restaurantLogo,
        tacoImage: config.assets.tacoImage,
        butterChickenImage: config.assets.butterChickenImage
    };
    templateBuilder.build('restaurant-screen', data, 'main');
}

function goToOrderScreen() {
    templateBuilder.build('order-screen', {}, 'main');
    setTimeout(renderOrderScreen, 50);
}

function goToPaymentScreen() {
    if (bitebotOrder.items.length === 0) {
        const errEl = document.getElementById('errors');
        if (errEl) { errEl.innerHTML = '<div class="alert alert-warning">Add at least one item to your order.</div>'; }
        return;
    }
    templateBuilder.build('payment-screen', {}, 'main');
    if (typeof profileService !== 'undefined') profileService.loadProfileForFlow();
}

function confirmPaymentAndGoToReview() {
    const cardNumber = document.getElementById('cardNumber')?.value?.trim() || '';
    const payment = {
        nameOnCard: document.getElementById('nameOnCard')?.value?.trim() || '',
        cardNumber: cardNumber,
        cardNumberLast4: cardNumber.length >= 4 ? cardNumber.slice(-4) : '',
        expMonth: document.getElementById('expMonth')?.value?.trim() || '',
        expYear: document.getElementById('expYear')?.value?.trim() || '',
        billingAddress: document.getElementById('billingAddress')?.value?.trim() || '',
        billingCity: document.getElementById('billingCity')?.value?.trim() || '',
        billingCountry: document.getElementById('billingCountry')?.value?.trim() || '',
        billingState: document.getElementById('billingState')?.value?.trim() || '',
        billingZip: document.getElementById('billingZip')?.value?.trim() || '',
        email: document.getElementById('paymentEmail')?.value?.trim() || ''
    };
    bitebotOrder.payment = payment;
    const profilePayload = {
        nameOnCard: payment.nameOnCard,
        cardNumberLast4: payment.cardNumberLast4,
        expMonth: payment.expMonth,
        expYear: payment.expYear,
        billingAddress: payment.billingAddress,
        billingCity: payment.billingCity,
        billingState: payment.billingState,
        billingZip: payment.billingZip,
        billingCountry: payment.billingCountry,
        email: payment.email
    };
    if (typeof profileService !== 'undefined') profileService.updateProfile(profilePayload).catch(() => {});
    goToReviewScreen();
}

function goToReviewScreen() {
    templateBuilder.build('review-screen', {}, 'main');
    setTimeout(renderReviewScreen, 50);
}

function renderReviewScreen() {
    const itemsEl = document.getElementById('review-order-items');
    if (itemsEl) {
        itemsEl.innerHTML = bitebotOrder.items.map(i =>
            `<div class="review-item">${i.name} × ${i.quantity} — $${(i.price * i.quantity).toFixed(2)}</div>`
        ).join('');
    }
    const subtotal = getOrderSubtotal();
    const tax = getOrderTax();
    const total = getOrderTotal();
    const el = id => document.getElementById(id);
    if (el('review-subtotal')) el('review-subtotal').textContent = '$' + subtotal.toFixed(2);
    if (el('review-taxes')) el('review-taxes').textContent = '$' + tax.toFixed(2);
    if (el('review-total')) el('review-total').textContent = '$' + total.toFixed(2);
    const p = bitebotOrder.payment || {};
    if (el('review-payment-summary')) {
        el('review-payment-summary').textContent = p.nameOnCard ? `${p.nameOnCard} •••• ${(p.cardNumber || '').slice(-4)}` : 'Payment on file';
    }
    const addr = bitebotOrder.deliveryAddress || (typeof profileService !== 'undefined' && profileService.lastProfile) ? profileService.lastProfile : null;
    const addrStr = addr ? [addr.address, addr.city, addr.state, addr.zip].filter(Boolean).join(', ') : (p.billingAddress ? `${p.billingAddress}, ${p.billingCity}, ${p.billingState} ${p.billingZip}` : '—');
    if (el('review-delivery-address')) el('review-delivery-address').textContent = addrStr || '—';
}

function placeOrderAndGoToStatus() {
    const total = getOrderTotal();
    const p = bitebotOrder.payment || {};
    const profile = (typeof profileService !== 'undefined' && profileService.lastProfile) ? profileService.lastProfile : {};
    const order = {
        deliveryAddress: profile.address || p.billingAddress || '',
        deliveryCity: profile.city || p.billingCity || '',
        deliveryState: profile.state || p.billingState || '',
        deliveryZip: profile.zip || p.billingZip || '',
        totalAmount: total,
        status: 'PLACED'
    };
    ordersService.createOrder(order)
        .then(response => {
            const data = response.data;
            bitebotOrder.orderId = (data && data.orderId != null) ? data.orderId : (data && data.id != null) ? data.id : null;
            bitebotOrder.status = 'PLACED';
            bitebotOrder.items = [];
            goToOrderStatusScreen();
            if (bitebotOrder.orderId) startStatusPolling();
        })
        .catch(() => {
            templateBuilder.append('error', { error: 'Order submission failed.' }, 'errors');
        });
}

let statusPollingTimer = null;

function goToOrderStatusScreen() {
    const data = getOrderStatusTemplateData();
    templateBuilder.build('order-status-screen', data, 'main');
}

function getOrderStatusTemplateData() {
    const status = (bitebotOrder.status || 'PLACED').toUpperCase();
    const step1Done = ['PLACED', 'EN_ROUTE', 'ARRIVED'].includes(status);
    const step2Done = ['EN_ROUTE', 'ARRIVED'].includes(status);
    const step3Done = status === 'ARRIVED';
    return {
        step1Class: 'active' + (step1Done ? ' done' : ''),
        step2Class: (status === 'EN_ROUTE' ? 'active ' : '') + (step2Done ? 'done' : ''),
        step3Class: (status === 'ARRIVED' ? 'active done' : ''),
        connector1Class: step1Done ? 'done' : '',
        connector2Class: step2Done ? 'done' : '',
        statusPlacedImage: config.assets.statusPlacedImage,
        statusEnRouteImage: config.assets.statusEnRouteImage,
        statusArrivedImage: config.assets.statusArrivedImage
    };
}

function startStatusPolling() {
    if (statusPollingTimer) clearInterval(statusPollingTimer);
    statusPollingTimer = setInterval(() => {
        if (!bitebotOrder.orderId) return;
        ordersService.getOrderById(bitebotOrder.orderId)
            .then(response => {
                const order = response.data;
                if (order && order.status) {
                    bitebotOrder.status = order.status;
                    const data = getOrderStatusTemplateData();
                    const main = document.getElementById('main');
                    if (main && main.querySelector('.order-status-screen')) {
                        templateBuilder.build('order-status-screen', data, 'main');
                    }
                }
            })
            .catch(() => {});
    }, STATUS_UPDATE_INTERVAL_MS);
}
