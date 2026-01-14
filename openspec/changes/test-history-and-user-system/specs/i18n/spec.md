# Internationalization Capability - Delta Spec

## ADDED Requirements

### Requirement: Multi-Language Support
The system SHALL support 20 languages with complete UI translations.

#### Scenario: Supported languages
- **WHEN** system initializes
- **THEN** following languages are available:
  - Simplified Chinese (zh-CN)
  - English (en)
  - Spanish (es)
  - French (fr)
  - German (de)
  - Japanese (ja)
  - Portuguese (pt)
  - Russian (ru)
  - Italian (it)
  - Korean (ko)
  - Turkish (tr)
  - Dutch (nl)
  - Polish (pl)
  - Arabic (ar)
  - Hindi (hi)
  - Thai (th)
  - Vietnamese (vi)
  - Indonesian (id)
  - Swedish (sv)
  - Greek (el)

#### Scenario: Complete translation coverage
- **WHEN** user switches language
- **THEN** all UI text is translated including:
  - Navigation labels
  - Button text
  - Test names and descriptions
  - Result metrics labels
  - Error messages
  - Form labels

### Requirement: Language Switcher UI
The system SHALL provide a language switcher in the page header.

#### Scenario: Display language switcher
- **WHEN** user views any page
- **THEN** globe icon button is visible in top-right corner
- **AND** clicking opens dropdown menu
- **AND** menu shows all 20 languages with native names
- **AND** current language is highlighted

#### Scenario: Switch language
- **WHEN** user selects a language from dropdown
- **THEN** system immediately updates all UI text
- **AND** saves preference to localStorage
- **AND** dropdown closes automatically

### Requirement: Language Persistence
The system SHALL remember user's language preference across sessions.

#### Scenario: First visit language detection
- **WHEN** user visits site for first time
- **THEN** system detects browser language
- **AND** uses matching supported language if available
- **AND** falls back to English if browser language not supported

#### Scenario: Return visit
- **WHEN** user returns to site
- **THEN** system loads saved language from localStorage
- **AND** applies immediately on page load

#### Scenario: Logged-in user language sync
- **WHEN** logged-in user changes language
- **THEN** preference is saved to Supabase user profile
- **AND** syncs across devices

### Requirement: RTL Language Support
The system SHALL properly render right-to-left languages.

#### Scenario: Arabic language selected
- **WHEN** user selects Arabic language
- **THEN** system sets `dir="rtl"` on html element
- **AND** layout mirrors horizontally
- **AND** text alignment changes to right
- **AND** icons flip direction appropriately

#### Scenario: Switch from RTL to LTR
- **WHEN** user switches from Arabic to English
- **THEN** system removes `dir="rtl"` attribute
- **AND** layout returns to left-to-right
