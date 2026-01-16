# Requirements Document - Mine Page Redesign

## Introduction

Redesign the Mine (个人中心/My Account) page to provide a clean, professional, logistics-focused user experience with clear section organization and improved visual hierarchy.

## Glossary

- **Mine_Page**: The user profile/account page accessible at `/mine`
- **Profile_Header**: Top section displaying user avatar, name, grade, and logout button
- **Quick_Stats**: Card showing balance, SMS, coupon, and points
- **Primary_Actions**: Most frequently used features (Recharge, Receive Package, Address)
- **Order_Status**: Section showing 5 order states with quick navigation
- **Service_List**: Additional services like warehouse and FAQ
- **Grade_Badge**: Visual indicator of user's membership level
- **User_Marks**: Warehouse shipping marks/labels assigned to user

## Requirements

### Requirement 1: Profile Header Display

**User Story:** As a user, I want to see my profile information clearly at the top of the page, so that I can quickly identify my account and membership status.

#### Acceptance Criteria

1. WHEN the page loads, THE Mine_Page SHALL display the Profile_Header with user avatar, name, and user ID
2. WHEN the user has a grade, THE Profile_Header SHALL display the Grade_Badge next to the user name
3. WHEN the user is logged in, THE Profile_Header SHALL display a logout button in the top-right corner
4. WHEN the user is not logged in, THE Profile_Header SHALL display a login prompt and login button
5. THE Profile_Header SHALL use a blue gradient background consistent with logistics theme

### Requirement 2: Quick Stats Display

**User Story:** As a user, I want to see my account balances and assets at a glance, so that I can quickly check my available resources.

#### Acceptance Criteria

1. WHEN the user is logged in, THE Mine_Page SHALL display the Quick_Stats card with balance, SMS, coupon, and points
2. WHEN the user is not logged in, THE Mine_Page SHALL NOT display the Quick_Stats card
3. WHEN a stat item is clicked, THE Mine_Page SHALL navigate to the corresponding detail page
4. THE Quick_Stats SHALL display as a floating card with negative margin overlapping the Profile_Header
5. THE Quick_Stats SHALL use a 4-column grid layout on all screen sizes

### Requirement 3: Primary Actions Section

**User Story:** As a user, I want quick access to the most important features, so that I can perform common tasks efficiently.

#### Acceptance Criteria

1. THE Mine_Page SHALL display a Primary_Actions section with Recharge, Receive Package, and Address Book options
2. WHEN a primary action is clicked, THE Mine_Page SHALL navigate to the corresponding feature page
3. THE Primary_Actions SHALL use SVG icons from Heroicons library (no emojis)
4. THE Primary_Actions SHALL display Thai language labels
5. THE Primary_Actions SHALL provide visual feedback on hover and active states

### Requirement 4: Order Status Navigation

**User Story:** As a user, I want to quickly access my orders by status, so that I can track and manage my shipments.

#### Acceptance Criteria

1. THE Mine_Page SHALL display an Order_Status section with 5 status categories
2. THE Order_Status SHALL include: No Check, No Pay, No Send, No Receive, and Complete
3. WHEN a status is clicked, THE Mine_Page SHALL navigate to the order list filtered by that status
4. WHEN "View All" is clicked, THE Mine_Page SHALL navigate to the complete order list
5. THE Order_Status SHALL use a 5-column grid layout with icon and label for each status

### Requirement 5: Additional Services List

**User Story:** As a user, I want access to secondary features and help resources, so that I can manage my account and get support.

#### Acceptance Criteria

1. THE Mine_Page SHALL display a Service_List section with Warehouse and FAQ options
2. WHEN a service item is clicked, THE Mine_Page SHALL navigate to the corresponding page
3. THE Service_List SHALL use SVG icons from Heroicons library (no emojis)
4. THE Service_List SHALL display items in a vertical list with dividers
5. THE Service_List SHALL provide hover feedback for each item

### Requirement 6: Warehouse Marks Display

**User Story:** As a user with warehouse marks, I want to access my shipping labels, so that I can manage my warehouse identifiers.

#### Acceptance Criteria

1. WHEN the user has warehouse marks, THE Mine_Page SHALL display a User_Marks entry card
2. WHEN the user has no warehouse marks, THE Mine_Page SHALL NOT display the User_Marks entry
3. WHEN the User_Marks card is clicked, THE Mine_Page SHALL navigate to the marks page
4. THE User_Marks card SHALL display the count of marks
5. THE User_Marks card SHALL use an SVG icon (no emojis)

### Requirement 7: Visual Design Consistency

**User Story:** As a user, I want a professional and consistent visual design, so that the app feels trustworthy and easy to use.

#### Acceptance Criteria

1. THE Mine_Page SHALL use the defined color palette (Blue 600 primary, Sky 500 secondary)
2. THE Mine_Page SHALL use consistent spacing (mt-6 between sections, p-4 to p-6 for cards)
3. THE Mine_Page SHALL use rounded-2xl for all card corners
4. THE Mine_Page SHALL use Heroicons SVG icons with consistent sizing (w-6 h-6)
5. THE Mine_Page SHALL NOT use emoji characters as UI icons

### Requirement 8: Responsive Layout

**User Story:** As a user on any device, I want the page to display properly, so that I can access features regardless of screen size.

#### Acceptance Criteria

1. THE Mine_Page SHALL display correctly on mobile devices (320px minimum width)
2. THE Mine_Page SHALL maintain single-column layout on all screen sizes
3. THE Mine_Page SHALL use full-width cards with consistent margins (mx-4)
4. THE Mine_Page SHALL ensure touch targets are minimum 44px for mobile usability
5. THE Mine_Page SHALL use readable font sizes (minimum 14px for body text)

### Requirement 9: Interaction Feedback

**User Story:** As a user, I want clear feedback when I interact with elements, so that I know my actions are registered.

#### Acceptance Criteria

1. WHEN hovering over clickable elements, THE Mine_Page SHALL provide visual feedback (color change, shadow, or background)
2. WHEN clicking/tapping elements, THE Mine_Page SHALL provide active state feedback (scale transform)
3. THE Mine_Page SHALL use smooth transitions for all state changes (150-300ms duration)
4. THE Mine_Page SHALL display cursor-pointer for all clickable elements
5. THE Mine_Page SHALL display focus states for keyboard navigation

### Requirement 10: Accessibility Compliance

**User Story:** As a user with accessibility needs, I want the page to be accessible, so that I can use all features regardless of ability.

#### Acceptance Criteria

1. THE Mine_Page SHALL provide alt text for all images
2. THE Mine_Page SHALL maintain color contrast ratio of at least 4.5:1 for text
3. THE Mine_Page SHALL support keyboard navigation for all interactive elements
4. THE Mine_Page SHALL provide visible focus indicators
5. THE Mine_Page SHALL use semantic HTML elements for proper screen reader support

### Requirement 11: Component Architecture

**User Story:** As a developer, I want modular components, so that the code is maintainable and reusable.

#### Acceptance Criteria

1. THE Mine_Page SHALL extract Profile_Header into a separate component file
2. THE Mine_Page SHALL extract Quick_Stats into a separate component file
3. THE Mine_Page SHALL extract Primary_Actions into a separate component file
4. THE Mine_Page SHALL extract Order_Status into a separate component file
5. THE Mine_Page SHALL extract Service_List into a separate component file

### Requirement 12: State Management Integration

**User Story:** As a developer, I want proper state management, so that user data flows correctly through the application.

#### Acceptance Criteria

1. THE Mine_Page SHALL use Recoil for global state management
2. THE Mine_Page SHALL update userGradeState when grade data is fetched
3. THE Mine_Page SHALL update orderStatusState when navigating to orders
4. THE Mine_Page SHALL maintain existing API integration with user/detail endpoint
5. THE Mine_Page SHALL handle loading and error states appropriately
