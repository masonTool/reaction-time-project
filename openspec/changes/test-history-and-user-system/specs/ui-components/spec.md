# UI Components Capability - Delta Spec

## MODIFIED Requirements

### Requirement: Test Result Display
The system SHALL display test results without grade ratings, showing only key metrics.

#### Scenario: Color change test result
- **WHEN** user completes color change test
- **THEN** result panel shows:
  - Average reaction time
  - Fastest reaction time
  - Score distribution chart
- **AND** does NOT show grade rating (e.g., "Excellent", "Good")

#### Scenario: Click tracker test result
- **WHEN** user completes click tracker test
- **THEN** result panel shows:
  - Total clicks count
  - Accuracy percentage
  - Average reaction time per click
  - Score distribution chart

#### Scenario: Direction react test result
- **WHEN** user completes direction react test
- **THEN** result panel shows:
  - Accuracy percentage
  - Average reaction time
  - Score distribution chart

### Requirement: Score Distribution Chart Integration
The system SHALL integrate score distribution charts into result displays.

#### Scenario: Display distribution in ResultPanel
- **WHEN** test completes successfully
- **THEN** ResultPanel shows distribution chart below metrics
- **AND** chart displays histogram with 10 bins
- **AND** user's score is marked with red vertical line
- **AND** percentile text shows above chart

#### Scenario: Distribution in history modal
- **WHEN** user views detailed records in history modal
- **THEN** best score's distribution chart is displayed
- **AND** chart uses same data as result panel

## ADDED Requirements

### Requirement: Language Switcher Component
The system SHALL provide a language switcher component in the header.

#### Scenario: Display language switcher
- **WHEN** page header renders
- **THEN** globe icon button appears in top-right
- **AND** is positioned before auth buttons
- **AND** has hover effect

#### Scenario: Open language menu
- **WHEN** user clicks globe icon
- **THEN** dropdown menu opens below button
- **AND** shows all 20 supported languages
- **AND** displays language native name + flag emoji
- **AND** current language has checkmark

#### Scenario: Select language
- **WHEN** user clicks a language option
- **THEN** menu closes immediately
- **AND** UI updates to selected language
- **AND** preference is persisted

### Requirement: Authentication UI
The system SHALL display login/logout buttons in page header.

#### Scenario: Logged-out state
- **WHEN** user is not logged in
- **THEN** header shows "Login" button
- **AND** clicking opens authentication modal

#### Scenario: Logged-in state
- **WHEN** user is logged in
- **THEN** header shows user email or username
- **AND** shows "Logout" button
- **AND** clicking logout logs out user

### Requirement: Authentication Modal
The system SHALL provide a modal for login and registration.

#### Scenario: Open login modal
- **WHEN** user clicks "Login" button
- **THEN** modal opens showing login form
- **AND** form has email and password fields
- **AND** has "Login" and "Register" tabs

#### Scenario: Switch to registration
- **WHEN** user clicks "Register" tab
- **THEN** form switches to registration mode
- **AND** shows email, password, confirm password fields
- **AND** shows registration button

#### Scenario: Close modal
- **WHEN** user clicks X or outside modal
- **THEN** modal closes
- **AND** form state is reset
