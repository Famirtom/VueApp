var webstore = new Vue({
  el: '#app',
  data: {
  sitename: 'Lust zu studieren ' ,
  showProduct: true,
  products: [],
  cart: [],
  // sort options
  sortBy: 'subject',
  apiBase: 'http://localhost:3000',  // change to your Render URL later
  sortOrder: 'ascending', //ascending order
  query: '',
  sortByOptions: [ // sorting options
    { value: 'subject',            label: 'Subject' },
    { value: 'location',           label: 'Location' },
    { value: 'price',              label: 'Price' },
    { value: 'availableInventory', label: 'Spaces' }
  ],
  sortOrderOptions: [
    { value: 'ascending',  label: 'Ascending' },
    { value: 'descending', label: 'Descending' }
  ],
  order: {
    firstName: '',
    lastName: '',
    phone: ''
  },
},
mounted() {
  fetch(`${this.apiBase}/api/lessons`)
    .then(r => {
      if (!r.ok) throw new Error('Failed to load lessons');
      return r.json();
    })
    .then(list => {
      // Normalize docs so the app always has the same fields
      this.products = list.map(doc => ({
        id: doc.id != null ? doc.id : doc._id,   // use numeric id if present, else _id
        _id: doc._id,                             // keep _id for later PUT
        subject: doc.subject,
        location: doc.location,
        price: Number(doc.price),
        availableInventory: Number(doc.availableInventory),
        rating: Number(doc.rating || 0),   // <— default to 0 if missing
        image: doc.image, 
        // image is optional and comes from frontend; we don’t use it from API
      }));
    })
    .catch(err => {
      console.warn('API failed, falling back to products.js', err);
      if (Array.isArray(window.lessons)) this.products = window.lessons; // fallback for local dev
    });
},


  methods: {
    addToCart(product) {
      // add entire product object to cart
      this.cart.push({
        id: product.id,
        subject: product.subject,
        location: product.location,
        price: product.price,
        image: product.image
      });
    },

    increment(product) {
      if (this.canAddToCart(product)) {
          this.addToCart(product);
      }
    },
    // remove one instance of product from cart
    decrement(product) {
      const idx = this.cart.findIndex(i => i.id === product.id);
      if(idx != -1) this.cart.splice(idx,1);
    },  
    // count how many times a product is in cart
    cartCount(id) {
      return this.cart.filter(item => item.id === id).length;
    },
    // check if we can add to cart based on available inventory
    canAddToCart(product) {
      return product.availableInventory > this.cartCount(product.id);
    },
    // Remove item from cart by index
    removeFromCart(index){
      this.cart.splice(index,1);
    },
    // Check out function
    showCheckout() {
      this.showProduct = !this.showProduct;
    },
    // Validate name
    isValidName(){
      const name = /^[A-Za-z\s]+$/; // only letters and spaces , $ for end of string
      return name.test(this.order.firstName) && this.order.firstName.trim() !== '';
    },
    // Validate last name
    isValidLastName(){
      const name = /^[A-Za-z\s]+$/; // only letters and spaces, $ for end of string
      return name.test(this.order.lastName) && this.order.lastName.trim() !== '';
    },
    // Validate phone number
    isValidPhone(){
      const phoneRegex = /^[0-9]+$/; // only numbers, $ for end of string
      return phoneRegex.test(this.order.phone) && this.order.phone.trim() !== '';
    },
    //  Check if can checkout
    canCheckout(){
      return this.isValidLastName() && this.isValidName() && this.isValidPhone();
    },
    // Submit form
async submitForm() {
  // Prevent submission if not valid
  if (!this.canCheckout() || this.cart.length === 0) return;

  try {
    // Prepare payload
    const payload = {
      firstName: this.order.firstName,
      lastName:  this.order.lastName,
      phone:     this.order.phone,
      items:     this.cartGrouped.map(x => ({ id: x.id, qty: x.qty, price: x.price })),
      total:     this.cartTotal
    };

    // ===== STEP 1: Send POST request to create order =====
    const res = await fetch(`${this.apiBase}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Check for errors
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Order failed: ${res.status} ${msg}`);
    }

    // Get saved order response
    const saved = await res.json();
    console.log('✅ Order created:', saved._id || saved.id);

    // ===== STEP 2: Update inventory for each product in cart =====
    for (const item of this.cartGrouped) {
      // Find the product in products array
      const product = this.products.find(p => p.id === item.id);
      
      if (product && product._id) {
        // Calculate new inventory
        const newInventory = product.availableInventory - item.qty;
        
        console.log(` Updating ${product.subject}: ${product.availableInventory} -> ${newInventory}`);

        // Send PUT request to update inventory
        const putRes = await fetch(`${this.apiBase}/api/lessons/${product._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ availableInventory: newInventory })
        });

        if (!putRes.ok) {
          console.error(` Failed to update inventory for ${product.subject}`);
          continue;
        }

        // Update local state to reflect changes immediately
        product.availableInventory = newInventory;
        console.log(` Inventory updated for ${product.subject}`);
      }
    }

    // Show success message
    alert(`Order confirmed! ID: ${saved._id || saved.id}\n\nInventory has been updated.`);

    // ===== STEP 3: Reset UI =====
    this.cart = [];
    this.showProduct = true;
    this.order.firstName = '';
    this.order.lastName  = '';
    this.order.phone     = '';

  } catch (err) {
    console.error(' Error:', err);
    alert('Could not place order. Please try again.\n\nError: ' + err.message);
  }
},

    // Increment item in cart by id
    incrementById(id) {
    const product = this.products.find(p => p.id === id);
    if (product && this.canAddToCart(product)) {
      this.addToCart(product);
    }
  },

  decrementById(id) {
    const idx = this.cart.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.cart.splice(idx, 1);
    }
  },

  removeAllOfId(id) {
    this.cart = this.cart.filter(i => i.id !== id);
  },
  fullStars(r) {
    const v = Number(r) || 0;
    return Math.max(0, Math.min(5, v));
  },
  emptyStars(r) {
    return 5 - this.fullStars(r);
  },
},

  computed: {
  // Total items in cart (already correct)
  cartItemCount() {
    return this.cart.length || '';
  },

  //  Direction helper (Vue-style for ascending/descending)
  sortDirection() {
    // Vue will automatically re-run sorting when this changes
    return this.sortOrder === "ascending" ? 1 : -1;
  },

  //  Sorted + filtered products
  sortedProducts() {
    if (!this.showProduct) return [];

    // search text
    const q = this.query.trim().toLowerCase();

    // filter products by subject or location
    const filtered = this.products.filter(p => {
      if (!q) return true;
      const subj = String(p.subject || '').toLowerCase();
      const loc  = String(p.location || '').toLowerCase();
      return subj.includes(q) || loc.includes(q);
    });

    // sort based on current sortBy and sortDirection
    return filtered.slice().sort((a, b) => {
      let aVal, bVal;
      switch (this.sortBy) {
        case 'subject':
          aVal = a.subject.toLowerCase();
          bVal = b.subject.toLowerCase();
          break;
        case 'location':
          aVal = a.location.toLowerCase();
          bVal = b.location.toLowerCase();
          break;
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'availableInventory':
          aVal = a.availableInventory;
          bVal = b.availableInventory;
          break;
        default:
          return 0;
      }

      // compare and multiply by direction (ascending/descending)
      return (aVal > bVal ? 1 : aVal < bVal ? -1 : 0) * this.sortDirection;
    });
  },

  //  Group items in the cart
  cartGrouped() {
    const map = new Map();
    this.cart.forEach(item => {
      if (!map.has(item.id)) {
        map.set(item.id, { ...item, qty: 0 });
      }
      map.get(item.id).qty += 1;
    });
    return Array.from(map.values());
  },

  //  Calculate total cost
  cartTotal() {
    return this.cart.reduce((total, item) => total + item.price, 0);
  }
}
});