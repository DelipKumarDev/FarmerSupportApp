# Frontend Documentation

This document describes the React frontend application structure, pages, and features.

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx              # User login page
│   │   ├── RegisterPage.jsx           # User registration page
│   │   ├── DashboardPage.jsx          # Role-based dashboard
│   │   ├── CropGuidesPage.jsx         # Crop guidance and market prices
│   │   ├── DiseaseDetectionPage.jsx   # AI disease detection
│   │   ├── MarketplacePage.jsx        # Browse and shop products
│   │   ├── FarmerProductsPage.jsx     # Farmer product management
│   │   ├── OrdersPage.jsx             # Order tracking
│   │   ├── AdminDashboard.jsx         # Admin statistics
│   │   ├── AdminUsersPage.jsx         # User management
│   │   ├── DiscountsManagementPage.jsx # Discount code management
│   │   └── ValueAdditionPage.jsx      # Value addition guides
│   ├── api.js                          # Backend API client utility
│   ├── App.jsx                         # Main app with routing
│   ├── App.css                         # Global styles
│   ├── index.css                       # Tailwind directives
│   ├── main.jsx                        # React entry point
│   └── index.html                      # HTML template
├── .env.example                        # Environment variables template
├── package.json                        # Dependencies & scripts
├── vite.config.js                      # Vite build configuration
├── tailwind.config.js                  # Tailwind CSS configuration
├── postcss.config.js                   # PostCSS configuration
└── .gitignore                          # Git ignore rules
```

## Technology Stack

- **React** 18+ - UI library
- **React Router v6** - Client-side routing
- **Vite** 4.4.9 - Build tool with HMR
- **Tailwind CSS** 3.3.3 - Utility CSS framework
- **Chart.js** - Data visualization (ready for integration)

## Key Configuration Files

### vite.config.js
- Dev server port: **5173**
- API proxy: `/api` → `http://localhost:5000`
- Hot Module Replacement (HMR) enabled
- Strict port enforcement

### tailwind.config.js
- Custom color palette:
  - Primary: `#2d7d2d` (farmer green)
  - Secondary: `#f97316` (action orange)
- Content paths configured for autopurge
- Extended theme with custom colors

### .env Configuration
```
VITE_API_URL=http://localhost:5000/api
```

## Pages Overview

### Public Pages (No Auth Required)

#### CropGuidesPage
- View all crops and seasonal guidance
- Filter guides by crop
- Display stage-based cultivation tips
- Show market prices for crops

#### MarketplacePage
- Browse all farm products
- Filter by price range and crop
- Add to cart functionality
- Floating cart sidebar
- View seller information

#### ValueAdditionPage
- Browse value addition guides
- Filter by category (processing, packaging, storage, branding, certification)
- View equipment lists and costs
- Check expected returns

### Protected Pages (Authentication Required)

#### LoginPage
- Email and password authentication
- JWT token storage
- User profile storage in localStorage
- Auto-redirect to dashboard on login
- Demo credentials box for testing

#### RegisterPage
- Multi-field registration form
- Role selection (farmer, customer, admin)
- Email validation
- Phone and location information
- Auto-login on registration

#### DashboardPage (All Authenticated Users)
Shows role-based content:

**For Farmers:**
- Product management link
- Market prices link
- Profile information

**For Customers:**
- Marketplace browsing link
- Order history link
- Profile information

**For Admins:**
- User management link
- Discount management link
- Admin dashboard link
- Dashboard statistics

#### DiseaseDetectionPage (Users Only)
- Upload crop image
- Select crop from dropdown
- Mock AI disease detection
- Display detected disease with confidence
- Show treatment recommendations
- Track detection history

#### FarmerProductsPage (Farmers Only)
- Create new products
- Input: crop, product name, description, quantity, base price
- View farmer's products in list
- Edit/delete product buttons (UI placeholders)

#### OrdersPage (All Users)
- Role-aware order display
- Customers see their orders
- Farmers see orders they received
- Track order status with color-coded badges
- View items in orders
- Farmers can mark orders as shipped

### Admin Pages (Admin Role Only)

#### AdminDashboard
- Dashboard statistics overview
- User metrics: total, farmers, customers, active count
- Order metrics: total, pending, delivered, total revenue
- Listings count
- Quick action cards linking to management pages

#### AdminUsersPage
- List all users with pagination
- Filter by role (farmer, customer, admin)
- Filter by status (active, inactive)
- View user details
- User role badges with color coding
- Manage user information

#### DiscountsManagementPage
- Create new discount codes
- Specify discount type (percentage or fixed amount)
- Set minimum order amount
- Configure date validity
- View all active discounts
- Edit and delete discount codes
- Real-time code validation

#### ValueAdditionPage (Public with Admin Features)
- Browse guides by category
- Filter by category tabs
- Display content with:
  - Estimated costs
  - Expected returns
  - Benefits list
  - Equipment requirements
- Admin can create/edit/delete guides (not yet implemented in frontend)

## Routing Structure

```
/                           → HomePage (public)
/login                      → LoginPage (redirect if authenticated)
/register                   → RegisterPage (redirect if authenticated)
/dashboard                  → DashboardPage (protected)
/crop-guides                → CropGuidesPage (public)
/disease-detection          → DiseaseDetectionPage (protected)
/marketplace                → MarketplacePage (public)
/my-products                → FarmerProductsPage (farmer only)
/orders                     → OrdersPage (protected)
/value-addition             → ValueAdditionPage (public)
/admin/dashboard            → AdminDashboard (admin only)
/admin/users                → AdminUsersPage (admin only)
/admin/discounts            → DiscountsManagementPage (admin only)
```

## Authentication Flow

1. User registers via RegisterPage
   - Backend validates and hashes password
   - JWT token generated and returned
2. Token stored in localStorage with key `token`
3. User profile stored in localStorage with key `user`
4. Token automatically injected in API requests
5. On page refresh, user data restored from localStorage
6. Protected routes check user object before rendering
7. Invalid/expired tokens trigger redirect to login

## API Integration

### API Client (api.js)
```javascript
apiCall(endpoint, options)
```
- Automatically injects Bearer token from localStorage
- Handles JSON serialization
- Throws on non-OK responses
- Used by all pages for backend communication

### Bearer Token Format
```
Authorization: Bearer <jwt_token>
```

## Styling Approach

### Tailwind CSS
- Utility-first CSS framework
- Responsive design with `md:` breakpoints
- Custom colors defined in config
- Pre-built component classes:
  - `.btn-primary` / `.btn-secondary` - Buttons
  - `.card` - Content containers
  - `.badge` / `.badge-*` - Status badges
  - `.role-farmer` / `.role-customer` / `.role-admin` - Role badges
  - `.input-field` - Form inputs

### Custom CSS (App.css)
- Layout utilities
- Form styling
- Card styling
- Badge variants
- Responsive grid layouts
- Demo box styling
- Loading states

## State Management

Currently using React's built-in useState hook for page-level state:
- User authentication state (App.jsx)
- Page-specific data (forms, lists, loading)
- Error messagesNo centralized state management (Redux/Context) implemented to keep architecture simple.

## Key Features Implemented

✅ **Authentication**
- JWT-based login/register
- Password hashing (via backend)
- Role-based access control
- Persistent sessions

✅ **Farmer Features**
- Product creation and management
- Marketplace listing creation
- View received orders
- Check market prices
- Disease detection for crops

✅ **Customer Features**
- Browse marketplace listings
- Add to cart and checkout
- Apply discount codes
- Track orders
- View disease detection

✅ **Admin Features**
- Dashboard with key metrics
- User management and deactivation
- Discount code creation and validation
- Value addition content browsing

✅ **Core Features**
- Crop guidance browsing
- Disease detection with mock AI
- Marketplace with filtering
- Order tracking
- Value addition guides

## Running the Frontend

### Development Server
```bash
npm run dev
```
Starts Vite dev server on `http://localhost:5173`

### Build for Production
```bash
npm run build
```
Creates optimized production bundle

### Preview Production Build
```bash
npm run preview
```
Serves production build locally

## Component Patterns

### Protected Route Pattern
```jsx
<Route 
  path="/admin/dashboard" 
  element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
/>
```

### API Fetching Pattern
```jsx
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchData()
}, [])

const fetchData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/endpoint`)
    const data = await response.json()
    setData(data)
  } catch (error) {
    console.error(error)
  } finally {
    setLoading(false)
  }
}
```

### Form Submission Pattern
```jsx
const [formData, setFormData] = useState({})

const handleSubmit = async (e) => {
  e.preventDefault()
  const response = await fetch(`${API_BASE_URL}/endpoint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  })
  if (response.ok) {
    // Success handling
  }
}
```

## Environment Setup

### Prerequisites
- Node.js 16+
- npm

### Installation
```bash
cd frontend
npm install
```

### Configuration
1. Copy `.env.example` to `.env`
2. Set `VITE_API_URL` to backend API URL
3. Run `npm run dev`

## Testing

Currently no automated tests implemented. Manual testing recommended:

1. **Auth Flow**: Register → Login → Check token storage → Logout
2. **Protected Routes**: Try accessing /admin without admin role (should redirect)
3. **API Calls**: Check Network tab in DevTools to verify requests
4. **Local Storage**: Open DevTools → Application → Local Storage to verify token/user storage

## Future Enhancements

- [ ] State management (Redux/Zustand) for complex state
- [ ] Error boundary components
- [ ] Loading skeletons instead of text
- [ ] Image upload preview
- [ ] Form validation library (Zod/Validator)
- [ ] Unit and integration tests (Jest/Vitest)
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Accessibility improvements (a11y)
- [ ] PWA support
- [ ] Dark mode support

## Troubleshooting

### CORS Errors
- Ensure backend is running on port 5000
- Check `VITE_API_URL` environment variable
- Verify CORS is enabled in backend server.js

### Token Not Working
- Check if token is stored in localStorage
- Verify token format in Network tab (Bearer token)
- Ensure token not expired (7 day expiration)

### Page Not Loading
- Check browser console for errors
- Verify API endpoint URL matches backend routes
- Check if user role has permission for page

---

**Last Updated**: Step 6 - Admin Frontend Pages
