## ADDED Requirements

### Requirement: China-Thailand Shipping Lines
The system SHALL support logistics routes specifically configured for China to Thailand shipping.

#### Scenario: Route calculation
- **WHEN** user requests a freight estimate for Thailand
- **THEN** the system applies Thai shipping rates and timelines
- **AND** displays prices in Baht (THB) or equivalent as configured

### Requirement: Thailand Postcode Validation
The system MUST validate postcodes based on the 5-digit Thai postal code standard.

#### Scenario: Invalid postcode entry
- **WHEN** user enters a non-5-digit postcode
- **THEN** show a validation error in Thai
