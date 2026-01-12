# Project Overview
- **Name**: Vhuong Tra Parcel Integration (วหวงตรา บริการรวมพัสดุ)
- **Description**: A LINE Mini App (LIFF) for international logistics and parcel consolidation, serving routes between China and Thailand. Migrated from Zalo Mini App to LINE platform for the Thailand market.
- **Target Market**: Thailand
- **Primary Language**: Thai (ภาษาไทย)
- **Core Business Loop**:
    1. **Pre-reporting**: Users enter domestic (China) tracking numbers and item details.
    2. **Storage**: Warehouses receive and scan items, updating status to "In Stock".
    3. **Consolidation**: Users select multiple "In Stock" items to "Pack" into a single international shipment.
    4. **Processing**: Warehouse weighs the consolidated package and selects the optimal shipping line.
    5. **Payment**: Users pay freight charges via the app (integrated with LINE Pay/internal balance).
    6. **Delivery**: Items are shipped with real-time status updates until "Completed".

# Tech Stack
- **Frontend Framework**: React 18.2.0 (Hooks-based, Functional Components only)
- **Build Tool**: Vite 5.4.19
- **UI Styling**: Tailwind CSS 3.4.1 + Custom SCSS for animations
- **State Management**: Recoil 0.7.7
- **Native Integration**: `@liff/sdk` 2.23.2 (LINE Front-end Framework)
- **Internationalization**: `react-i18next` 14.0.0 + `i18next` 23.7.16
- **Routing**: `react-router-dom` 6.21.2
- **Core Dependencies**:
    - `axios` 1.6.5: API communication with interceptors
    - `recoil` 0.7.7: Global state management
    - `google-maps-react` 2.0.6: Map integration for Thailand addresses
    - `qrcode` 1.5.4: QR code generation for tracking
    - `copy-to-clipboard` 3.3.3: Clipboard utilities

# Environment & API
- **Base URL**: `https://zalonew.itaoth.com/index.php?s=api/` (Defined in `src/config/config.js`)
- **Core Parameters**: 
    - All requests require `wxapp_id=10001`
    - `token` (if logged in, obtained via LINE LIFF authentication)
- **Platform Header**: `platform: "LINE"` must be sent in every request header via the interceptor
- **Authentication**: LINE LIFF ID Token → Backend JWT exchange via `api/Passport/loginMpLine`

# Project Architecture & Structure
- `/src/pages/`:
    - `Home/`: Dashboard with navigation shortcuts and route highlights
    - `Packages/`: Parcel reporting (`Report.jsx`), consolidation (`Pack.jsx`), and take (`Take.jsx`)
    - `Order/`: Status-based tracking (Pending Check, Pending Pay, Shipped, Completed)
    - `Address/`: Thailand address management (Province/District/Sub-district structure)
    - `Freight/`: Shipping cost calculator based on weight/volume
    - `Storage/`: Warehouse location list and details
    - `Mine/`: User profile, balance, recharge, and settings
    - `Query/`: Package tracking by tracking number
    - `Common/`: Shared pages (Category, Country, LineDetail, Comment, Coupon, Sms)
    - `article/help/`: Help articles and user guides
- `/src/components/`:
    - `Header/`: Custom header component (replaces zmp-ui)
    - `Button/`: Custom button component with Tailwind styling
    - `Modal/`: Custom modal component
    - `Loading/`: Loading spinner component
    - `Tab/`: Bottom navigation tab bar
    - `AddressAutocomplete/`: Google Maps address autocomplete for Thailand
    - `GoogleStaticMap/`: Static map display component
- `/src/utils/`:
    - `liff.js`: LINE LIFF SDK initialization and authentication
    - `request.js`: Centralized Axios instance with LINE Token handling
    - `addressParser.js`: Multi-strategy parser for Thailand addresses
    - `util.js`: Utility functions (page view tracking, storage, etc.)
- `/src/locales/`: i18n translation files
    - `th/translation.json`: Thai (primary)
    - `zh/translation.json`: Chinese (secondary)
    - `vi/translation.json`: Vietnamese (legacy)
- `/src/state.js`: Recoil atom definitions for `user`, `orderStatus`, `addressInfo`, etc.

# Conventions & Standards

## 1. Development Lifecycle
- **Strict Linting**: Follow modern React patterns (Functional components only, Hooks-based)
- **No Class Components**: All components must be functional with hooks
- **Compatibility**: Ensure compatibility with LINE LIFF browser environment

## 2. API Communication
- Use `request.get()` and `request.post()` from `src/utils/request.js`
- All requests automatically include:
    - `platform: "LINE"` header
    - `token` from localStorage (if authenticated)
    - `wxapp_id=10001` parameter
- Error handling: Display meaningful messages using custom toast/alert based on `res.msg`

## 3. Thailand Localization & Address
- **Mandatory**: Use Thai as the default language
- **Address Structure**: Thailand uses Province (จังหวัด) → District (อำเภอ) → Sub-district (ตำบล) → Postal Code
- **Additional Fields**: 
    - `identitycard`: Thai National ID (13 digits)
    - `clearancecode`: Customs clearance code
- **Maps**: Use Google Maps API for geocoding and address autocomplete
- **Backend Integration**: `api/LineApp/parseAddress` for reverse geocoding

## 4. UI/UX Standards
- **Design System**: Tailwind CSS utility-first approach
- **Color Palette**: 
    - Primary Blue: `#2563EB` (blue-600)
    - Background: `#F9FAFB` (gray-50)
    - Success: `#10B981` (green-500)
    - Error: `#EF4444` (red-500)
- **Loading State**: Always wrap async operations with the `<Loading />` component
- **Navigation**: Use `useNavigate` from `react-router-dom` for SPA navigation
- **Responsive**: Mobile-first design, optimized for LINE in-app browser
- **Safe Areas**: Use `pb-safe` class for bottom padding to avoid notch/home indicator

## 5. Internationalization (i18n)
- **Default Language**: Thai (`th`)
- **Fallback**: Chinese (`zh`)
- **Usage**: Always use `t()` function from `useTranslation()` hook
- **Format**: `t("namespace.key", "Fallback text")`
- **Example**: `t("home.title", "Home")`

## 6. State Management
- **Global State**: Use Recoil atoms defined in `src/state.js`
- **Local State**: Use `useState` for component-specific state
- **Async State**: Use `useEffect` with proper cleanup
- **Common Atoms**:
    - `userState`: User authentication and profile
    - `packageInfoState`: Current package being edited
    - `categoryState`: Selected categories
    - `countryState`: Selected country
    - `addressState`: Selected address

## 7. LINE LIFF Integration
- **Initialization**: LIFF must be initialized before any API calls
- **Authentication Flow**:
    1. Call `api/LineApp/base` to get `liff_id` and `google_maps_key`
    2. Initialize LIFF with `liff.init({ liffId })`
    3. Get `id_token` with `liff.getIDToken()`
    4. Exchange for backend JWT via `api/Passport/loginMpLine`
- **Profile**: Use `liff.getProfile()` for user info (name, avatar)
- **Close App**: Use `liff.closeWindow()` to close the LIFF app

# Deployment & Scripts
- `npm run start`: Local dev with Vite (hot reload enabled)
- `npm run build`: Production build (outputs to `/dist`)
- `npm run deploy`: Deploy to LINE platform via `zmp-cli` (legacy, may need update)
- `npm run deploy:testing`: Deploy to testing environment
- `npm run build:css`: Refresh Tailwind utilities (run after modifying Tailwind config)

# Migration Notes
This project was migrated from Zalo Mini App to LINE Mini App in January 2025:
- **Removed**: `zmp-sdk`, `zmp-ui`, `vite-plugin-zalo-mini-app`
- **Added**: `@liff/sdk`, `react-i18next`, `google-maps-react`
- **Changed**: Platform from Vietnam (Zalo) to Thailand (LINE)
- **Updated**: All UI components from zmp-ui to custom Tailwind CSS components
- **Localized**: Complete Thai translation for all pages and components

# Backend API Endpoints (Key Routes)
- `api/LineApp/base`: Get LIFF configuration and API keys
- `api/Passport/loginMpLine`: LINE authentication (ID Token → JWT)
- `api/LineApp/parseAddress`: Reverse geocoding for Thailand addresses
- `api/Address/add`: Add/update user address
- `api/Address/lists`: Get user address list
- `api/Package/*`: Package management (report, pack, take, etc.)
- `api/Order/*`: Order management and tracking
- `api/user.coupon/lists`: Get user coupons
- `api/page/*`: Get page content (help, routes, etc.)

