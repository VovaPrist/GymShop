class MenuManager {
    constructor() {
        this.dropdownMenu = document.getElementById('dropdownMenu');
        this.menuButton = document.querySelector('.menu-button');
        this.isDesktop = window.innerWidth >= 1025;
        
        if (!this.menuButton || !this.dropdownMenu) return;
        
        this.initializeEventListeners();
        this.handleWindowResize();
    }

    initializeEventListeners() {
        this.menuButton.addEventListener('click', () => {
            if (window.innerWidth < 1025) {
                this.toggleMenu();
            }
        });

        if (this.isDesktop) {
            const header = document.querySelector('header');
            
            header.addEventListener('mouseenter', () => {
                this.showMenu();
            });

            header.addEventListener('mouseleave', () => {
                this.hideMenu();
            });

            this.dropdownMenu.addEventListener('mouseenter', () => {
                this.showMenu();
            });

            this.dropdownMenu.addEventListener('mouseleave', () => {
                this.hideMenu();
            });
        }

        const menuLinks = this.dropdownMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.hideMenu();
            });
        });

        window.addEventListener('resize', () => this.handleWindowResize());
    }

    toggleMenu() {
        this.dropdownMenu.classList.toggle('active');
    }

    showMenu() {
        this.dropdownMenu.classList.add('active');
    }

    hideMenu() {
        this.dropdownMenu.classList.remove('active');
    }

    handleWindowResize() {
        const wasDesktop = this.isDesktop;
        this.isDesktop = window.innerWidth >= 1025;

        if (wasDesktop !== this.isDesktop) {
            this.dropdownMenu.classList.remove('active');
        }
    }
}

class ShoppingCart {
    constructor() {
        this.storageKey = 'gymShopCart';
        this.cart = this.loadCart();
        this.setupCartButton();
    }

    loadCart() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
    }

    addProduct(product) {
        const existing = this.cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        this.saveCart();
    }

    removeProduct(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    setupCartButton() {
        const cartButton = document.querySelector('[alt="cart"]');
        if (cartButton) {
            cartButton.addEventListener('click', () => {
                this.showCartModal();
            });
        }
    }

    showCartModal() {
        const modal = document.getElementById('cartModal') || this.createCartModal();
        modal.style.display = 'flex';
        this.updateCartDisplay();
    }

    createCartModal() {
        const modal = document.createElement('div');
        modal.id = 'cartModal';
        modal.className = 'cart-modal';
        modal.innerHTML = `
            <div class="cart-content">
                <div class="cart-header">
                    <h2>Kundvagn</h2>
                    <span class="close-cart">&times;</span>
                </div>
                <div class="cart-items"></div>
                <div class="cart-footer">
                    <div class="cart-total">Total: <span id="cartTotal">0 kr</span></div>
                    <button class="checkout-btn">Betala</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close-cart').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });

        // Event delegation for remove buttons
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                const productId = parseInt(e.target.dataset.id);
                this.removeProduct(productId);
                this.updateCartDisplay();
            }
        });

        return modal;
    }

    updateCartDisplay() {
        const itemsContainer = document.querySelector('.cart-items');
        const totalEl = document.getElementById('cartTotal');

        if (this.cart.length === 0) {
            itemsContainer.innerHTML = '<p class="empty-cart">Din varukorg är tom</p>';
            totalEl.textContent = '0 kr';
            return;
        }

        itemsContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p class="item-category">${item.category}</p>
                    <p class="item-price">${item.price} kr</p>
                </div>
                <div class="item-quantity">
                    <span>${item.quantity}x</span>
                </div>
                <button class="remove-btn" data-id="${item.id}">Remove</button>
            </div>
        `).join('');

        totalEl.textContent = this.getCartTotal() + 'kr';
    }
}

class Product {
    static idCounter = 1;

    constructor({ name, price, category, image }) {
        this.id = Product.idCounter++;
        this.name = name;
        this.price = price;
        this.category = category;
        this.image = image;
    }
}

class ProductManager {
    constructor() {
        this.products = [];
        this.cart = new ShoppingCart();
    }

    addProduct(productData) {
        const product = new Product(productData);
        this.products.push(product);
        return product;
    }

    addProducts(productArray) {
        productArray.forEach(data => this.addProduct(data));
    }

    displayProducts(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = this.products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-price">${product.price} kr</p>
                <button class="add-to-cart-btn" data-id="${product.id}">Lägg till kundvagn</button>
            </div>
        `).join('');

        container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id);
                const product = this.products.find(p => p.id === productId);
                this.cart.addProduct(product);
            });
        });
    }

    displayProductsByCategory(category, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const filtered = this.products.filter(p => p.category === category);
        container.innerHTML = filtered.map(product => `
            <div class="product-card" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-price">${product.price} kr</p>
                <button class="add-to-cart-btn" data-id="${product.id}">Lägg till kundvagn</button>
            </div>
        `).join('');

        container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id);
                const product = this.products.find(p => p.id === productId);
                this.cart.addProduct(product);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MenuManager();

    const productManager = new ProductManager();

    productManager.addProducts([
        // New Arrivals
        { name: 'Apex Seamless Compression Tee', price: 349, category: 'new', image: 'products/Apex.webp' },
        { name: 'Velocity Hybrid Training Shorts', price: 399, category: 'new', image: 'products/Velocity.webp' },
        { name: 'Core Sculpt Leggings', price: 499, category: 'new', image: 'products/Core.webp' },
        { name: 'Titan Oversized Pump Hoodie', price: 599, category: 'new', image: 'products/Titan.webp' },
        
        // Sale Items
        { name: 'Flex Performance Tank', price: 199, category: 'sale', image: 'products/Flex.webp' },
        { name: 'Powerlift Training Shorts', price: 299, category: 'sale', image: 'products/Powerlift.webp' },
        { name: 'Sculpt Fit Long Sleeve', price: 249, category: 'sale', image: 'products/Sculpt.webp' },
        { name: 'Elite Zip Training Hoodie', price: 249, category: 'sale', image: 'products/Elite.webp' },
        
        // Men's T-Shirts
        { name: 'Iron Core Fitted Tee', price: 299, category: 'mensTshirts', image: 'products/Iron.webp' },
        { name: 'MotionTech Breathable Tee', price: 349, category: 'mensTshirts', image: 'products/Iron.webp' },
        { name: 'Classic Pump Cover Tee', price: 279, category: 'mensTshirts', image: 'products/Iron.webp' },
        { name: 'ProForm Athletic Tee', price: 329, category: 'mensTshirts', image: 'products/Iron.webp' },
        
        // Men's Shorts
        { name: 'Endurance Training Shorts', price: 399, category: 'mensShorts', image: 'products/Powerlift.webp' },
        { name: 'FlexLite Gym Shorts', price: 349, category: 'mensShorts', image: 'products/Powerlift.webp' },
        { name: 'Power Mesh Workout Shorts', price: 449, category: 'mensShorts', image: 'products/Powerlift.webp' },
        { name: 'Sprint Performance Shorts', price: 379, category: 'mensShorts', image: 'products/Powerlift.webp' },
        
        // Women's Clothing
        { name: "Sculpt Seamless Sports Bra", price: 349, category: 'womensClothing', image: 'products/Apex.webp' },
        { name: "Contour High-Waist Leggings", price: 499, category: 'womensClothing', image: 'products/Apex.webp' },
        { name: "FlexFit Training Crop Top", price: 299, category: 'womensClothing', image: 'products/Apex.webp' },
        { name: "Motion Sculpt Shorts", price: 299, category: 'womensClothing', image: 'products/Apex.webp' },
        
        // Accessories
        { name: 'SteelCore Shaker Bottle', price: 249, category: 'accessories', image: 'products/Shaker.webp' },
        { name: 'ProGrip Lifting Belt', price: 499, category: 'accessories', image: 'products/Belt.webp' },
        { name: 'Resistance Power Bands Set', price: 249, category: 'accessories', image: 'products/Bands.webp' },
        { name: 'Performance Training Gloves', price: 199, category: 'accessories', image: 'products/Gloves.webp' },
    ]);

    productManager.displayProductsByCategory('new', 'newArrivals');
    productManager.displayProductsByCategory('sale', 'saleItems');
    productManager.displayProductsByCategory('mensTshirts', 'mensTshirts');
    productManager.displayProductsByCategory('mensShorts', 'mensShorts');
    productManager.displayProductsByCategory('womensClothing', 'womensClothing');
    productManager.displayProductsByCategory('accessories', 'accessoriesSection');
});