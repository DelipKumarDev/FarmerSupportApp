# Testing Checklist - Step 7

Complete testing checklist for the Farmer Support & Marketplace Web App.

## Pre-Testing Setup

- [ ] Backend server running on `http://localhost:5000`
- [ ] Frontend server running on `http://localhost:5173`
- [ ] MongoDB Atlas connected and database seeded
- [ ] Test accounts created via `npm run seed`
- [ ] Browser DevTools open (F12)
- [ ] Network tab monitoring enabled

**Test Accounts Available:**
```
Admin:      admin@farmerapp.com / TestPassword123
Farmer1:    farmer1@example.com / TestPassword123
Farmer2:    farmer2@example.com / TestPassword123
Customer1:  customer1@example.com / TestPassword123
Customer2:  customer2@example.com / TestPassword123
```

---

## 1. Authentication Tests

### 1.1 User Registration
- [ ] Register page loads without errors
- [ ] Form shows all required fields (name, email, password, role, phone, city, state)
- [ ] Role dropdown shows 3 options (farmer, customer, admin)
- [ ] Password field masks input
- [ ] Email validation prevents invalid emails
- [ ] Password confirmation optional but checked if provided
- [ ] Submit button disabled while loading
- [ ] Success: User redirected to dashboard
- [ ] User data stored in localStorage
- [ ] JWT token stored in localStorage with key "token"
- [ ] User info stored in localStorage with key "user"
- [ ] Duplicate email prevented with error message
- [ ] Form clears after successful registration

### 1.2 User Login
- [ ] Login page loads without errors
- [ ] Email and password fields accept input
- [ ] "Forgot Password" link present (non-functional OK for MVP)
- [ ] Demo credentials box displays test accounts
- [ ] Demo credentials are clickable/copyable
- [ ] Submit button disabled while loading
- [ ] Invalid credentials show error message
- [ ] Success: User redirected to dashboard
- [ ] JWT token obtained and stored
- [ ] User data stored in localStorage
- [ ] Login persists after page refresh
- [ ] Multiple failed logins don't lock account

### 1.3 Logout
- [ ] Logout button visible in navbar
- [ ] Clicking logout clears localStorage
- [ ] User redirected to home page
- [ ] Accessing protected routes redirects to login
- [ ] Previous token no longer valid for API calls
- [ ] Session cleanly terminated

### 1.4 Session Persistence
- [ ] Login, refresh page, still logged in
- [ ] Close browser tab, reopen, still logged in
- [ ] Open app in separate tab, session shared
- [ ] Logout in one tab logs out all tabs
- [ ] Token-based auth works across multiple pages

### 1.5 Role-Based Access
- [ ] Farmer cannot access /admin/users
- [ ] Customer cannot access /admin/dashboard
- [ ] Admin can access all admin pages
- [ ] Unauthorized access redirects to login
- [ ] NavBar shows different content per role
- [ ] Dashboard shows role-specific tiles

---

## 2. Farmer Features Tests

### 2.1 Crop Guides
- [ ] Crop guides page loads
- [ ] All crops display in dropdown
- [ ] Crop selection filters guides
- [ ] Guides show stage badges (preparation, sowing, growing, harvesting)
- [ ] Guide content displays properly formatted
- [ ] Tips array displays as list
- [ ] Warnings show with warning icon/color
- [ ] Fertilizer details (name, quantity, timing) display
- [ ] Irrigation details (frequency, quantity) display
- [ ] Multiple guides per crop show correctly
- [ ] Page responsive on mobile
- [ ] Search/filter works if implemented

### 2.2 Disease Detection
- [ ] Page accessible to logged-in users only
- [ ] Crop dropdown populated
- [ ] File upload accepts image files (jpg, png)
- [ ] File upload rejects non-image files
- [ ] Image preview shows after selection
- [ ] Clear image button works
- [ ] Submit button disabled until image selected
- [ ] Loading animation shows during processing
- [ ] Detection result displays disease name
- [ ] Confidence percentage shows (0-100%)
- [ ] Severity badge displays (low/medium/high)
- [ ] Treatment section shows:
  - [ ] Organic methods
  - [ ] Chemical methods
  - [ ] Preventive measures
- [ ] Detection history loads previous detections
- [ ] History sorted by date (newest first)
- [ ] Each history item clickable to view details

### 2.3 Product Creation
- [ ] Farmer product page loads
- [ ] Create product form shows/hides with toggle
- [ ] Form fields:
  - [ ] Crop dropdown populated with all crops
  - [ ] Product name accepts text input
  - [ ] Description accepts multiline text
  - [ ] Quantity number input (amount + unit select)
  - [ ] Unit dropdown has kg, liters, items, etc.
  - [ ] Base price number input
- [ ] Form validation prevents blank required fields
- [ ] Form submission creates product
- [ ] New product appears in product list immediately
- [ ] Product list shows all farmer's products
- [ ] Product cards display:
  - [ ] Product name
  - [ ] Crop type
  - [ ] Quantity
  - [ ] Base price
  - [ ] Date created
- [ ] Edit button on each product (UI ready)
- [ ] Delete button on each product (UI ready)
- [ ] Success message after creation

### 2.4 Market Prices
- [ ] Market prices visible from crop guides page
- [ ] Prices shown for selected crop
- [ ] Price data includes:
  - [ ] Market name and location
  - [ ] Min price
  - [ ] Max price
  - [ ] Average price
  - [ ] Quantity unit
  - [ ] Date of price
- [ ] Price trend indicator (up/down/stable)
- [ ] Multiple markets shown for comparison
- [ ] Responsive table/card layout

---

## 3. Customer Features Tests

### 3.1 Marketplace Browsing
- [ ] Marketplace page loads
- [ ] Product grid displays all listings
- [ ] Each product card shows:
  - [ ] Product image (if available)
  - [ ] Product name
  - [ ] Farmer name
  - [ ] Current price
  - [ ] Rating/reviews (if available)
  - [ ] Quantity available
  - [ ] Add to cart button
- [ ] Pagination works if 10+ listings
- [ ] Page responsive on mobile

### 3.2 Marketplace Filtering
- [ ] Price range slider works
- [ ] Min price field accepts input
- [ ] Max price field accepts input
- [ ] Crop filter dropdown populated
- [ ] Farmer filter dropdown populated
- [ ] Filters apply immediately
- [ ] Multiple filters work together
- [ ] Clear filters button resets all
- [ ] "No results" message if no matches

### 3.3 Shopping Cart
- [ ] Cart sidebar visible on marketplace
- [ ] Cart count shows items
- [ ] Add to cart updates count immediately
- [ ] Cart expands to show items
- [ ] Each item shows:
  - [ ] Product name
  - [ ] Quantity
  - [ ] Unit price
  - [ ] Line total
- [ ] Quantity selector (+ / - buttons)
- [ ] Remove item button
- [ ] Cart subtotal calculates correctly
- [ ] Cart persists during session
- [ ] Cart summary shows shipping (optional)
- [ ] Apply discount code field present
- [ ] Checkout button visible

### 3.4 Discount Codes
- [ ] Discount code input field in cart
- [ ] Code accepts uppercase letters
- [ ] Submit code button
- [ ] Valid code shows discount amount
- [ ] Discount amount deducted from total
- [ ] Invalid code shows error
- [ ] Expired code shows error with reason
- [ ] Customer can't use code outside role
- [ ] Minimum order rules enforced
- [ ] Final amount recalculates

### 3.5 Order Placement
- [ ] Checkout process clear and intuitive
- [ ] Order confirmation after placement
- [ ] Order ID generated and shown
- [ ] Confirmation email sent (if email set up)
- [ ] Cart cleared after purchase
- [ ] Order appears in customer order history

---

## 4. Order Management Tests

### 4.1 Customer Orders
- [ ] Customer can access /orders page
- [ ] Page title shows "My Orders"
- [ ] All customer's orders listed
- [ ] Each order shows:
  - [ ] Order ID
  - [ ] Order date
  - [ ] Status badge (color-coded)
  - [ ] From (farmer name)
  - [ ] Total amount
  - [ ] Number of items
- [ ] Clicking order shows details
- [ ] Order details include:
  - [ ] All items ordered
  - [ ] Quantity per item
  - [ ] Unit price
  - [ ] Discount applied
  - [ ] Shipping address
  - [ ] Expected delivery date
- [ ] Order status timeline (if implemented)
- [ ] Download invoice button (if implemented)

### 4.2 Farmer Orders
- [ ] Farmer can access /orders page
- [ ] Page title shows "Farmer Orders" or "Orders Received"
- [ ] Only orders farmer received shown
- [ ] Each order shows customer name
- [ ] Farmer can expand to see items
- [ ] Status dropdown/button to update status
- [ ] Can change status to:
  - [ ] pending → confirmed
  - [ ] confirmed → shipped
  - [ ] shipped → delivered
  - [ ] any → cancelled
- [ ] Status update saved to database
- [ ] Order details accessible

### 4.3 Order Status
- [ ] Status values: pending, confirmed, shipped, delivered, cancelled
- [ ] Each status has distinct badge color:
  - [ ] Pending: yellow/orange
  - [ ] Confirmed: blue
  - [ ] Shipped: purple
  - [ ] Delivered: green
  - [ ] Cancelled: red/gray
- [ ] Status transitions logical
- [ ] Cannot go backwards (delivered → shipped NOT allowed)
- [ ] Status changes reflect immediately

---

## 5. Admin Features Tests

### 5.1 Admin Dashboard
- [ ] Admin only can access /admin/dashboard
- [ ] Dashboard loads without errors
- [ ] Stat cards display correct data:
  - [ ] Total Users count
  - [ ] Active Users count
  - [ ] Farmer count
  - [ ] Customer count
  - [ ] Total Orders count
  - [ ] Pending Orders count
  - [ ] Delivered Orders count
  - [ ] Total Revenue
- [ ] Listing count accurate
- [ ] Revenue calculated correctly (delivered orders sum)
- [ ] Stat cards responsive
- [ ] Quick action cards present and functional

### 5.2 User Management
- [ ] Admin can access /admin/users
- [ ] User list loads with pagination
- [ ] Default page size 10
- [ ] Table shows columns:
  - [ ] Name
  - [ ] Email
  - [ ] Role (with badge)
  - [ ] Location (city, state)
  - [ ] Status (active/inactive)
  - [ ] Actions
- [ ] Pagination controls:
  - [ ] Previous button
  - [ ] Next button
  - [ ] Page number display
  - [ ] Previous disabled on page 1
- [ ] Role filter works:
  - [ ] All roles option
  - [ ] Filter by farmer
  - [ ] Filter by customer
  - [ ] Filter by admin
- [ ] Status filter works:
  - [ ] All status option
  - [ ] Filter by active
  - [ ] Filter by inactive
- [ ] Multiple filters work together
- [ ] Clear filters button resets both filters
- [ ] View user link on each row
- [ ] User detail page loads

### 5.3 User Detail View
- [ ] User detail page shows all user info:
  - [ ] Name, email, phone
  - [ ] Role and status
  - [ ] City, state, pincode
  - [ ] Account creation date
  - [ ] Last login (if available)
- [ ] Edit button (UI ready)
- [ ] Deactivate button (UI ready)
- [ ] Back to list link
- [ ] User-specific data relevant to role

### 5.4 Discount Management
- [ ] Admin can access /admin/discounts
- [ ] Create Discount form toggle works
- [ ] Form fields:
  - [ ] Code (generates uppercase)
  - [ ] Description
  - [ ] Type (percentage/fixed)
  - [ ] Value (number)
  - [ ] Min order amount
  - [ ] Start date (date picker)
  - [ ] End date (date picker)
  - [ ] Applicable roles (multiselect)
- [ ] Form validation:
  - [ ] Code required
  - [ ] Value required
  - [ ] Type required
  - [ ] Start before end date
- [ ] Submit creates discount
- [ ] New discount appears in list
- [ ] Discount list shows:
  - [ ] Code (uppercase)
  - [ ] Type/value badge (15% or ₹500)
  - [ ] Min order amount
  - [ ] Usage count/limit
  - [ ] Valid until date
  - [ ] Edit/delete buttons
- [ ] Pagination works if 10+ codes

### 5.5 Discount Validation (Public)
- [ ] Validation endpoint accessible without login
- [ ] Validation checks:
  - [ ] Code exists
  - [ ] Code active (isActive = true)
  - [ ] Within date range (startDate ≤ now ≤ endDate)
  - [ ] User role applicable
  - [ ] Usage limit not exceeded
- [ ] Valid code returns discount details
- [ ] Invalid code returns error with reason
- [ ] Customer can apply during checkout
- [ ] Admin can test via admin page

### 5.6 Value Addition Management
- [ ] Admin can access /api/value-addition (backend ready)
- [ ] Public can access /value-addition
- [ ] Category tabs:
  - [ ] All guides (default)
  - [ ] Processing
  - [ ] Packaging
  - [ ] Storage
  - [ ] Branding
  - [ ] Certification
- [ ] Content displays in grid
- [ ] Each guide card shows:
  - [ ] Title
  - [ ] Category badge
  - [ ] Description
  - [ ] Estimated cost (min-max)
  - [ ] Expected return %
  - [ ] First 3 benefits
  - [ ] Read full guide button
- [ ] Clicking guides shows full content
- [ ] Full content includes:
  - [ ] Steps with substeps
  - [ ] Equipment list with costs
  - [ ] Required skills
  - [ ] Total estimated cost
  - [ ] Expected return amount
  - [ ] Related content links
- [ ] Pagination works

---

## 6. API Endpoint Tests

### 6.1 Authentication Endpoints
- [ ] POST /auth/register
  - [ ] New user creation works
  - [ ] Duplicate email rejected
  - [ ] Password hashed (never plain text in DB)
  - [ ] Returns JWT token
- [ ] POST /auth/login
  - [ ] Correct credentials return token
  - [ ] Wrong credentials rejected
  - [ ] Locked out users (isActive=false) cannot login
  - [ ] Returns 7-day expiry token
- [ ] GET /auth/profile
  - [ ] Returns user data with auth
  - [ ] 401 without token
  - [ ] 401 with expired token
- [ ] PUT /auth/profile
  - [ ] Partial updates work
  - [ ] Requires auth
  - [ ] Email conflicts rejected
- [ ] POST /auth/change-password
  - [ ] Current password verified
  - [ ] New password hashed
  - [ ] Old password no longer works

### 6.2 Crop Endpoints
- [ ] GET /crops
  - [ ] Returns all crops
  - [ ] No auth required
- [ ] GET /crops/:id
  - [ ] Returns specific crop
  - [ ] Includes guides
  - [ ] Includes market prices
- [ ] GET /crops/guides
  - [ ] Returns all guides
  - [ ] ?cropId filter works
  - [ ] No auth required

### 6.3 Disease Endpoints
- [ ] POST /disease/detect
  - [ ] Requires auth and file upload
  - [ ] Returns mock disease detection
  - [ ] Saves detection to database
  - [ ] Rejects non-image files
- [ ] GET /disease/history
  - [ ] Returns user's detection history
  - [ ] Requires auth
  - [ ] Sorted by date descending
- [ ] GET /disease/:id
  - [ ] Returns specific detection
  - [ ] Requires auth
  - [ ] Only user's own detections accessible

### 6.4 Marketplace Endpoints
- [ ] POST /marketplace/products
  - [ ] Creates product for farmer
  - [ ] Requires farmer role
  - [ ] Returns created product
- [ ] GET /marketplace/products
  - [ ] Returns farmer's products
  - [ ] Requires auth
- [ ] GET /marketplace/listings
  - [ ] Returns all listings
  - [ ] No auth required
  - [ ] Pagination works
  - [ ] Filters work (price, crop, farmer)
- [ ] POST /marketplace/listings
  - [ ] Creates listing
  - [ ] Requires farmer role and auth

### 6.5 Order Endpoints
- [ ] POST /orders/create
  - [ ] Creates order with items
  - [ ] Calculates total price
  - [ ] Applies discount if valid
  - [ ] Requires auth
  - [ ] Returns order ID
- [ ] GET /orders/my-orders
  - [ ] Returns customer's orders
  - [ ] Requires auth
  - [ ] Customer only sees own orders
- [ ] GET /orders/farmer-orders
  - [ ] Returns farmer's received orders
  - [ ] Requires auth and farmer role
  - [ ] Cross-tenant security works
- [ ] PUT /orders/:id/status
  - [ ] Updates order status
  - [ ] Farmer only
  - [ ] Validates status enum
  - [ ] Only farmer who received order can update

### 6.6 Admin Endpoints
- [ ] GET /admin/dashboard/stats
  - [ ] Returns all 8 metrics
  - [ ] Requires admin role
  - [ ] Calculations accurate
- [ ] GET /admin/users
  - [ ] Returns paginated users
  - [ ] Filters work
  - [ ] Requires admin role
  - [ ] Pagination correct
- [ ] GET /admin/users/:id
  - [ ] Returns user details
  - [ ] Requires admin role
- [ ] PUT /admin/users/:id
  - [ ] Updates user
  - [ ] Requires admin role
- [ ] POST /admin/users/:id/deactivate
  - [ ] Sets isActive to false
  - [ ] Prevent login
  - [ ] Requires admin role

### 6.7 Discount Endpoints
- [ ] POST /discounts/validate (public)
  - [ ] No auth required
  - [ ] Code case-insensitive
  - [ ] Returns discount if valid
  - [ ] Returns error if invalid
- [ ] POST /discounts (admin)
  - [ ] Creates discount code
  - [ ] Requires admin role
  - [ ] Enforces unique code
- [ ] GET /discounts (admin)
  - [ ] Returns all codes
  - [ ] Pagination works
  - [ ] Active/expired filter works

### 6.8 Value Addition Endpoints
- [ ] GET /value-addition (public)
  - [ ] Returns all guides
  - [ ] Pagination works
  - [ ] Category filter works
  - [ ] Crop filter works
- [ ] GET /value-addition/:id (public)
  - [ ] Returns full guide
  - [ ] Includes all details
- [ ] POST /value-addition (admin)
  - [ ] Creates guide
  - [ ] Requires admin role

---

## 7. Security Tests

- [ ] XSS Protection:
  - [ ] User input sanitized
  - [ ] No script injection possible
  - [ ] HTML entities encoded in display
- [ ] CSRF Protection:
  - [ ] No token forgery possible
  - [ ] State verified
- [ ] Authentication:
  - [ ] JWT tokens required for protected routes
  - [ ] Expired tokens rejected
  - [ ] Invalid tokens rejected
- [ ] Authorization:
  - [ ] User can only access own data
  - [ ] Farmer can only update own products
  - [ ] Admin-only endpoints reject non-admins
- [ ] SQL Injection:
  - [ ] Not applicable (MongoDB/Mongoose)
  - [ ] Input validation on backend
- [ ] Data Privacy:
  - [ ] Passwords never returned in API
  - [ ] Email not shown to other users
  - [ ] User phone/address private

---

## 8. Browser Compatibility Tests

**Chrome/Edge (Latest)**
- [ ] All pages load
- [ ] Forms work
- [ ] File upload works
- [ ] Debug: Check console for errors

**Firefox (Latest)**
- [ ] All pages load
- [ ] All features work
- [ ] No console errors

**Safari (Latest)**
- [ ] All pages load
- [ ] Touch/swipe gestures work
- [ ] iOS Safari responsive

**Mobile Chrome/Firefox**
- [ ] Responsive layout works
- [ ] Touch interactions work
- [ ] File upload from camera works

---

## 9. Performance Tests

### Frontend Performance
- [ ] Page load time < 3 seconds
- [ ] Initial bundle size < 500KB
- [ ] Images optimized (< 100KB each)
- [ ] Run Lighthouse:
  - [ ] Performance: 80+
  - [ ] Accessibility: 90+
  - [ ] Best Practices: 90+
  - [ ] SEO: 90+

### Backend Performance
- [ ] API response time < 500ms
- [ ] Database queries optimized
- [ ] Upload file processing fast
- [ ] Pagination prevents huge datasets

### Network
- [ ] Gzip compression enabled
- [ ] API responses < 100KB
- [ ] No unnecessary requests
- [ ] Caching working (if implemented)

---

## 10. Error Handling Tests

### 400 Bad Request
- [ ] Missing required fields return 400
- [ ] Invalid data types return 400
- [ ] Validation errors shown to user

### 401 Unauthorized
- [ ] Missing token returns 401
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] Frontend redirects to login

### 403 Forbidden
- [ ] Non-admin accessing admin route returns 403
- [ ] Frontend blocks navigation

### 404 Not Found
- [ ] Nonexistent resource returns 404
- [ ] Helpful error message shown
- [ ] User can navigate back

### 500 Server Error
- [ ] Server errors logged
- [ ] User sees friendly message
- [ ] Not database password exposed
- [ ] Not stack traces in production

---

## 11. Data Integrity Tests

- [ ] User cannot delete another user
- [ ] Farmer cannot update another farmer's products
- [ ] Customer cannot see other customer's orders
- [ ] Deleted products cannot be ordered
- [ ] Discount usage limit enforced
- [ ] Product quantity updates correctly
- [ ] Order total calculated accurately
- [ ] No negative quantities allowed
- [ ] No future order dates
- [ ] Timestamps accurate

---

## 12. Stress Tests

### High Load
- [ ] Server handles 10 concurrent users
- [ ] Database handles 1000+ documents
- [ ] File upload with 100MB file (if applicable)
- [ ] Large result set pagination

### Memory
- [ ] No memory leaks
- [ ] LocalStorage usage reasonable
- [ ] Database connections pooled

---

## Test Results Summary

| Category | Passed | Failed | Notes |
|----------|--------|--------|-------|
| Authentication | /7 | | |
| Farmer Features | /4 | | |
| Customer Features | /5 | | |
| Orders | /3 | | |
| Admin Features | /6 | | |
| API Endpoints | /8 | | |
| Security | /1 | | |
| Browser Compat | /5 | | |
| Performance | /3 | | |
| Error Handling | /5 | | |
| Data Integrity | /10 | | |
| Stress Tests | /3 | | |
| **TOTAL** | **/50** | | |

---

## Sign-off

**Tester Name**: ________________  
**Date**: ________________  
**Build Version**: Step 7 Complete  
**Environment**: Development  
**Overall Status**: ☐ PASS ☐ FAIL ☐ PASS WITH ISSUES

**Notes/Issues Found**:
```
[List any bugs or issues found during testing]



```

---

**Last Updated**: Step 7 - Integration & Testing
