# Design Document: Test History and User System

## Context
This change introduces user authentication, persistent data storage, and internationalization to the reaction test application. Previously, the app stored data only in localStorage with no user accounts or cloud sync. The system needs to scale to support multiple users, provide global access through i18n, and offer meaningful performance comparisons through score distribution analytics.

**Stakeholders**: End users (test takers), potential future analytics team

**Constraints**:
- Must maintain backward compatibility with localStorage data
- Must work offline (graceful degradation)
- Must keep anonymous mode available (no forced registration)
- Bundle size should remain reasonable (<1.5MB)

## Goals / Non-Goals

**Goals**:
- Persistent cloud storage of test results for logged-in users
- Anonymous users can still use all features, data contributes to public pool
- Score comparison via percentile rankings and distribution charts
- Support 20 major world languages
- Clean migration path from localStorage to Supabase

**Non-Goals**:
- Social features (leaderboards, friend comparisons) - future iteration
- Real-time multiplayer tests
- Email notifications
- Payment/premium features
- Native mobile apps

## Decisions

### Decision 1: Supabase as Backend
**What**: Use Supabase for authentication, database, and RLS policies

**Why**:
- Built-in auth (email/password, OAuth)
- PostgreSQL with automatic REST API
- Row-level security for multi-tenancy
- Free tier sufficient for MVP
- TypeScript SDK with excellent DX

**Alternatives considered**:
- Firebase: More expensive, vendor lock-in concerns
- Custom backend: Too much overhead for MVP
- LocalStorage only: No cross-device sync, limited analytics

### Decision 2: Dual Data Pool Strategy
**What**: Separate tables for user records (test_records) and public pool (public_records)

**Why**:
- Anonymous users contribute to distribution data without accounts
- Logged-in users get both personal history AND contribute to public pool
- Enables percentile calculations even with low registration rates
- Privacy-friendly: public pool stores only anonymized scores

**Schema**:
```sql
-- User's personal records (protected by RLS)
test_records: (id, user_id, test_type, score, created_at)

-- Anonymous public pool (open for percentile calculations)
public_records: (id, test_type, score, created_at)
```

### Decision 3: i18next for Internationalization
**What**: Use react-i18next library with JSON translation files

**Why**:
- Industry standard for React i18n
- Supports lazy loading (future optimization)
- Built-in RTL support for Arabic
- Easy context-aware translations
- localStorage integration for persistence

**File structure**:
```
src/i18n/
  config.ts          # i18next initialization
  locales/
    zh-CN.json       # Simplified Chinese
    en.json          # English
    ... (18 more)
```

### Decision 4: Recharts for Distribution Visualization
**What**: Use recharts library to draw score distribution histograms

**Why**:
- React-first, declarative API
- Responsive out of the box
- Reasonable bundle size (~200KB)
- Accessible (ARIA attributes)

**Alternatives considered**:
- Chart.js: Imperative API, harder to integrate with React
- D3.js: Too low-level, steep learning curve
- ECharts: Larger bundle size (~300KB)

### Decision 5: Zustand for Auth State Management
**What**: Use Zustand store for authentication state

**Why**:
- Already using Zustand for history state
- Minimal boilerplate compared to Redux
- Easy persistence with middleware
- TypeScript-first

**Auth Store Schema**:
```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Test Pages   │  │ History Page │  │  Layout      │      │
│  │ - Remove     │  │ - Best score │  │ - Lang sw.   │      │
│  │   grades     │  │ - Modal      │  │ - Auth UI    │      │
│  │ - Upload     │  │ - Delete     │  │              │      │
│  │   results    │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘               │
│                           │                                  │
│         ┌─────────────────▼──────────────────┐              │
│         │        State Management             │              │
│         │  ┌─────────────┐  ┌──────────────┐ │              │
│         │  │ useHistory  │  │ useAuthStore │ │              │
│         │  │   Store     │  │              │ │              │
│         │  └─────────────┘  └──────────────┘ │              │
│         └─────────────────┬──────────────────┘              │
│                           │                                  │
│         ┌─────────────────▼──────────────────┐              │
│         │       Data Sync Layer               │              │
│         │  - uploadTestResult()               │              │
│         │  - calculatePercentile()            │              │
│         │  - getScoreDistribution()           │              │
│         └─────────────────┬──────────────────┘              │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                ┌───────────▼────────────┐
                │   Supabase Backend     │
                │                        │
                │  ┌──────────────────┐  │
                │  │ Auth Service     │  │
                │  │ (email/password) │  │
                │  └──────────────────┘  │
                │                        │
                │  ┌──────────────────┐  │
                │  │ PostgreSQL       │  │
                │  │ - users          │  │
                │  │ - test_records   │  │
                │  │ - public_records │  │
                │  └──────────────────┘  │
                │                        │
                │  ┌──────────────────┐  │
                │  │ RLS Policies     │  │
                │  │ (row security)   │  │
                │  └──────────────────┘  │
                └────────────────────────┘
```

## Data Flow

### Test Completion Flow (Logged-In User)
```
1. User completes test
   ↓
2. Test page calls addResult() with user.id
   ↓
3. useHistoryStore saves to localStorage (immediate)
   ↓
4. useHistoryStore calls uploadTestResult(result, userId)
   ↓
5. dataSync.ts inserts into both tables:
   - test_records (user's personal record)
   - public_records (anonymous contribution)
   ↓
6. Result panel fetches distribution data
   ↓
7. Display chart with percentile
```

### Test Completion Flow (Anonymous User)
```
1. User completes test
   ↓
2. Test page calls addResult() without userId
   ↓
3. useHistoryStore saves to localStorage only
   ↓
4. useHistoryStore calls uploadTestResult(result, undefined)
   ↓
5. dataSync.ts inserts into public_records only
   ↓
6. Result panel fetches distribution data
   ↓
7. Display chart with percentile
```

## Security Considerations

### Row-Level Security (RLS) Policies
```sql
-- Users can only read their own records
CREATE POLICY "Users can view own records"
ON test_records FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own records
CREATE POLICY "Users can insert own records"
ON test_records FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own records
CREATE POLICY "Users can delete own records"
ON test_records FOR DELETE
USING (auth.uid() = user_id);

-- Public pool is read-only for percentile calculations
CREATE POLICY "Anyone can read public pool"
ON public_records FOR SELECT
USING (true);

-- Only authenticated users can insert to public pool
-- (prevents spam from anonymous users)
CREATE POLICY "Auth users can insert public records"
ON public_records FOR INSERT
WITH CHECK (true);
```

### Data Privacy
- Public pool contains ONLY score objects (no user identifiers)
- Email addresses never exposed in frontend
- Auth tokens stored in httpOnly cookies (Supabase default)
- No PII in localStorage (only test_type and score data)

## Performance Considerations

### Bundle Size Optimization
- i18next translations: ~50KB per language (lazy load in future)
- recharts: ~200KB
- @supabase/supabase-js: ~100KB
- Total overhead: ~350KB (acceptable for MVP)

**Future optimization**: Code-split language files, load on-demand

### Percentile Calculation
Current approach: Fetch ALL public records for a test type, calculate in browser

**Pros**: Simple, no backend logic needed
**Cons**: Slow when public_records grows to 10k+ rows

**Mitigation**: 
- Cache distribution data in component state (5 min TTL)
- Consider materialized view in Supabase if dataset grows
- Target: <2s load time for distribution chart

### Database Indexing
```sql
CREATE INDEX idx_test_records_user_type ON test_records(user_id, test_type);
CREATE INDEX idx_public_records_type ON public_records(test_type);
CREATE INDEX idx_test_records_created ON test_records(created_at DESC);
```

## Migration Plan

### Phase 1: Install & Configure (✅ Completed)
- Install dependencies
- Setup Supabase client
- Create database tables
- Configure i18n

### Phase 2: Auth & Data Sync (✅ Completed)
- Implement auth store
- Build auth modal
- Create data sync layer
- Update test pages

### Phase 3: UI Updates (✅ Completed)
- History page redesign
- Remove grade displays
- Add language switcher
- Integrate distribution charts

### Phase 4: Testing & Validation (✅ Completed)
- Fix TypeScript errors
- Verify no linter warnings
- Test all user flows
- Validate builds

### Phase 5: Archive (Pending)
- Run `openspec archive test-history-and-user-system`
- Update main spec files
- Document completion

### Rollback Plan
If critical issues found:
1. Revert to previous commit (code rollback)
2. localStorage data remains intact
3. Supabase tables can be dropped (no migration needed)
4. No user impact for anonymous users

## Open Questions

~~1. Should we add email verification requirement?~~
   - Decision: Yes, but non-blocking (users can use app while unverified)

~~2. How to handle localStorage data migration for existing users?~~
   - Decision: Prompt on first login, one-click upload

~~3. Translation source for 20 languages?~~
   - Decision: Start with machine translation, iterate with native speakers

4. Rate limiting for public_records inserts?
   - Decision: TBD, monitor for abuse

5. GDPR compliance for public data pool?
   - Decision: Add "opt-out" checkbox in settings (future feature)

## Success Metrics

- [ ] 90%+ test completion rate (no regressions from UI changes)
- [ ] <2s load time for distribution charts
- [ ] Zero data loss during migration
- [ ] 100% TypeScript compilation success
- [ ] No accessibility regressions (WCAG AA)
- [ ] <5% error rate on Supabase API calls
