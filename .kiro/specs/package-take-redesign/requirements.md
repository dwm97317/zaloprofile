# Package Claim Page Redesign - Requirements

## Overview
Redesign the package claim page (`/package/take`) with a modern UI/UX and one-click claiming functionality that allows users to quickly claim packages by entering tracking numbers and selecting item categories.

## Current Issues
1. Two-step process (list → form) is cumbersome
2. No quick claiming option for users who know their tracking number
3. UI is basic and not aligned with the modern redesign theme
4. No visual feedback during the claiming process
5. Limited search functionality

## Goals
1. **One-Click Claiming**: Allow users to claim packages directly by entering tracking number and selecting categories
2. **Modern UI**: Align with LINE theme and recent redesigns (Package, Order, Pack pages)
3. **Dual Mode**: Support both quick claim and browsing available packages
4. **Better UX**: Clear visual feedback, animations, and error handling
5. **Mobile-First**: Optimized for mobile devices with touch-friendly interactions

## User Stories

### US-1: Quick Claim (Primary Flow)
**As a** user who received a tracking number from sender  
**I want to** quickly claim my package by entering the tracking number  
**So that** I can claim packages without browsing through lists

**Acceptance Criteria:**
- Input field for tracking number prominently displayed
- Category selection integrated in the same view
- One-click submit button
- Real-time validation feedback
- Success animation and confirmation

### US-2: Browse Available Packages
**As a** user who doesn't have a tracking number  
**I want to** browse packages available for claiming  
**So that** I can find and claim my packages

**Acceptance Criteria:**
- List of available packages (is_take=1)
- Search functionality
- Package details visible (tracking number partially masked, entry time)
- Quick claim button for each package

### US-3: Category Selection
**As a** user claiming a package  
**I want to** easily select item categories  
**So that** the system knows what's in my package

**Acceptance Criteria:**
- Visual category selector with icons
- Multi-select support
- Common categories quick-select
- Custom category option

## API Endpoints

### GET `/package/packageForTaker`
**Purpose**: Get list of packages available for claiming  
**Query Params**:
- `keyword` (optional): Search by tracking number
- `page` (optional): Pagination

**Response**:
```json
{
  "code": 1,
  "data": {
    "data": [
      {
        "id": 123,
        "express_num": "ABC****123",
        "entering_warehouse_time": "2026-01-15 10:00:00",
        "storage_id": 1,
        "country_id": 1
      }
    ]
  }
}
```

### POST `/package/getTakePackage`
**Purpose**: Claim a package  
**Body**:
```json
{
  "express_sn": "ABC123456",
  "class_ids": "1,2,3"
}
```

**Response**:
```json
{
  "code": 1,
  "msg": "认领成功"
}
```

## Design Principles
1. **Simplicity First**: Make the most common action (quick claim) the easiest
2. **Visual Hierarchy**: Clear distinction between quick claim and browse modes
3. **Feedback**: Immediate visual feedback for all actions
4. **Consistency**: Match the design language of Package, Order, and Pack pages
5. **Accessibility**: Touch-friendly, readable, and intuitive

## Technical Requirements
1. React + Recoil for state management
2. Tailwind CSS for styling
3. Framer Motion for animations
4. i18n for Thai/Chinese translations
5. Error handling with toast notifications
6. Loading states for all async operations

## Success Metrics
1. Reduced time to claim a package (target: <30 seconds)
2. Reduced user errors during claiming
3. Increased user satisfaction
4. Consistent design with other redesigned pages
