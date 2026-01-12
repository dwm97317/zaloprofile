## ADDED Requirements

### Requirement: LINE LIFF Initialization
The system MUST initialize the LINE Front-end Framework (LIFF) SDK before enabling any user interaction.

#### Scenario: Successful initialization
- **WHEN** the app starts
- **THEN** it calls liff.init() with the provided LIFF ID
- **AND** redirects to the login flow if the user is not authenticated

### Requirement: Thai Default Language
The system MUST provide all user interface elements in Thai by default.

#### Scenario: App boots in Thai
- **WHEN** a user visits any page without a language preference
- **THEN** the UI provides Thai labels and placeholders

### Requirement: Thailand Address Support
The address management system MUST support the specific administrative hierarchy of Thailand.

#### Scenario: Address selection
- **WHEN** a user selects a location via the map
- **THEN** the system extracts Province (Changwat), District (Amphoe), and Sub-district (Tambon)
- **AND** parses the correct Postal Code

### Requirement: Full Business Loop Parity
The LINE Mini App version MUST support the complete storage-consolidation-payment lifecycle.

#### Scenario: Complete consolidation workflow
- **WHEN** a user selects in-stock items in the LINE app
- **THEN** the system allows consolidation and checkout
- **AND** processes payment via the refactored request utility
