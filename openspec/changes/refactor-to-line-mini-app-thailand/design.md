# Design: Refactor Zalo Mini App to LINE Mini App (Thailand)

## Context
The current application belongs to the Zalo ecosystem. Shifting to LINE requires replacing the proprietary ZMP environment with a standard web environment enabled by LINE Front-end Framework (LIFF).

## Goals
- Complete transition to LINE LIFF SDK.
- Support Thailand's administrative address system (Province -> District -> Sub-district).
- Standardize UI to be platform-agnostic (Tailwind + Reach UI/Headless UI).
- Default language: Thai.

## Non-Goals
- Maintaining Zalo Mini App compatibility.
- Legacy browser support (LINE Mini App targets modern WebKit environments).

## Decisions

### 1. LINE LIFF Integration
- **Decision**: Use `@liff/sdk` and initialize at the very beginning of the app lifecycle.
- **Why**: LIFF provides user identity (UID), profile, and native integration features.
- **Endpoints**:
    - Configuration: `api/LineApp/base` (fetches `liff_id`, `google_maps_key`, and pay status).
    - Authentication: `api/Passport/loginMpLine` (submits `id_token` to get JWT).

### 2. UI Component Migration
- **Decision**: Replace `zmp-ui` with custom Tailwind components or a headless library (like Radix UI).
- **Why**: `zmp-ui` is coupled to the Zalo environment. Tailwind ensures a platform-agnostic, premium look.

### 3. Geocoding & Address Structure
- **Decision**: Switch to Google Maps Platform for the Thailand market.
- **Why**: Google Maps provides the most accurate data for Thai provinces/districts/sub-districts.
- **Address Structure (Thailand)**:
    - `Province` (Changwat)
    - `District` (Amphoe)
    - `Sub-district` (Tambon)
    - `Postal Code`
    - `Latitude/Longitude` (Mandatory for logistics accuracy)
- **Endpoints**:
    - Parsing: `api/LineApp/parseAddress` (Maps lat/lng to Thai structure).
    - CRUD: `api/Address/add` (supports `sub_district`, `clearancecode`, and `identitycard`).

### 4. Internationalization (i18n)
- **Decision**: Implement `react-i18next` for managing Thai, Chinese, and English.
- **Why**: Simplifies multi-language support required for the Thailand-China shipping route.

### 5. Business Process Parity
- **Decision**: Maintain exact parity for the 6-step core business loop defined in `project.md`. Any UI refactored from `zmp-ui` must retain original validation logic and data flow.
- **Why**: Ensuring the switch to LINE is a platform migration, not a functional reduction.

## Risks / Trade-offs
- **Risk**: LIFF initialization might be slower than ZMP native startup.
- **Mitigation**: Implement a lightweight loading splash screen in the root HTML.
- **Risk**: Differences in permission models (Zalo permissions vs LINE scopes).
- **Mitigation**: Standardize a permission-checking utility.

## Migration Plan
1. Update `package.json` and remove ZMP dependencies.
2. Initialize LIFF in `src/app.js`.
3. Create a wrapper component for LIFF identity.
4. Refactor `src/utils/request.js` to use LIFF tokens.
5. Create a set of base Tailwind UI components (Button, Input, Picker).
6. Update pages module-by-module, starting with `Home` and `Profile`.
7. Implement Thai address parsing logic.
