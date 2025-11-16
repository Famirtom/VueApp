// app.js - Vue frontend for logic for "Lust zu studieren"
// this file manages the dynamic behavior of the app using Vue.js
// it handle:
// fetching lessons form the backend (Render API)
// searching lessons
// adding/removing items to/from cart
// checkout process and order submission

var webstore = new Vue({
  el: '#app', // Vue instance boud to the HTML element with id="app"
  
  // Data Properties

  data: {
    sitename: 'Lust zu studieren ',  // application title
    showProduct: true, // toggle between product list and checkout view
    products: [], // list of lessons fetched from the backend
    cart: [], // shopping cart items
    sortBy: 'subject', // default sort by subject
    apiBase: 'https://vueapp-backend.onrender.com',  // change to your Render URL later
    sortOrder: 'ascending', //ascending order
    query: '',  // search query
    // Soorting options used in dropdown menus
    sortByOptions: [ 
      { value: 'subject',            label: 'Subject' },
      { value: 'location',           label: 'Location' },
      { value: 'price',              label: 'Price' },
      { value: 'availableInventory', label: 'Spaces' }
    ],
    // sorting option used in dropdown menus
    sortOrderOptions: [
      { value: 'ascending',  label: 'Ascending' },
      { value: 'descending', label: 'Descending' }
    ],
    order: { // checkout form data
      firstName: '',
      lastName: '',
      phone: ''
    }
  },

  // Mouted Lifecycle Hook
  // fetch lessons when the app is first loaded
  mounted() { 
    this.fetchLessons(); // load lessons from API
  },

  // methods - functions for user interaction and data handling

  methods: {
    // fetch all lessons from the backend API
    async fetchLessons() {
      try {
        const res = await fetch(`${this.apiBase}/api/lessons`);
        if (!res.ok) throw new Error('Failed to load lessons');
        const list = await res.json();

        // Normalize docs so the app always has the same fields
        this.products = list.map(doc => ({
          id: doc.id != null ? doc.id : doc._id,   // use numeric id if present, else _id
          _id: doc._id,                             // keep _id for later PUT
          subject: doc.subject, // assume subject is provided
          location: doc.location, // assume location is provided
          price: Number(doc.price), // ensure price is a number
          availableInventory: Number(doc.availableInventory),
          rating: Number(doc.rating || 0),   // default to 0 if missing
          image: doc.image,  // assume image URL is provided
          description: doc.description, // assume description is provided
          duration: doc.duration // assume duration is provided
        }));

        console.log('Lessons Refreshed');
      } catch (err) {
        console.error('Failed to reload lessons:', err);
        if (Array.isArray(window.lessons)) this.products = window.lessons; // fallback for local dev
      }
    },

    // serach - backend-based serach query
   
    async searchLessons() {
      const q = this.query.trim();
      if(!q) {
        //if is empty, fetch all lessons
        await this.fetchLessons();
        return;
      }

      try {
        const res = await fetch(`${this.apiBase}/api/lessons/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error('Search failed');
        const results = await res.json();

        //update products with search results
        this.products = results.map(doc => ({
          id: doc.id != null ? doc.id : doc._id,
          _id: doc._id,
        subject: doc.subject,
        location: doc.location,
        price: Number(doc.price),
        availableInventory: Number(doc.availableInventory),
        rating: Number(doc.rating || 0),
        image: doc.image,
        description: doc.description,
        duration: doc.duration
        }));
        console.log(`found ${results.length} results for "${q}"`);
      } catch (err) {
        console.error('Search error:', err);
      }
    },

    // add a lesson to the shopping cart

    addToCart(product) {
      // add entire product object to cart
      // force shallow copy so reaqctive gets triggered
      const plain = JSON.parse(JSON.stringify(product));
      this.cart.push({
        id: product.id,
        subject: product.subject,
        location: product.location,
        price: product.price,
        image: product.image
      });
      console.log(`Added to cart: ${product.subject}`);
    },

    increment(product) {
      if (this.canAddToCart(product)) {
        this.addToCart(product);
      }
    },

    // remove one instance of product from cart
    decrement(product) {
      const idx = this.cart.findIndex(i => i.id === product.id);
      if (idx != -1) this.cart.splice(idx, 1);
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
    removeFromCart(index) {
      this.cart.splice(index, 1);
    },

    // Check out function
    showCheckout() {
      this.showProduct = !this.showProduct;
    },

    // Validate name
    isValidName() {
      const name = /^[A-Za-z\s]+$/;
      return name.test(this.order.firstName) && this.order.firstName.trim() !== '';
    },

    // Validate last name
    isValidLastName() {
      const name = /^[A-Za-z\s]+$/;
      return name.test(this.order.lastName) && this.order.lastName.trim() !== '';
    },

    // Validate phone number
    isValidPhone() {
      const phoneRegex = /^[0-9]+$/;
      return phoneRegex.test(this.order.phone) && this.order.phone.trim() !== '';
    },

    // Check if can checkout
    canCheckout() {
      return this.isValidLastName() && this.isValidName() && this.isValidPhone();
    },

    // Submit order (POST request)
    async submitForm() {
      if (!this.canCheckout() || this.cart.length === 0) return;

      try {
        // force reactivity
        const grouped = JSON.parse(JSON.stringify(this.cartGrouped));
        // prepare payload
        const payload = {
          firstName: this.order.firstName,
          lastName: this.order.lastName,
          phone: this.order.phone,
          items: grouped.map(item => ({
            subject: item.subject,
            qty: item.qty || this.cartCount(item.id),
            price: item.price
          })),
          total: this.cartTotal
        };

        // POST order to backend
        const res = await fetch(`${this.apiBase}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(`Order failed: ${res.status} ${msg}`);
        }

        const saved = await res.json();
        console.log('✅ Order created:', saved._id || saved.id);

        for (const item of this.cartGrouped) {
          const product = this.products.find(p => p.id == item.id || p._id == item.id);

          if (product && product._id) {
            const newInventory = product.availableInventory - item.qty;

            console.log(`Updating ${product.subject}: ${product.availableInventory} -> ${newInventory}`);

            const putRes = await fetch(`${this.apiBase}/api/lessons/${product._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ availableInventory: newInventory })
            });

            if (!putRes.ok) {
              console.error(`Failed to update inventory for ${product.subject}`);
              continue;
            }

            product.availableInventory = newInventory;
            console.log(`Inventory updated for ${product.subject}`);
          }
        }

        // confimation alert and UI reset
        alert(`Order confirmed! ID: ${saved._id || saved.id}\n\nInventory has been updated.`);
        await this.fetchLessons(); // Refresh lessons
        this.cart = [];
        this.showProduct = true;
        this.order.firstName = '';
        this.order.lastName = '';
        this.order.phone = '';

      } catch (err) {
        console.error('Error:', err);
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
    }
  },


  // computed properties derived data

  computed: {
    // total number of items in the cart
    cartItemCount() {
      return this.cart.length || '';
    },

    // sort direction (ascedning or descending)
    sortDirection() {
      return this.sortOrder === 'ascending' ? 1 : -1;
    },

    // sorted and filtere products (Lessons)
    sortedProducts() {
      if (!this.showProduct) return [];

      const q = this.query.trim().toLowerCase();

      const filtered = this.products.filter(p => {
        if (!q) return true;
        const subj = String(p.subject || '').toLowerCase();
        const loc = String(p.location || '').toLowerCase();
        return subj.includes(q) || loc.includes(q);
      });
      
      // sort dynamically
      return filtered.slice().sort((a, b) => {
        let aVal, bVal;
        switch (this.sortBy) {
          case 'subject': aVal = a.subject.toLowerCase(); bVal = b.subject.toLowerCase(); break;
          case 'location': aVal = a.location.toLowerCase(); bVal = b.location.toLowerCase(); break;
          case 'price': aVal = a.price; bVal = b.price; break;
          case 'availableInventory': aVal = a.availableInventory; bVal = b.availableInventory; break;
          default: return 0;
        }
        return (aVal > bVal ? 1 : aVal < bVal ? -1 : 0) * this.sortDirection;
      });
    },

    // group cart items for checkout
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

    // total price of items in cart
    cartTotal() {
      return this.cart.reduce((total, item) => total + item.price, 0);
    }
  }
});
