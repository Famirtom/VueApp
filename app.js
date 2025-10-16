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
    }
  },

  computed: {
    cartItemCount() {
      return this.cart.length || '';
    },
    sortedProducts() {
      let sorted = [...this.products];
      
      //  Sort by subject, location, price or availability
      sorted.sort((a, b) => {
        let aVal, bVal;
        
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
          case 'availability':
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
    cartTotal(){
      return this.cart.reduce((total, item) => total + item.price, 0);
    }

  }
});