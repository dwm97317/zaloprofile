# Requirements Document

## Introduction

This document outlines the requirements for completing the migration of remaining pages from Zalo Mini App (zmp-ui) to LINE Mini App (React + Tailwind CSS) for the Thailand market. The core pages have been migrated, but several utility pages still depend on zmp-ui components and Zalo-specific functionality.

## Glossary

- **System**: The LINE Mini App logistics platform
- **zmp-ui**: Zalo Mini Program UI component library (to be removed)
- **LIFF**: LINE Front-end Framework for Mini Apps
- **Category_Selector**: Component for selecting package categories
- **Country_Selector**: Component for selecting shipping countries
- **QR_Login**: Authentication component using QR code scanning

## Requirements

### Requirement 1: Refactor Category Selection Page

**User Story:** As a user, I want to select package categories using a modern interface, so that I can classify my packages correctly.

#### Acceptance Criteria

1. THE System SHALL display all available package categories grouped by parent category
2. WHEN a user taps a category option, THE System SHALL toggle its selection state
3. WHEN a user confirms their selection, THE System SHALL save the selected categories to application state
4. THE System SHALL provide a reset button to clear all selections
5. THE System SHALL use Tailwind CSS styling instead of zmp-ui components

### Requirement 2: Refactor Country Selection Page

**User Story:** As a user, I want to select shipping countries from a searchable list, so that I can specify package origins.

#### Acceptance Criteria

1. THE System SHALL display countries grouped alphabetically
2. WHEN a user types in the search field, THE System SHALL filter countries by name
3. WHEN a user selects a country, THE System SHALL save it to application state and navigate back
4. THE System SHALL use native HTML input elements styled with Tailwind CSS
5. THE System SHALL maintain the existing API integration with `/package/country`

### Requirement 3: Remove or Adapt QR Login Page

**User Story:** As a developer, I want to remove Zalo-specific authentication, so that the app only uses LINE authentication.

#### Acceptance Criteria

1. IF the QR login feature is not needed for LINE, THEN THE System SHALL remove the QRLogin page and routes
2. IF QR login is needed, THEN THE System SHALL adapt it to use LINE's authentication methods
3. THE System SHALL remove all references to Zalo SDK authentication methods
4. THE System SHALL ensure all authentication flows use LIFF SDK exclusively

### Requirement 4: Internationalization Completeness

**User Story:** As a Thai user, I want all interface text in Thai, so that I can understand the application.

#### Acceptance Criteria

1. THE System SHALL provide Thai translations for all Category page labels
2. THE System SHALL provide Thai translations for all Country page labels
3. THE System SHALL maintain existing Chinese and Vietnamese translations
4. THE System SHALL use the i18next translation system consistently

### Requirement 5: Remove zmp-ui Dependencies

**User Story:** As a developer, I want to completely remove zmp-ui, so that the application has no Zalo dependencies.

#### Acceptance Criteria

1. THE System SHALL not import any zmp-ui components in the refactored pages
2. THE System SHALL use the custom Header component instead of zmp-ui Header
3. THE System SHALL use custom Button component instead of zmp-ui Button
4. THE System SHALL use native HTML elements styled with Tailwind CSS
5. WHEN all pages are refactored, THE System SHALL allow removal of zmp-ui from package.json

### Requirement 6: Maintain Existing Functionality

**User Story:** As a user, I want the refactored pages to work exactly as before, so that my workflow is not disrupted.

#### Acceptance Criteria

1. THE System SHALL maintain all existing API endpoints and request formats
2. THE System SHALL preserve Recoil state management for category and country selection
3. THE System SHALL maintain navigation behavior (back navigation after selection)
4. THE System SHALL preserve all business logic and data transformations
5. THE System SHALL maintain responsive design for mobile devices
