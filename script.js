

// Global variables
let siteData = null;
let cart = [];
let appliedCoupon = null;
let currentProduct = null;
let selectedSize = null; // ✅ Track selected size
let userAddress = null; // ✅ Store user's address before checkout


async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Failed to load data.json');
        siteData = await response.json();
        initializeSite();
    } catch (error) {
        console.error('Error loading data:', error);
        useFallbackData();
    }
}


// Fallback data
function useFallbackData() {
    siteData = {
        metadata: {
            title: "The CRUSTWOOD COLLECTION",
            description: "Timeless Elegance. Uncompromising Quality.",
            tagline: "Luxury Fashion Redefined"
        },
        products: [
            {
                id: 1,
                name: "Silk Evening Gown",
                price: 2499,
                images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"],
                about: "Exquisite handcrafted silk evening gown with intricate beadwork.",
                delivery_by: "5-7 business days",
                material: "100% Mulberry Silk",
                care: "Dry clean only",
                sizes: ["XS", "S", "M", "L", "XL"],
                category: "Evening Wear",
                inStock: false
            },
            {
                id: 2,
                name: "Italian Leather Jacket",
                price: 1899,
                images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"],
                about: "Premium Italian leather jacket with quilted silk lining.",
                delivery_by: "3-5 business days",
                material: "Italian Leather",
                care: "Professional leather care",
                sizes: ["S", "M", "L", "XL"],
                category: "Outerwear",
                inStock: true
            }
        ],
        footer: {
            about: "The CRUSTWOOD COLLECTION represents the pinnacle of luxury fashion.",
            quickLinks: [
                {name: "About Us", url: "#about"},
                {name: "Our Collection", url: "#collection"}
            ],
            customerService: [
                {name: "Contact Us", url: "#contact"},
                {name: "Shipping & Returns", url: "#shipping"}
            ],
            social: [
                {name: "Instagram", icon: "📷"},
                {name: "Facebook", icon: "📘"}
            ],
            copyright: "© 2025 The CRUSTWOOD COLLECTION. All Rights Reserved.",
            tagline: "Luxury Fashion | Premium Quality"
        },
        coupons: {
            "LUXURY10": 10,
            "CRUSTWOOD20": 20,
            "VIP25": 25,
            "WELCOME15": 15
        }
    };
    initializeSite();
}

// Initialize site with loaded data
function initializeSite() {
    // Update metadata
    document.title = siteData.metadata.title;
    document.getElementById('siteLogo').textContent = siteData.metadata.title.split(' ')[1];
    document.getElementById('heroTitle').textContent = siteData.metadata.title;
    document.getElementById('heroDescription').textContent = siteData.metadata.description;
    
    // Render products
    renderProducts();
    
    // Render footer
    renderFooter();
}

function renderProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = siteData.products.map(product => {
        const isOutOfStock = !product.inStock;
        const sizeOptions = product.sizes && product.sizes.length > 0
            ? `<div class="homepage-size-options">
                ${product.sizes.map(size => `<button class="size-option-homepage" data-product-id="${product.id}" data-size="${size}">${size}</button>`).join('')}
               </div>`
            : '';

        return `
        <div class="product-card" data-id="${product.id}">
           <div class="product-image">
            <img class="homepage-product-img" 
                src="${product.images[0]}" 
                data-images='${JSON.stringify(product.images)}' 
                alt="${product.name}" 
                loading="lazy">
         </div>

                    <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">₹${product.price.toLocaleString()}</div>
                ${isOutOfStock ? `<div class="out-of-stock-label">OUT OF STOCK</div>` : ''}
                ${sizeOptions}
                <div class="product-actions">
                    <button class="view-details-btn" onclick="openProductModal(${product.id})">View Details</button>
                    <button 
                        class="add-to-cart" 
                        onclick="addToCart(${product.id}, event)"
                        ${isOutOfStock ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
        startHomepageSlides();


    // Make product card clickable (except buttons)
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button') && !e.target.classList.contains('size-option-homepage')) {
                const productId = parseInt(card.getAttribute('data-id'));
                openProductModal(productId);
            }
        });
    });

    // Handle size selection
    document.querySelectorAll('.size-option-homepage').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent opening modal
            const productId = parseInt(btn.getAttribute('data-product-id'));
            const size = btn.getAttribute('data-size');
            
            // Store selected size per product
            if (!window.selectedSizes) window.selectedSizes = {};
            window.selectedSizes[productId] = size;

            // Highlight selected size
            document.querySelectorAll(`.size-option-homepage[data-product-id="${productId}"]`).forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
}




// Render footer
function renderFooter() {
    const footer = siteData.footer;
    
    document.getElementById('footerAbout').textContent = footer.about;
    document.getElementById('footerCopyright').textContent = footer.copyright;
    document.getElementById('footerTagline').textContent = footer.tagline;
    
    // Quick links
    const quickLinks = document.getElementById('footerQuickLinks');
    quickLinks.innerHTML = footer.quickLinks.map(link => 
        `<li><a href="${link.url}">${link.name}</a></li>`
    ).join('');
    
    // Customer service
    const customerService = document.getElementById('footerCustomerService');
    customerService.innerHTML = footer.customerService.map(link => 
        `<li><a href="${link.url}">${link.name}</a></li>`
    ).join('');
    
    // Social links
    const social = document.getElementById('footerSocial');
    social.innerHTML = footer.social.map(link => 
        `<span class="social-link" title="${link.name}">${link.icon}</span>`
    ).join('');
}

// Open product detail modal
function openProductModal(productId) {
    const product = siteData.products.find(p => p.id === productId);
    if (!product) return;
    
    currentProduct = product;
    
    // Set main image
    document.getElementById('mainProductImage').src = product.images[0];
    document.getElementById('mainProductImage').alt = product.name;
    
    // Set thumbnails
    const thumbnails = document.getElementById('thumbnailImages');
    thumbnails.innerHTML = product.images.map((img, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)">
            <img src="${img}" alt="${product.name}">
        </div>
    `).join('');
    
    // Set product info
    document.getElementById('detailProductName').textContent = product.name;
    document.getElementById('detailProductPrice').textContent = `₹${product.price.toLocaleString()}`;
    document.getElementById('detailProductCategory').textContent = product.category;
    document.getElementById('detailProductStock').textContent = product.inStock ? '✓ In Stock' : 'Out of Stock';
    document.getElementById('detailProductAbout').textContent = product.about;
    document.getElementById('detailMaterial').textContent = product.material;
    document.getElementById('detailDelivery').textContent = product.delivery_by;
    document.getElementById('detailCare').textContent = product.care;
    document.getElementById('addToCartPrice').textContent = `₹${product.price.toLocaleString()}`;
    
    // Set sizes
    const sizes = document.getElementById('detailSizes');
    sizes.innerHTML = product.sizes.map(size => `
        <div class="size-option" onclick="selectSize(this)">${size}</div>
    `).join('');
    
   const addBtn = document.getElementById('addToCartDetailBtn');
addBtn.onclick = () => {
    addToCart(product.id);
    closeProductModal();
};

// Disable if out of stock
if (!product.inStock) {
    addBtn.disabled = true;
    addBtn.style.opacity = 0.5;
    addBtn.style.cursor = 'not-allowed';
} else {
    addBtn.disabled = false;
    addBtn.style.opacity = 1;
    addBtn.style.cursor = 'pointer';
}

    
    // Show modal
    document.getElementById('productModal').style.display = 'block';
}

// Close product modal
function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    currentProduct = null;
}

// Change main image
function changeMainImage(imgSrc, thumbnail) {
    document.getElementById('mainProductImage').src = imgSrc;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
}



function selectSize(element) {
    document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    selectedSize = element.textContent; // ✅ Store selected size globally
}


// Add to cart
function addToCart(productId, event) {
    if (event) event.stopPropagation();

    const product = siteData.products.find(p => p.id === productId);
    if (!product) return;

    const selectedSize = window.selectedSizes ? window.selectedSizes[productId] : null;

    // Require size if product has sizes
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        showSuccessMessage("Please select a size before adding to cart!");
        return;
    }

    const existingItem = cart.find(item => item.id === productId && item.size === (selectedSize || "Free Size"));
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1, size: selectedSize || "Free Size" });
    }

    // Reset selected size for this product
    if (window.selectedSizes) delete window.selectedSizes[productId];

    updateCartCount();
    showSuccessMessage('Added to cart!');
}


// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    renderCart();
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            renderCart();
        }
    }
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Toggle cart
function toggleCart() {
    const modal = document.getElementById('cartModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    if (modal.style.display === 'block') {
        renderCart();
    }
}

// Render cart
function renderCart() {
    const cartItems = document.getElementById('cartItems');

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        document.querySelector('.cart-summary').style.display = 'none';
        document.querySelector('.coupon-section').style.display = 'none';
        return;
    }

    document.querySelector('.cart-summary').style.display = 'block';
    document.querySelector('.coupon-section').style.display = 'block';

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-size">Size: <strong>${item.size}</strong></div> <!-- ✅ Show size -->
                <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
            </div>
            <div class="cart-item-actions">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');

    updateCartSummary();
}


// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    
    if (appliedCoupon && siteData.coupons[appliedCoupon]) {
        discount = subtotal * (siteData.coupons[appliedCoupon] / 100);
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('discount').textContent = `-₹${discount.toFixed(2)}`;
    } else {
        document.getElementById('discountRow').style.display = 'none';
    }

    const total = subtotal - discount;

    document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString()}`;
    document.getElementById('total').textContent = `₹${total.toLocaleString()}`;
}

// Apply coupon
function applyCoupon() {
    const couponCode = document.getElementById('couponInput').value.trim().toUpperCase();
    const messageDiv = document.getElementById('couponMessage');

    if (siteData.coupons[couponCode]) {
        appliedCoupon = couponCode;
        messageDiv.innerHTML = `<div class="discount-applied">✓ Coupon applied! ${siteData.coupons[couponCode]}% discount</div>`;
        updateCartSummary();
    } else {
        messageDiv.innerHTML = '<div class="error-message">Invalid coupon code</div>';
        setTimeout(() => messageDiv.innerHTML = '', 3000);
    }
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    if (!userAddress) {
        openAddressModal();
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    if (appliedCoupon && siteData.coupons[appliedCoupon]) {
        discount = subtotal * (siteData.coupons[appliedCoupon] / 100);
    }
    const total = subtotal - discount;

    const orderData = {
        items: cart,
        address: userAddress,
        deliveryBy: "5-7 business days", // or use dynamic per-product if needed
        total: total
    };

    // Save order in sessionStorage
    sessionStorage.setItem('lastOrder', JSON.stringify(orderData));

    // Reset cart
    cart = [];
    appliedCoupon = null;
    userAddress = null;
    selectedSize = null;
    updateCartCount();

    // Redirect to Thank You page
    window.location.href = "thankyou.html";
}



// Show success message
function showSuccessMessage(message) {
    const msg = document.createElement('div');
    msg.className = 'success-message';
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
}

// Scroll to collection
function scrollToCollection() {
    document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
}


// Open Address Modal before checkout
function openAddressModal() {
    document.getElementById('addressModal').style.display = 'block';
}

// Close Address Modal
function closeAddressModal() {
    document.getElementById('addressModal').style.display = 'none';
}


// Close modals on outside click
window.onclick = function(event) {
    const cartModal = document.getElementById('cartModal');
    const productModal = document.getElementById('productModal');
    
    if (event.target === cartModal) {
        toggleCart();
    }
    if (event.target === productModal) {
        closeProductModal();
    }
}


// Handle address form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addressForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        userAddress = {
            name: document.getElementById('addressName').value.trim(),
            addressLine: document.getElementById('addressLine').value.trim(),
            city: document.getElementById('addressCity').value.trim(),
            pin: document.getElementById('addressPin').value.trim(),
            phone: document.getElementById('addressPhone').value.trim()
        };
        closeAddressModal();
        checkout(); // ✅ proceed to final checkout
    });
});


// Auto-slide homepage product images
function startHomepageSlides() {
    document.querySelectorAll('.homepage-product-img').forEach(img => {
        const images = JSON.parse(img.dataset.images);
        if (images.length <= 1) return; // skip if only 1 image

        let index = 0;
        setInterval(() => {
            index = (index + 1) % images.length;
            img.src = images[index];
        }, 3000); // change every 3 seconds
    });
}

// Start slides after products are rendered


// Initialize on page load
window.addEventListener('DOMContentLoaded', loadData);
