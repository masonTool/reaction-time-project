# Implementation Tasks

## 1. Foundation Setup
- [x] 1.1 Install dependencies (@supabase/supabase-js, react-i18next, recharts)
- [x] 1.2 Configure Supabase client (src/lib/supabase.ts)
- [x] 1.3 Create database tables and RLS policies
- [x] 1.4 Setup i18next configuration (src/i18n/config.ts)

## 2. Authentication System
- [x] 2.1 Create useAuthStore (Zustand store)
- [x] 2.2 Implement AuthModal component (login/register)
- [x] 2.3 Add auth UI to Layout (login/logout buttons)
- [x] 2.4 Initialize auth state on app startup

## 3. Data Sync Layer
- [x] 3.1 Create data sync utilities (src/lib/dataSync.ts)
  - [x] uploadTestResult (supports logged-in and anonymous)
  - [x] getUserTestRecords
  - [x] deleteTestRecord
  - [x] clearAllTestRecords
  - [x] calculatePercentile
  - [x] getScoreDistribution

## 4. Internationalization
- [x] 4.1 Create translation files (zh-CN.json, en.json)
- [x] 4.2 Setup i18n provider in main.tsx
- [x] 4.3 Create LanguageSwitcher component (globe icon + dropdown)
- [x] 4.4 Add i18nKey to TEST_INFO
- [x] 4.5 Update all UI text to use translation keys

## 5. Test Pages Update
- [x] 5.1 Update color-change test (remove grade, add data upload)
- [x] 5.2 Update click-tracker test
- [x] 5.3 Update audio-react test
- [x] 5.4 Update direction-react test
- [x] 5.5 Update number-flash test
- [x] 5.6 Update sequence-memory test

## 6. History Store Refactor
- [x] 6.1 Update useHistoryStore to save all records (not just best)
- [x] 6.2 Add async methods for Supabase sync
- [x] 6.3 Implement compareResults for different test types
- [x] 6.4 Add getBestResult and getResultsByType helpers

## 7. History Page Redesign
- [x] 7.1 Show best score cards for each test type
- [x] 7.2 Implement modal for detailed records drill-down
- [x] 7.3 Add delete single record button
- [x] 7.4 Add clear all records button
- [x] 7.5 Integrate score distribution chart in modal

## 8. Score Distribution Visualization
- [x] 8.1 Create ScoreDistribution component (recharts)
- [x] 8.2 Fetch public records for percentile calculation
- [x] 8.3 Draw histogram with user position marker
- [x] 8.4 Display percentile with 2 decimal places if < 1%
- [x] 8.5 Integrate into ResultPanel
- [x] 8.6 Integrate into History page modal

## 9. UI Polish
- [x] 9.1 Update page title to "反应能力测试"
- [x] 9.2 Remove "首页" label from Layout
- [x] 9.3 Add LanguageSwitcher to Layout header
- [x] 9.4 Update TestCard to use translations

## 10. Testing & Validation
- [x] 10.1 Fix TypeScript compilation errors
- [x] 10.2 Verify no linter errors
- [x] 10.3 Test build process
- [x] 10.4 Verify dev server runs successfully
