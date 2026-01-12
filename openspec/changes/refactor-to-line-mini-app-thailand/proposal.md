# Change: Refactor to LINE Mini App for Thailand Market

## Why
The project aims to expand into the Thailand market. LINE is the dominant messaging platform in Thailand, and providing a native-like experience via a LINE Mini App (LIFF) is critical for user adoption. The business route is also shifting from China-Vietnam to China-Thailand.

## What Changes
- **Platform Refactor**: Replace Zalo Mini App SDK (`zmp-sdk`) with LINE LIFF SDK (`@liff/sdk`).
- **UI Framework Transition**: Migrate from `zmp-ui` to a more generic React component set (using Tailwind CSS) as LINE Mini Apps are standard web apps without a proprietary UI component requirement.
- **Geocoding Update**: Replace Goong Maps (Vietnam-centric) with Google Maps API (Thailand-centric) via `api/LineApp/parseAddress`.
- **Localization**: Change the default language from Vietnamese to Thai.
- **Business Logic**: Update routing and calculation logic to reflect China-Thailand logistics, utilizing new address fields (`sub_district`, `clearancecode`).
- **Entry Point**: Update `app.js` and HTML structure to initialize LIFF instead of ZMP.
- **Business Logic Continuity**: Ensure the complete end-to-end business loop (Pre-reporting -> In Stock -> Consolidation -> Weighing -> Payment -> Delivery) is fully functional within the LINE browser environment, maintaining feature parity with the legacy Zalo version.

## Impact
- **Affected Specs**: 
    - `line-mini-app`: New capability for LINE integration.
    - `thailand-logistics`: New capability for Thailand-specific logistics rules.
- **Affected Code**: 
    - `src/app.js`: Major rewrite of initialization.
    - `src/utils/request.js`: Update token handling and headers.
    - `src/utils/addressParser.js`: Adjust for Thai address structures.
    - All pages in `src/pages/`: Replace `zmp-ui` components with Tailwind-based equivalents.
    - `package.json`: Major dependency changes.
