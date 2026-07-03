// Mock Data for Vouchers (Pulled from existing platform structure)
const vouchers = [
    { id: 1, name: "Food Handling & Sanitation Certification", price: 140 },
    { id: 2, name: "Professional Chef Certification", price: 790 },
    { id: 3, name: "Certified Restaurant Manager", price: 550 },
    { id: 4, name: "Front Office Operations Certification", price: 666 },
    { id: 5, name: "Event Catering Pro", price: 300 }
];

const learningMaterials = [
    {
        id: 101,
        title: "Introduction to Culinary Arts Management",
        author: "By Chef Dominic Hawkes MCGB, Daniel John Stine",
        formats: ["Print Book", "eBook", "Videos", "Practice Exam"],
        specs: "324 Pages • 4h 50m",
        price: 120,
        image: "thumb_culinary.png",
        hasTrailer: true,
        trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" // placeholder
    },
    {
        id: 102,
        title: "Food Safety & Sanitation Masterclass",
        author: "By Chef Dominic Hawkes MCGB",
        formats: ["eBook", "Videos", "Practice Exam"],
        specs: "150 Pages • 2h 30m",
        price: 85,
        image: "thumb_food_safety.png",
        hasTrailer: false
    },
    {
        id: 103,
        title: "HACCP Compliance Guide for Modern Kitchens",
        author: "By Daniel John Stine",
        formats: ["Print Book", "Videos", "Audit Templates"],
        specs: "210 Pages • 3h 15m",
        price: 145,
        image: "thumb_haccp.png",
        hasTrailer: false
    }
];

let cart = [];


document.addEventListener("DOMContentLoaded", () => {
    populateVouchers();
    renderCatalog();
    updateCartBadge();
});

function populateVouchers() {
    const select = document.getElementById('voucherSelect');
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>-- Select a Certification --</option>';
    vouchers.forEach(v => {
        select.innerHTML += `<option value="${v.id}">${v.name} ($${v.price})</option>`;
    });
}

// Bulk discount mirrors the org-admin pathway: 5% off at 50+ vouchers.
const BULK_DISCOUNT_THRESHOLD = 50;
const BULK_DISCOUNT_RATE = 0.05;
let lastQuote = { subtotal: 0, discount: 0, total: 0, qty: 0, voucher: null };

function computeQuote() {
    const select = document.getElementById('voucherSelect');
    const qtyInput = document.getElementById('voucherQty');
    const selectedVoucher = vouchers.find(v => v.id == select.value);
    const qty = parseInt(qtyInput.value);
    if (!selectedVoucher || !qty || qty < 1) {
        lastQuote = { subtotal: 0, discount: 0, total: 0, qty: 0, voucher: null };
        return lastQuote;
    }
    const subtotal = selectedVoucher.price * qty;
    const discount = qty >= BULK_DISCOUNT_THRESHOLD ? Math.round(subtotal * BULK_DISCOUNT_RATE) : 0;
    lastQuote = { subtotal, discount, total: subtotal - discount, qty, voucher: selectedVoucher };
    return lastQuote;
}

function calculateQuote() {
    const totalDisplay = document.getElementById('quoteTotal');
    const q = computeQuote();
    totalDisplay.textContent = '$' + q.total.toLocaleString();

    // Surface the volume discount when it kicks in.
    const label = totalDisplay.parentElement ? totalDisplay.parentElement.querySelector('.quote-label') : null;
    if (label) {
        label.textContent = q.discount > 0
            ? `Estimated Total (incl. 5% volume discount −$${q.discount.toLocaleString()})`
            : 'Estimated Total';
    }
}

let currentFlow = 'register';

function openOnboardingModal(flowType) {
    currentFlow = flowType;
    document.getElementById('onboardingModal').classList.add('active');
    
    // Reset views
    document.getElementById('onboardingFormContainer').style.display = 'block';
    document.getElementById('onboardingFeedbackContainer').style.display = 'none';
    document.getElementById('emailError').style.display = 'none';
    
    // Reset inputs
    document.getElementById('onboardOrgName').value = '';
    document.getElementById('onboardDomain').value = '';
    document.getElementById('onboardEmail').value = '';
    
    // Reset buy-flow card fields + any prior issued codes
    ['buyCardName', 'buyCardNumber', 'buyCardExp', 'buyCardCvc'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    const buyPay = document.getElementById('buyPaymentSection');
    if (buyPay) buyPay.style.display = 'none';
    const fbCodes = document.getElementById('feedbackCodes');
    if (fbCodes) { fbCodes.style.display = 'none'; fbCodes.innerHTML = ''; }

    if (flowType === 'quote' || flowType === 'buy') {
        const isBuy = flowType === 'buy';
        document.getElementById('onboardingTitle').textContent = isBuy ? 'Buy Exam Vouchers' : 'Request a Quote';
        document.getElementById('onboardSubmitBtn').textContent = isBuy ? 'Pay & Get Vouchers' : 'Request Quote';
        document.getElementById('quoteDynamicSection').style.display = 'block';
        document.getElementById('simpleQuoteSection').style.display = 'block';
        document.getElementById('checkoutOrderSummary').style.display = 'none';
        if (buyPay) buyPay.style.display = isBuy ? 'block' : 'none';
        document.getElementById('voucherSelect').value = '';
        document.getElementById('voucherQty').value = 1;
        document.getElementById('quoteTotal').textContent = '$0';
    } else if (flowType === 'checkout') {
        document.getElementById('onboardingTitle').textContent = 'Request a Quote';
        document.getElementById('onboardSubmitBtn').textContent = 'Submit Combined Quote Request';
        document.getElementById('quoteDynamicSection').style.display = 'block';
        document.getElementById('simpleQuoteSection').style.display = 'none';
        document.getElementById('checkoutOrderSummary').style.display = 'block';
        renderCheckoutSummary();
    } else {
        document.getElementById('onboardingTitle').textContent = 'Register Organization';
        document.getElementById('onboardSubmitBtn').textContent = 'Submit Application';
        document.getElementById('quoteDynamicSection').style.display = 'none';
    }
}

function closeOnboardingModal() {
    document.getElementById('onboardingModal').classList.remove('active');
}

function returnToForm() {
    document.getElementById('onboardingFeedbackContainer').style.display = 'none';
    document.getElementById('onboardingFormContainer').style.display = 'block';
    document.getElementById('onboardEmail').focus();
}

function showFeedback(state, message, title, showBackBtn = false) {
    document.getElementById('onboardingFormContainer').style.display = 'none';
    const feedback = document.getElementById('onboardingFeedbackContainer');
    feedback.style.display = 'block';
    
    document.getElementById('feedbackTitle').textContent = title;
    document.getElementById('feedbackText').textContent = message;

    const fbCodes = document.getElementById('feedbackCodes');
    if (fbCodes) { fbCodes.style.display = 'none'; fbCodes.innerHTML = ''; }

    const icon = document.getElementById('feedbackIcon');
    if (state === 'success') {
        icon.innerHTML = '<i class="material-icons" style="color: #10b981;">check_circle</i>';
    } else if (state === 'warning') {
        icon.innerHTML = '<i class="material-icons" style="color: #f59e0b;">warning</i>';
    } else if (state === 'pending') {
        icon.innerHTML = '<i class="material-icons" style="color: #3b82f6;">schedule</i>';
    }
    
    document.getElementById('feedbackActionBtn').style.display = showBackBtn ? 'block' : 'none';
    document.getElementById('feedbackCloseBtn').style.display = showBackBtn ? 'none' : 'block';
}

function submitOnboarding() {
    const orgName = document.getElementById('onboardOrgName').value.trim();
    const domain = document.getElementById('onboardDomain').value.trim().toLowerCase();
    const email = document.getElementById('onboardEmail').value.trim().toLowerCase();

    // Direct online purchase ("Buy Now") — pay by card, get voucher codes back.
    if (currentFlow === 'buy') { return submitBuyVouchers(orgName, domain, email); }

    if (!orgName || !domain || !email) {
        alert("Please fill in all required fields.");
        return;
    }

    // State B: Free Email Domain Detected
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
    const emailDomain = email.split('@')[1];
    if (emailDomain && freeDomains.includes(emailDomain)) {
        showFeedback('warning', 'Please use an official organizational email address.', 'Invalid Email Domain', true);
        document.getElementById('emailError').style.display = 'block';
        return;
    }
    
    document.getElementById('emailError').style.display = 'none';
    
    // State C: Domain Mismatch
    let hasMismatch = false;
    if (emailDomain && emailDomain !== domain) {
        hasMismatch = true;
    }
    
    // Build Data Object
    let orgData = {
        name: orgName,
        slug: '@' + orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        email: email,
        domain: domain,
        status: 'PENDING',
        flowType: currentFlow,
        suspendReason: '',
        flags: hasMismatch ? ['domain_mismatch'] : []
    };
    
    if (currentFlow === 'quote') {
        const select = document.getElementById('voucherSelect');
        const qtyInput = document.getElementById('voucherQty');
        if (!select.value) {
            alert("Please select a certification course.");
            return;
        }
        const selectedVoucher = vouchers.find(v => v.id == select.value);
        orgData.quoteCourse = selectedVoucher.name;
        orgData.quoteQty = parseInt(qtyInput.value);
    } else if (currentFlow === 'checkout') {
        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }
        orgData.cartItems = [...cart];
        orgData.isLearningMaterialOrder = true;
        // Optionally empty cart after success
        cart = [];
        updateCartBadge();
        renderCart();
    }
    
    // Save to localStorage
    let organizations = JSON.parse(localStorage.getItem('sdc_organizations')) || [];
    organizations.push(orgData);
    localStorage.setItem('sdc_organizations', JSON.stringify(organizations));
    
    // Show final feedback state
    if (hasMismatch) {
        showFeedback('pending', 'Your application requires manual review by our team. We will contact you shortly.', 'Manual Review Required', false);
    } else {
        showFeedback('success', 'Request Processed. Please check your email for the next steps.', 'Success', false);
    }
}

// ==========================================
// Direct online voucher purchase ("Buy Now")
// ==========================================
const WEB_API = 'index.html';

function submitBuyVouchers(orgName, domain, email) {
    // Buyer + selection validation (email is required for the receipt + codes).
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address — we send your voucher codes there.');
        return;
    }
    const q = computeQuote();
    if (!q.voucher || q.qty < 1) {
        alert('Please select a certification and a quantity of at least 1.');
        return;
    }

    // Card validation (mock — prototype only).
    const name = document.getElementById('buyCardName').value.trim();
    const number = document.getElementById('buyCardNumber').value.replace(/\s+/g, '');
    const exp = document.getElementById('buyCardExp').value.trim();
    const cvc = document.getElementById('buyCardCvc').value.trim();
    if (!name || number.length < 12 || !/^\d{2}\s*\/\s*\d{2}$/.test(exp) || cvc.length < 3) {
        alert('Please enter complete, valid card details.');
        return;
    }

    const btn = document.getElementById('onboardSubmitBtn');
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Processing payment…';

    const payload = {
        type: 'Internet Proctored',
        cert: q.voucher.name,
        qty: q.qty,
        total: q.total,
        email: email,
        orgName: orgName || null
    };

    fetch(`${WEB_API}/api/vouchers/web-purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(r => r.json())
        .then(data => {
            if (!data || !data.success || !Array.isArray(data.codes)) throw new Error('purchase failed');
            finishBuy(data.codes, q, email);
        })
        .catch(() => {
            // Offline / backend unavailable — mint display codes locally so the
            // prototype still demonstrates the flow.
            const codes = [];
            for (let i = 0; i < q.qty; i++) {
                codes.push('VCH-W' + String(1000 + i).padStart(4, '0'));
            }
            finishBuy(codes, q, email, true);
        })
        .finally(() => { btn.disabled = false; btn.textContent = orig; });
}

function finishBuy(codes, q, email, offline) {
    // Persist a lightweight record so a returning buyer keeps their codes.
    try {
        const k = 'sdc_web_purchases';
        const arr = JSON.parse(localStorage.getItem(k)) || [];
        arr.push({ codes, cert: q.voucher.name, qty: q.qty, total: q.total, email, at: new Date().toISOString() });
        localStorage.setItem(k, JSON.stringify(arr));
    } catch (e) {}

    showFeedback(
        'success',
        `Payment of $${q.total.toLocaleString()} received for ${q.qty} ${q.voucher.name} voucher${q.qty > 1 ? 's' : ''}. A receipt and your code${q.qty > 1 ? 's have' : ' has'} been emailed to ${email}.`,
        'Purchase Complete'
    );
    renderIssuedCodes(codes, offline);
}

function renderIssuedCodes(codes, offline) {
    const wrap = document.getElementById('feedbackCodes');
    if (!wrap) return;
    let html = '<div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:10px;">Your voucher code' + (codes.length > 1 ? 's' : '') + '</div>';
    codes.forEach(code => {
        html += `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; background:var(--surface-glass, rgba(255,255,255,0.04)); border:1px solid var(--border-glass); border-radius:10px; padding:10px 14px; margin-bottom:8px;">
                <code style="font-size:15px; font-weight:700; letter-spacing:.04em; color:var(--primary);">${code}</code>
                <button class="btn-secondary" style="padding:6px 12px; font-size:13px;" onclick="copyVoucherCode('${code}', this)"><i class="material-icons" style="font-size:16px; vertical-align:middle;">content_copy</i> Copy</button>
            </div>`;
    });
    html += `<div style="font-size:13px; color:var(--text-muted); margin-top:10px; line-height:1.5;"><i class="material-icons" style="font-size:15px; vertical-align:middle;">login</i> Candidates sign in at the candidate portal using "Have an exam voucher? Sign in with it" and enter ${codes.length > 1 ? 'one of these codes' : 'this code'} to unlock the exam.</div>`;
    if (offline) {
        html += `<div style="font-size:12px; color:var(--status-warning, #f59e0b); margin-top:8px;">Demo mode: codes generated locally (purchase service offline).</div>`;
    }
    wrap.innerHTML = html;
    wrap.style.display = 'block';
}

function copyVoucherCode(code, btn) {
    const done = () => {
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="material-icons" style="font-size:16px; vertical-align:middle;">check</i> Copied';
            setTimeout(() => { btn.innerHTML = orig; }, 1500);
        }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done).catch(fallback);
    } else { fallback(); }
    function fallback() {
        try {
            const ta = document.createElement('textarea');
            ta.value = code; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            document.execCommand('copy'); document.body.removeChild(ta); done();
        } catch (e) { alert('Code: ' + code); }
    }
}

// ==========================================
// Catalog and Cart Logic
// ==========================================

function showHome() {
    document.getElementById('home-section').style.display = 'block';
    document.getElementById('catalog-section').style.display = 'none';
}

function showCatalog() {
    document.getElementById('home-section').style.display = 'none';
    document.getElementById('catalog-section').style.display = 'block';
}

function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;
    grid.innerHTML = '';

    learningMaterials.forEach(item => {
        const formatsHtml = item.formats.map(f => `<span class="lm-tag">${f}</span>`).join('');
        const trailerBtn = item.hasTrailer ? `<button class="lm-trailer-btn" onclick="openVideoModal('${item.trailerUrl}')"><i class="material-icons">play_arrow</i> Trailer</button>` : '';
        
        const card = document.createElement('div');
        card.className = 'lm-card';
        card.innerHTML = `
            <div class="lm-image-area">
                <img src="${item.image}" alt="${item.title}" onerror="this.src='sdc_full_logo.png'">
                ${trailerBtn}
            </div>
            <div class="lm-body">
                <div class="lm-title">${item.title}</div>
                <div class="lm-author">${item.author}</div>
                <div class="lm-formats">${formatsHtml}</div>
                <div class="lm-specs"><i class="material-icons">menu_book</i> ${item.specs}</div>
                <div class="lm-footer">
                    <div class="lm-price-block">
                        <span class="lm-field-label">Voucher Price</span>
                        <div class="lm-price">$${item.price}</div>
                    </div>
                    <div class="lm-qty-block">
                        <span class="lm-field-label">Select Voucher Quantity</span>
                        <input type="number" class="lm-qty" id="qty-${item.id}" min="1" value="1">
                    </div>
                </div>
                <button class="btn-primary lm-add-btn" onclick="addToCart(${item.id})">Add to Quote</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function addToCart(id) {
    const item = learningMaterials.find(m => m.id === id);
    if (!item) return;
    
    const qtyInput = document.getElementById(`qty-${id}`);
    const qty = parseInt(qtyInput.value) || 1;
    
    const existing = cart.find(c => c.id === id);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ ...item, qty });
    }
    
    qtyInput.value = 1;
    updateCartBadge();
    renderCart();
    
    // Quick visual feedback
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="material-icons">check</i> Added';
    setTimeout(() => { btn.innerHTML = originalText; }, 1500);
}

function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
    updateCartBadge();
    renderCart();
}

function updateCartQty(id, qty) {
    const item = cart.find(c => c.id === id);
    if (item) {
        item.qty = parseInt(qty) || 1;
        if (item.qty < 1) item.qty = 1;
    }
    renderCart();
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.textContent = cart.length;
        badge.style.display = cart.length > 0 ? 'flex' : 'none';
    }
}

function toggleCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (!drawer || !overlay) return;
    
    const isActive = drawer.classList.contains('active');
    if (isActive) {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
    } else {
        drawer.classList.add('active');
        overlay.classList.add('active');
        renderCart();
    }
}

function renderCart() {
    const body = document.getElementById('cartBody');
    const totalDisplay = document.getElementById('cartTotalDisplay');
    if (!body || !totalDisplay) return;
    
    if (cart.length === 0) {
        body.innerHTML = '<div style="text-align: center; color: var(--text-secondary); margin-top: 40px;">Your quote cart is empty.</div>';
        totalDisplay.textContent = '$0';
        return;
    }
    
    let total = 0;
    body.innerHTML = '';
    
    cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" class="cart-item-img" alt="${item.title}" onerror="this.src='sdc_full_logo.png'">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">$${item.price} / unit</div>
                <div class="cart-item-actions">
                    <input type="number" class="cart-item-qty" min="1" value="${item.qty}" onchange="updateCartQty(${item.id}, this.value)">
                    <div style="font-weight: 700; font-size: 14px;">$${subtotal.toLocaleString()}</div>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `;
        body.appendChild(div);
    });
    
    totalDisplay.textContent = '$' + total.toLocaleString();
}

function proceedToCheckout() {
    if (cart.length === 0) return;
    toggleCartDrawer();
    openOnboardingModal('checkout');
}

function renderCheckoutSummary() {
    const container = document.getElementById('checkoutOrderSummary');
    if (!container) return;
    
    let html = '<div style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary);">Order Summary</div>';
    let total = 0;
    
    cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        html += `
            <div class="checkout-item-row">
                <div style="flex:1; padding-right: 16px;">
                    <span style="color: var(--text-primary);">${item.qty}x</span> ${item.title}
                </div>
                <div style="font-weight: 600;">$${subtotal.toLocaleString()}</div>
            </div>
        `;
    });
    
    html += `
        <div class="checkout-item-row" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-glass);">
            <div style="font-weight: 700; color: white;">Estimated Total</div>
            <div style="font-weight: 700; color: var(--primary); font-size: 16px;">$${total.toLocaleString()}</div>
        </div>
    `;
    
    container.innerHTML = html;
}

function openVideoModal(url) {
    const overlay = document.getElementById('videoModalOverlay');
    const iframe = document.getElementById('trailerIframe');
    if (overlay && iframe) {
        // Use a YouTube ID for the placeholder to avoid iframe issues
        iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
        overlay.classList.add('active');
    }
}

function closeVideoModal() {
    const overlay = document.getElementById('videoModalOverlay');
    const iframe = document.getElementById('trailerIframe');
    if (overlay && iframe) {
        overlay.classList.remove('active');
        iframe.src = '';
    }
}
