# User Authentication Capability - Delta Spec

## ADDED Requirements

### Requirement: User Registration
The system SHALL allow users to create accounts using email and password.

#### Scenario: Successful registration
- **WHEN** user provides valid email and password
- **THEN** system creates account in Supabase
- **AND** sends verification email
- **AND** logs user in automatically
- **AND** initializes user profile with default language preference

#### Scenario: Registration with existing email
- **WHEN** user attempts to register with existing email
- **THEN** system displays error message
- **AND** prompts to log in instead

#### Scenario: Invalid email format
- **WHEN** user provides invalid email format
- **THEN** system displays validation error
- **AND** prevents form submission

### Requirement: User Login
The system SHALL authenticate users with email and password.

#### Scenario: Successful login
- **WHEN** user provides valid credentials
- **THEN** system authenticates via Supabase
- **AND** stores session in localStorage
- **AND** updates UI to show logged-in state
- **AND** syncs test records from server

#### Scenario: Failed login
- **WHEN** user provides incorrect credentials
- **THEN** system displays error message
- **AND** allows retry

#### Scenario: Session persistence
- **WHEN** user returns to site
- **THEN** system restores session from localStorage
- **AND** auto-logs in if token is valid

### Requirement: User Logout
The system SHALL allow users to log out and clear session.

#### Scenario: User logs out
- **WHEN** user clicks logout button
- **THEN** system clears session from Supabase
- **AND** removes token from localStorage
- **AND** updates UI to logged-out state
- **AND** keeps anonymous test history in localStorage

### Requirement: Test Result Sync
The system SHALL upload test results to Supabase for logged-in users.

#### Scenario: Logged-in user completes test
- **WHEN** logged-in user completes test
- **THEN** system uploads result to test_records table
- **AND** uploads anonymized copy to public_records
- **AND** saves to localStorage as backup
- **AND** displays success confirmation

#### Scenario: Anonymous user completes test
- **WHEN** anonymous user completes test
- **THEN** system uploads result to public_records only
- **AND** saves to localStorage
- **AND** result is available for percentile calculations

#### Scenario: Upload failure
- **WHEN** network error occurs during upload
- **THEN** system logs error to console
- **AND** still saves to localStorage
- **AND** continues showing results normally

### Requirement: Data Migration on Login
The system SHALL offer to migrate localStorage data when user logs in.

#### Scenario: Login with existing localStorage data
- **WHEN** user logs in for first time
- **AND** has test records in localStorage
- **THEN** system prompts to upload existing records
- **AND** upon confirmation, uploads all to test_records
- **AND** marks local records as synced
