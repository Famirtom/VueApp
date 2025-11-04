# Vue Front-End App
  
Live demo: https://famirtom.github.io/VueApp/
Repository: https://github.com/Famirtom/VueApp

### 🔗 Connected API (Render)
https://vueapp-backend.onrender.com/api/lessons

This is the Front-end of a fictitious web app where students/parents can browse and but after-school classes.

## Tech
**Vue.js 2** (CDN) for rendering and interactivity
**Vanilla JS** (no libraries that replicate Vue feature)
**Font Awesome** for icons
**Plain CSS** (no CSS framework)

**How to Run**

-Open 'index.html' in a browser.
-Simple login (client-side only):
  **Username:** 'Tom'
  **Password:** '123'
-After login you land on 'home.html'.

For GitHub pages the app is served from this repo root, so no build step is required.

## App Structure
/images/ - Store lesson images + background and logo
index.html - login page(Vue inline)
home.html - lessons & cart (Vue app)
pruducts.js - local sample data (10 lessons, 5 spaces each)
app.js - VUe app logic (sorting, cart, checkout)
style.css - styles

## Diplay lessons (Front-end)
- At least **10 lessons** , each with **5 spaces**
- Each lesson shows **Subject**, **Location**, **Price**, **Space left**, and an **image**
- Rendering with **v-for**
  source: 'product.js' and the template in 'home.html'.

## Sorting
-Sort by **Subject/ location/ Price / spaces**
-Sort order **Ascending/ Descending**
-Implemented in 'Computed.sortedProducts' in 'app.js'

## Add to cart
- “Add to cart” button is always visible; it is **enabled** only while spaces are available, and shows a **disabled** button otherwise.  
- Adding to cart reduces the remaining spaces **logically** (`availableInventory - cartCount`).  
- Remove from cart puts the space back.

## Shopping cart
- The **cart button** is disabled when empty; clicking it toggles **list ⇄ cart**.  
- The cart lists all items and allows **removal**.  
- Shows **total** and **item count**.

## Checkout
- **On the cart page**.  
- Input validation:
  - **First name / Last name:** letters only  
  - **Phone:** numbers only  
- The **Place Order** button is enabled only when the inputs are valid and the cart is not empty.  
- Submitting shows a confirmation and resets the cart.



## NOTE
- This repo intentionally avoids Vue CLI; it’s a **static** Vue app for GitHub Pages.  
- No libraries are used that replicate Vue features (compliant with the brief).  
- Images and paths are case-sensitive on GitHub Pages (folder `Images/`).

