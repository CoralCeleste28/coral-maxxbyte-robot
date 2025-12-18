# <center>Video Game Store API

---

## Project Overview
This application allows users to browse a video game storefront, create an account, log in securely, and add products to a personal shopping cart.
Authenticated users can view and manage their cart, while administrators can create, update, and remove products and categories.

---

## This project demonstrates:

- Clean REST API design
- Secure authentication with JWT
- JDBC-based persistence
- DAO + MVC architecture
- Full-stack integration

---

## Key Features
- Product browsing & filtering
- Login / logout
- Add to cart
- View cart totals
- Profile management

### Authentication
- Secure user login using JWT tokens
- Role-based authorization (`ROLE_USER`, `ROLE_ADMIN`)

### Shopping Cart
- Add, update, or remove products
- Automatically updates item quantity if added again
- Clear the entire cart

### Database
- Utilizes a MySQL database
- DAO pattern with Spring-managed Beans

---

## Storefront

#### Here you can:
- View all products or filter by category, price, or subcategory
- CRUD operations for `Products` and `Categories`
- Supports image URLs, stock tracking, and featured items

### Screenshots
___

### Home page:

![homepage.png](frontend-ui/images/screenshots/homepage.png)

### Login Screen:

![login.png](frontend-ui/images/screenshots/login.png)

### Minimum Slider:

![min slider.png](frontend-ui/images/screenshots/min%20slider.png)

### Maximum Slider:

![max slider.png](frontend-ui/images/screenshots/max%20slider.png)

### Filtering by Category:

![filtering.png](frontend-ui/images/screenshots/filtering.png)

### Adding to Cart:

![added to cart.png](frontend-ui/images/screenshots/added%20to%20cart.png)

### Cart Screen

![cart screen.png](frontend-ui/images/screenshots/cart%20screen.png)

---

## Future Enhancements

- Order total in cart
- Order checkout & order history
- Payment processing integration
- Product reviews
- Inventory alerts









