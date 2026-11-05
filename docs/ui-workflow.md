# Company and contact workflow improvements

This first interface pass focuses on the existing Companies and Contacts screens.

- Search remains available after a failed request, with clear-search and retry
  actions. Search text is controlled by the page so it survives query rerenders.
- Initial loading uses the full spinner; background fetching retains loaded rows
  and shows a small refresh hint. Company/contact queries use TanStack Query's
  `keepPreviousData` when their keys change. Placeholder-row actions and stale
  pagination/sorting controls are disabled until results settle. Empty placeholders
  do not claim that the pending search has no matches. Failed background refreshes
  keep the last loaded rows next to a retry alert.
- Empty search results offer clearing the search. An empty address book offers
  adding the first record. Result totals remain visible on a single page.
- Nested API values such as `_count.contacts` and `_count.deals` display their
  actual values, including zero. Row identity uses record IDs when available.
- Names open the record. Search, sorting, loading, pagination and icon-only
  actions have accessible labels or status information. Page headers stack on
  narrow screens and the table keeps its existing horizontal scroll container.
- A failed delete keeps its confirmation open with an error. Buttons and closing
  are disabled while the request is pending; successful deletion of a page's
  last record returns to the previous page.
- Save failures are visible in the form. Reopening a form or choosing another
  record resets its values to that record; typing does not reset the form.

## Checks

After installing the existing workspace dependencies:

```bash
npm run test:ui
npm run type-check --workspace @crm/web
npm run build
```

The UI checks use Node's built-in test runner, the project's TypeScript compiler,
and React's static renderer. They add no test framework dependency. The table
tests use native stand-ins for presentation primitives; page/form tests use
isolated hook state and mocked API/router services to exercise actual callback
and reset logic. They do not test browser focus, real Radix dialogs, visual layout,
the React scheduler, actual HTTP requests or persistence.

Before release, inspect Companies and Contacts on desktop and mobile against an
isolated development API. Exercise search/no results, retry after an offline
request, switching between two records in the edit form, failed save/delete and
deleting the final record on a later page. Confirm dialog focus/closing behavior
using the actual Radix components. These interactions should also receive full
browser tests when the project's dependency environment is available.

No database schema, authentication policy, API endpoint, sample data, production
service or deployment changes are part of this interface pass.
