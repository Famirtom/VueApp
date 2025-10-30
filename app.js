var webstore = new Vue({
  el: '#app',
  data: {
  sitename: 'Lust zu studieren ' ,
  showProduct: true,
  products: products,
  cart: [],
  // sort options
  sortBy: 'subject',
  sortOrder: 'ascending', //ascending order
  query: '',
  
  order: {
    firstName: '',
    lastName: '',
    phone: ''
  },
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
    increment(product){
      if(this.addToCart(product)){
        this.addToCart(product)
      }
    },
    decrement(product) {
      const idx = this.cart.findIndex(i => i.id === product.id);
      if(idx != -1) this.cart.splice(idx,1);
    },  
    // count how many times a product is in cart
    cartCount(id) {
      return this.cart.filter(item => item.id === id).length;
    },
    canAddToCart(product) {
      return product.availableInventory > this.cartCount(product.id);
    },
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
    isValidLastName(){
      const name = /^[A-Za-z\s]+$/; // only letters and spaces, $ for end of string
      return name.test(this.order.lastName) && this.order.lastName.trim() !== '';
    },
    isValidPhone(){
      const phoneRegex = /^[0-9]+$/; // only numbers, $ for end of string
      return phoneRegex.test(this.order.phone) && this.order.phone.trim() !== '';
    },
    canCheckout(){
      return this.isValidLastName() && this.isValidName() && this.isValidPhone();
    },
    submitForm() {
      if(this.canCheckout() && this.cart.length > 0){
      alert(
        `Order placed by ${this.order.firstName} ${this.order.lastName}!`
      );
      this.cart = []; // clear cart after order
      this.showProduct = true;
      this.order.firstName = '';
      this.order.phone = '';
    }
    },
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
},

  computed: {
    cartItemCount() {
      return this.cart.length || '';
    },
    sortedProducts() {
      if(!this.showProduct) return[];
      
      const q = this.query.trim().toLowerCase(); //define q

      // query filter
      const filtered = this.products.filter(p =>{
        if(!q) return true;
        const subj =String(p.subject || '').toLowerCase();
        const loc =String(p.location || '').toLowerCase();
        return subj.includes(q) || loc.includes(q);
      });
      // Order Sortby/sortOrder
      const sorted =filtered.slice().sort((a,b) => {
      //  Sort by subject, location, price or availability
        let aVal, bVal;
        // case of sorting 
        switch(this.sortBy) {
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
        if (this.sortOrder === 'ascending') {
          if (aVal < bVal) return -1;
          if (aVal > bVal) return 1;
          return 0;
        } else {
          if (aVal > bVal) return -1;
          if (aVal < bVal) return 1;
          return 0;
        }
      });
      
      return sorted;
    },
    cartGrouped() {
    const map = new Map();
    this.cart.forEach(item => {
      if (!map.has(item.id)) {
        map.set(item.id, { ...item, qty: 0 });
      }
      map.get(item.id).qty += 1;
    });
    return Array.from(map.values()); // [{id, subject, price, location, qty}, ...]
  },
    cartTotal(){
      return this.cart.reduce((total, item) => total + item.price, 0);
    }
  }
});