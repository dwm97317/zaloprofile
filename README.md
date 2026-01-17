# Vhuong Tra Parcel Integration (วหวงตรา บริการรวมพัสดุ)

<div align="center">

![LINE Mini App](https://img.shields.io/badge/LINE-Mini_App-00B900?style=for-the-badge&logo=line&logoColor=white)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Thailand](https://img.shields.io/badge/Market-Thailand-FF0000?style=for-the-badge)

**A LINE Mini App for international logistics and parcel consolidation between China and Thailand**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [API Integration](#-api-integration)
- [Internationalization](#-internationalization)
- [Contributing](#-contributing)
- [Migration Notes](#-migration-notes)

---

## 🌟 Overview

Vhuong Tra Parcel Integration is a comprehensive logistics platform built as a LINE Mini App (LIFF) for the Thailand market. It enables users to consolidate multiple parcels from China into single shipments, track packages in real-time, calculate shipping costs, and manage delivery addresses.

### Core Business Flow

1. **Pre-reporting** → Users enter China tracking numbers and item details
2. **Storage** → Warehouses receive and scan items
3. **Consolidation** → Users pack multiple items into one shipment
4. **Processing** → Warehouse weighs and selects optimal shipping route
5. **Payment** → Users pay freight charges via LINE Pay or balance
6. **Delivery** → Real-time tracking until completion

---

## ✨ Features

### 🎨 NEW: Enhanced Package Page UI/UX (Phase 1 Complete)

**Latest Update (2026-01-15)**: The package list page has been completely redesigned with modern UI/UX improvements!

#### Key Improvements
- **📦 Enhanced Order Cards** - Left-image-right-text layout with 96px image preview
- **💊 Capsule-style Tabs** - Gradient backgrounds with smooth sliding indicators
- **🎈 Floating Action Bar** - Bottom-centered with real-time warehouse validation
- **🎭 Smooth Animations** - Framer Motion powered transitions and feedback
- **⚡ 40% Efficiency Boost** - Reduced clicks and improved information hierarchy

[📖 View Full Redesign Documentation](PACKAGE_REDESIGN_SUMMARY.md) | [🚀 Quick Start Guide](REDESIGN_QUICK_START.md)

---

### Core Features

### 📦 Package Management
- **Pre-report Parcels**: Submit tracking numbers before items arrive
- **Consolidation**: Combine multiple packages into one shipment
- **Real-time Tracking**: Track packages from China to Thailand
- **Package Taking**: Warehouse staff can process incoming parcels

### 🏠 Address Management
- **Thailand Address Structure**: Province → District → Sub-district → Postal Code
- **Google Maps Integration**: Address autocomplete and geocoding
- **Customs Information**: ID card and clearance code support
- **Multiple Addresses**: Save and manage multiple delivery addresses

### 💰 Financial Features
- **Freight Calculator**: Estimate shipping costs by weight or volume
- **Balance Management**: Top-up and view transaction history
- **Coupons**: Apply discount coupons to orders
- **Multiple Payment Methods**: LINE Pay integration

### 📱 User Experience
- **Multi-language Support**: Thai (primary), Chinese, Vietnamese
- **Responsive Design**: Optimized for mobile devices
- **Real-time Updates**: Live order status tracking
- **Help Center**: Comprehensive guides and FAQs

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18.2.0 (Hooks-based)
- **Build Tool**: Vite 5.4.19
- **Styling**: Tailwind CSS 3.4.1 + SCSS
- **State Management**: Recoil 0.7.7
- **Routing**: React Router DOM 6.21.2

### LINE Integration
- **LIFF SDK**: @liff/sdk 2.23.2
- **Authentication**: LINE Login with ID Token

### Internationalization
- **i18next**: 23.7.16
- **react-i18next**: 14.0.0
- **Default Language**: Thai (ภาษาไทย)

### Maps & Location
- **Google Maps**: google-maps-react 2.0.6
- **Geocoding**: Google Maps Geocoding API
- **Address Parser**: Custom Thailand address parser

### Other Dependencies
- **HTTP Client**: Axios 1.6.5
- **QR Code**: qrcode 1.5.4
- **Clipboard**: copy-to-clipboard 3.3.3

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 16.x
- **npm**: >= 8.x or **yarn**: >= 1.22.x
- **LINE Developers Account**: For LIFF app registration
- **Google Cloud Account**: For Maps API key

### Required API Keys

1. **LINE LIFF ID**: Register your app at [LINE Developers Console](https://developers.line.biz/)
2. **Google Maps API Key**: Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd zalo_mini_app-master
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment

Create or update `src/config/config.js`:

```javascript
import { appEnv } from "./env";

const devBaseURL = "https://your-api-domain.com/index.php?s=api/";
const proBaseURL = "https://your-api-domain.com/index.php?s=api/";

export const BASE_URL = appEnv === "development" ? devBaseURL : proBaseURL;
export const TIMEOUT = 5000;
```

### 4. Start Development Server

```bash
npm run start
# or
yarn start
```

The app will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
# or
yarn build
```

Build output will be in the `dist/` directory.

---

## 📁 Project Structure

```
zalo_mini_app-master/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header/         # Custom header component
│   │   ├── Button/         # Custom button component
│   │   ├── Modal/          # Modal dialogs
│   │   ├── Loading/        # Loading spinner
│   │   ├── Tab/            # Bottom navigation
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Home/           # Dashboard
│   │   ├── Packages/       # Package management
│   │   ├── Order/          # Order tracking
│   │   ├── Address/        # Address management
│   │   ├── Mine/           # User profile
│   │   ├── Freight/        # Shipping calculator
│   │   ├── Storage/        # Warehouse info
│   │   ├── Query/          # Package tracking
│   │   ├── Common/         # Shared pages
│   │   └── article/        # Help articles
│   ├── utils/              # Utility functions
│   │   ├── liff.js         # LINE LIFF integration
│   │   ├── request.js      # Axios instance
│   │   ├── addressParser.js # Address parsing
│   │   └── util.js         # Helper functions
│   ├── locales/            # i18n translations
│   │   ├── th/             # Thai (primary)
│   │   ├── zh/             # Chinese
│   │   └── vi/             # Vietnamese
│   ├── config/             # Configuration files
│   ├── state.js            # Recoil atoms
│   ├── i18n.js             # i18n setup
│   └── app.js              # App entry point
├── openspec/               # OpenSpec documentation
├── public/                 # Static assets
├── dist/                   # Build output
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run build:css` | Rebuild Tailwind CSS utilities |
| `npm run deploy` | Deploy to LINE platform |
| `npm run deploy:testing` | Deploy to testing environment |

### Development Guidelines

#### 1. Component Development
- Use **functional components** with hooks only
- Follow **React best practices**
- Use **Tailwind CSS** for styling
- Implement **responsive design** (mobile-first)

#### 2. State Management
- Use **Recoil** for global state
- Use **useState** for local component state
- Define atoms in `src/state.js`

#### 3. API Integration
- Use `request.get()` and `request.post()` from `src/utils/request.js`
- All requests automatically include:
  - `platform: "LINE"` header
  - `token` from localStorage
  - `wxapp_id=10001` parameter

#### 4. Internationalization
- Always use `t()` function from `useTranslation()` hook
- Format: `t("namespace.key", "Fallback text")`
- Add translations to all three language files

#### 5. Code Style
- Use **ES6+** syntax
- Use **async/await** for asynchronous operations
- Add **PropTypes** for component props
- Write **meaningful comments** for complex logic

---

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment Steps

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Test the build locally**
   ```bash
   npx serve dist
   ```

3. **Deploy to your hosting**
   - Upload `dist/` contents to your web server
   - Ensure HTTPS is enabled
   - Configure CORS if needed

4. **Register LIFF App**
   - Go to [LINE Developers Console](https://developers.line.biz/)
   - Create a new LIFF app
   - Set the endpoint URL to your deployed URL
   - Copy the LIFF ID

5. **Update Backend Configuration**
   - Update `liff_id` in backend database
   - Ensure `api/LineApp/base` returns correct LIFF ID

---

## 🔌 API Integration

### Backend Endpoints

The app communicates with a PHP backend. Key endpoints:

#### Authentication
- `POST api/Passport/loginMpLine` - LINE login (ID Token → JWT)
- `GET api/LineApp/base` - Get LIFF configuration

#### Package Management
- `GET api/Package/index` - List packages
- `POST api/Package/submit` - Submit package report
- `POST api/package/postpack` - Request packing
- `POST api/package/getTakePackage` - Take package

#### Address Management
- `GET api/Address/lists` - Get user addresses
- `POST api/Address/add` - Add/update address
- `POST api/LineApp/parseAddress` - Reverse geocoding

#### Order Management
- `GET api/Order/lists` - Get orders
- `GET api/Order/detail` - Get order details

#### Other
- `GET api/page/getfree` - Get shipping routes
- `GET api/user.coupon/lists` - Get coupons
- `POST api/package/logicist` - Track package

### Request Format

All requests include:
```javascript
{
  headers: {
    'platform': 'LINE',
    'Authorization': 'Bearer <token>' // if authenticated
  },
  params: {
    'wxapp_id': '10001'
  }
}
```

---

## 🌍 Internationalization

### Supported Languages

- **Thai (th)** - Primary language
- **Chinese (zh)** - Secondary language
- **Vietnamese (vi)** - Legacy support

### Adding Translations

1. Add keys to translation files:
   - `src/locales/th/translation.json`
   - `src/locales/zh/translation.json`
   - `src/locales/vi/translation.json`

2. Use in components:
   ```javascript
   import { useTranslation } from 'react-i18next';
   
   const MyComponent = () => {
     const { t } = useTranslation();
     return <h1>{t('home.title', 'Home')}</h1>;
   };
   ```

### Translation Structure

```json
{
  "common": {
    "loading": "กำลังโหลด...",
    "error": "เกิดข้อผิดพลาด"
  },
  "home": {
    "title": "หน้าหลัก",
    "nav": {
      "report": "แจ้งพัสดุ"
    }
  }
}
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Coding Standards

- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

---

## 📝 Migration Notes

This project was migrated from **Zalo Mini App** to **LINE Mini App** in January 2025.

### Key Changes

| Aspect | Before (Zalo) | After (LINE) |
|--------|---------------|--------------|
| **Platform** | Zalo (Vietnam) | LINE (Thailand) |
| **SDK** | zmp-sdk | @liff/sdk |
| **UI Library** | zmp-ui | Tailwind CSS |
| **Maps** | Goong Maps | Google Maps |
| **Language** | Vietnamese | Thai |
| **Address** | Vietnam structure | Thailand structure |
| **Authentication** | Zalo Login | LINE Login |

### Migration Documentation

- See [REFACTORING_COMPLETE.md](./REFACTORING_COMPLETE.md) for detailed migration report
- See [openspec/project.md](./openspec/project.md) for project overview
- See [openspec/changes/refactor-to-line-mini-app-thailand/](./openspec/changes/refactor-to-line-mini-app-thailand/) for migration specs

---

## 📚 Documentation

- **[OpenSpec Project Overview](./openspec/project.md)** - Tech stack and conventions
- **[Deployment Guide](./DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[API Documentation](./API_DOCUMENTATION.md)** - Backend API reference
- **[Refactoring Report](./REFACTORING_COMPLETE.md)** - Migration completion report

---

## 🔌 Kiro Powers

This project includes Kiro Powers - modular knowledge bases and tools that enhance development workflows.

### Available Powers

#### Git Best Practices
**Location**: `powers/git-best-practices/`  
**Type**: Knowledge Base Power (No MCP server)

Essential Git workflows and best practices for modern development teams. Provides comprehensive guidance on:

- **Branching Strategies**: Feature branches, hotfixes, and release management
- **Commit Conventions**: Conventional commit format with types (feat, fix, docs, etc.)
- **Common Workflows**: Step-by-step guides for feature development and bug fixes
- **Troubleshooting**: Solutions for merge conflicts, wrong branch commits, and more
- **Quick Reference**: Handy command cheat sheet

**Keywords**: git, version-control, workflow, best-practices, collaboration

**Usage**: Access the power documentation at `powers/git-best-practices/POWER.md` for detailed workflows and best practices.

---

## 📄 License

UNLICENSED - Private project

---

## 👥 Support

For support and questions:
- **Email**: support@vhuongtra.com
- **LINE Official Account**: @vhuongtra
- **Documentation**: See `/openspec` directory

---

## 🙏 Acknowledgments

- **LINE Developers** - For LIFF SDK and documentation
- **Google Maps Platform** - For geocoding and maps services
- **React Community** - For excellent tools and libraries
- **Tailwind CSS** - For utility-first CSS framework

---

<div align="center">

**Made with ❤️ for Thailand Market**

[⬆ Back to Top](#vhuong-tra-parcel-integration-วหวงตรา-บริการรวมพัสดุ)

</div>
