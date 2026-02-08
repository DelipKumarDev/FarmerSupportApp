# API Endpoints Reference - Step 4

All endpoints are available at base URL: `http://localhost:5000/api`

## Crops & Guidance

### Get All Crops
**GET** `/crops`
- No authentication required
- Returns: List of all available crops

```bash
curl http://localhost:5000/api/crops
```

### Get Crop Details
**GET** `/crops/:id`
- Returns: Crop info + guides + market prices

### Get Crop Guides
**GET** `/crops/guides?cropId=ID`
- Query params: `cropId` (optional)
- Returns: List of guides for specific crop or all guides

### Create Crop Guide (Admin only)
**POST** `/crops/guides`
- Requires: Authentication + Admin role
- Body:
```json
{
  "cropId": "crop_id",
  "title": "Guide Title",
  "content": "Guide content",
  "stage": "preparation|sowing|growing|harvesting",
  "tips": ["tip1", "tip2"],
  "warnings": ["warning1"],
  "fertilizer": {
    "name": "NPK 20:20:0",
    "quantity": "25 kg",
    "time": "Before sowing"
  },
  "irrigation": {
    "frequency": "Every 20-25 days",
    "quantity": "5-6 cm"
  }
}
```

### Get Market Prices
**GET** `/crops/prices?cropId=ID&city=CITY`
- Query params: `cropId`, `city` (optional)
- Returns: Market prices for crops

---

## Disease Detection

### Detect Disease (Upload Image)
**POST** `/disease/detect`
- Requires: Authentication + File upload
- Form data:
  - `image`: Image file (JPG, PNG, GIF)
  - `cropId`: Crop ID
- Returns: Disease detection result with treatment options

```bash
curl -X POST http://localhost:5000/api/disease/detect \
  -H "Authorization: Bearer TOKEN" \
  -F "image=@image.jpg" \
  -F "cropId=crop_id"
```

### Get Disease Detection History
**GET** `/disease/history?cropId=ID`
- Requires: Authentication
- Query params: `cropId` (optional)
- Returns: User's past detection results

### Get Specific Disease Result
**GET** `/disease/:id`
- Requires: Authentication
- Returns: Detailed disease detection result

---

## Marketplace

### Get Farm Products (Farmer only)
**GET** `/marketplace/products`
- Requires: Authentication + Farmer role
- Returns: User's farm products

### Create Farm Product (Farmer only)
**POST** `/marketplace/products`
- Requires: Authentication + Farmer role
- Body:
```json
{
  "cropId": "crop_id",
  "productName": "Product Name",
  "description": "Description",
  "quantity": {
    "amount": 100,
    "unit": "kg|quintals|tons|liters"
  },
  "basePrice": 5000,
  "certifications": ["organic"],
  "harvestDate": "2024-01-15",
  "storageConditions": "Cool, dry place"
}
```

### Update Farm Product (Farmer only)
**PUT** `/marketplace/products/:id`
- Requires: Authentication + Farmer role

### Create Marketplace Listing
**POST** `/marketplace/listings`
- Requires: Authentication + Farmer role
- Body:
```json
{
  "productId": "product_id",
  "title": "Fresh Wheat",
  "description": "High quality organic wheat",
  "price": 5500,
  "minOrder": { "amount": 10, "unit": "kg" },
  "maxOrder": { "amount": 1000, "unit": "kg" },
  "availableQuantity": { "amount": 500, "unit": "kg" },
  "listingType": "direct|wholesale"
}
```

### Get All Listings
**GET** `/marketplace/listings?page=1&minPrice=1000&maxPrice=10000&crop=ID&farmer=ID`
- No authentication required
- Query params: `page`, `minPrice`, `maxPrice`, `crop`, `farmer` (all optional)
- Returns: Paginated listings with farmer info

### Get Listing Detail
**GET** `/marketplace/listings/:id`
- No authentication required
- Returns: Full listing details with farmer info

### Update Listing (Farmer only)
**PUT** `/marketplace/listings/:id`
- Requires: Authentication + Farmer role

---

## Orders

### Create Order
**POST** `/orders/create`
- Requires: Authentication
- Body:
```json
{
  "items": [
    {
      "productId": "listing_id",
      "quantity": {
        "amount": 50,
        "unit": "kg"
      }
    }
  ],
  "farmerId": "farmer_id",
  "shippingAddress": {
    "name": "Customer Name",
    "phone": "9876543210",
    "address": "Address",
    "city": "City",
    "state": "State",
    "pincode": "123456"
  },
  "paymentMethod": "cash|online",
  "discountCode": "CODE123" (optional)
}
```
- Returns: Order confirmation with order ID

### Get My Orders (Customer)
**GET** `/orders/my-orders`
- Requires: Authentication + Customer role
- Returns: Customer's orders with details

### Get Farmer Orders
**GET** `/orders/farmer-orders`
- Requires: Authentication + Farmer role
- Returns: Orders received by farmer

### Get Order Details
**GET** `/orders/:id`
- Requires: Authentication
- Returns: Full order details

### Update Order Status (Farmer only)
**PUT** `/orders/:id/status`
- Requires: Authentication + Farmer role
- Body:
```json
{
  "status": "pending|confirmed|shipped|delivered|cancelled"
}
```

---

## Authentication Endpoints

### Register
**POST** `/auth/register`
- Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "farmer|customer|admin",
  "phone": "9876543210",
  "city": "Delhi",
  "state": "Delhi"
}
```

### Login
**POST** `/auth/login`
- Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Profile
**GET** `/auth/profile`
- Requires: Authentication

### Update Profile
**PUT** `/auth/profile`
- Requires: Authentication

### Change Password
**POST** `/auth/change-password`
- Requires: Authentication

### Logout
**POST** `/auth/logout`
- Requires: Authentication

---

## Admin Endpoints

### Get Dashboard Stats
**GET** `/admin/dashboard/stats`
- Requires: Authentication + Admin role
- Returns: User counts, order metrics, listings count, revenue
- Response:
```json
{
  "stats": {
    "users": {
      "total": 10,
      "farmers": 4,
      "customers": 5,
      "active": 8
    },
    "orders": {
      "total": 15,
      "delivered": 8,
      "pending": 5,
      "revenue": 45000
    },
    "listings": 12
  }
}
```

### Get All Users
**GET** `/admin/users?page=1&role=farmer&status=active`
- Requires: Authentication + Admin role
- Query params: `page`, `role` (farmer|customer|admin), `status` (active|inactive)
- Returns: Paginated list of users

### Get User Details
**GET** `/admin/users/:id`
- Requires: Authentication + Admin role
- Returns: Full user profile

### Update User
**PUT** `/admin/users/:id`
- Requires: Authentication + Admin role
- Body: Partial fields (name, email, role, city, state, phone)

### Deactivate User
**POST** `/admin/users/:id/deactivate`
- Requires: Authentication + Admin role
- Deactivates user (sets isActive to false)

---

## Discount Management Endpoints

### Validate Discount Code
**POST** `/discounts/validate`
- No authentication required (public)
- Body:
```json
{
  "code": "SUMMER25",
  "role": "farmer"
}
```
- Returns: Discount details if valid, error otherwise

### Get All Discounts
**GET** `/discounts?page=1&active=true`
- Requires: Authentication + Admin role
- Query params: `page`, `active` (filters by date validity)
- Returns: Paginated list of discounts

### Create Discount
**POST** `/discounts`
- Requires: Authentication + Admin role
- Body:
```json
{
  "code": "SUMMER25",
  "description": "Summer promotion",
  "discountType": "percentage|fixed",
  "discountValue": 15,
  "minOrderAmount": 500,
  "maxUsageCount": 100,
  "applicableRoles": ["farmer", "customer"],
  "startDate": "2024-06-01",
  "endDate": "2024-08-31"
}
```

### Get Discount Details
**GET** `/discounts/:id`
- Requires: Authentication + Admin role
- Returns: Complete discount information

### Update Discount
**PUT** `/discounts/:id`
- Requires: Authentication + Admin role
- Body: Partial fields (description, minOrderAmount, isActive, endDate)

### Deactivate Discount
**POST** `/discounts/:id/deactivate`
- Requires: Authentication + Admin role
- Deactivates discount immediately

---

## Value Addition Content Endpoints

### Get All Value Addition Content
**GET** `/value-addition?page=1&category=processing&crop=crop_id`
- No authentication required
- Query params: `page`, `category` (processing|packaging|storage|branding|certification), `crop`
- Returns: Paginated list of guides

### Get Content Details
**GET** `/value-addition/:id`
- No authentication required
- Returns: Full guide with steps, equipment, skills, costs

### Get Content by Category
**GET** `/value-addition/category/:category`
- No authentication required
- Returns: All guides in specified category

### Create Value Addition Content
**POST** `/value-addition`
- Requires: Authentication + Admin role
- Body:
```json
{
  "title": "Honey Packaging Guide",
  "description": "How to properly package honey",
  "cropId": "crop_id",
  "category": "packaging",
  "content": "Detailed guide content",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Prepare containers",
      "description": "Choose clean glass jars",
      "tips": ["Use sterilized jars", "Avoid plastic"]
    }
  ],
  "benefits": ["Increases shelf life", "Better pricing"],
  "equipment": [
    {
      "name": "Glass jars",
      "cost": 50,
      "supplier": "Local supplier"
    }
  ],
  "requiredSkills": "Basic packaging knowledge",
  "estimatedCost": {
    "min": 1000,
    "max": 5000
  },
  "expectedReturn": {
    "percentage": 40
  },
  "images": ["url1"],
  "relatedLinks": ["link1"]
}
```

### Update Value Addition Content
**PUT** `/value-addition/:id`
- Requires: Authentication + Admin role
- Body: Partial fields

### Delete Value Addition Content
**DELETE** `/value-addition/:id`
- Requires: Authentication + Admin role
- Removes the guide

---

## Testing Endpoints

### Health Check
**GET** `/health`
- No authentication
- Returns: Server status

---

## Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

### Paginated Response
```json
{
  "message": "Listings retrieved",
  "count": 12,
  "total": 100,
  "page": 1,
  "pages": 9,
  "listings": [ ... ]
}
```

---

## Authentication

All protected endpoints require JWT token in the header:

```
Authorization: Bearer <your_jwt_token>
```

Token is returned in login/register responses and valid for 7 days.

---

**Last Updated**: Step 4 Complete
