## 2026-06-12 - [HIGH] Disk I/O & JSON Parsing Overhead in Historical Data Routes
**Performance Bottleneck:** The backend API endpoint `/api/rates` and `/api/history` read `history.json` from disk and parsed it to JSON on every single request or cache miss. As the history grows (up to 2016 items), this blocks the single-threaded Node.js event loop with synchronous-like I/O and CPU-intensive parsing overhead.
**Learning:** Reading files and parsing JSON repeatedly inside HTTP request handlers is highly inefficient. Keeping a clean, pre-processed copy of the dataset in memory (`inMemoryHistory`) bounds performance, reduces resource contention, and simplifies writes.
**Optimization:** Stored the pre-processed history array in an in-memory variable `inMemoryHistory` during startup (`initializeHistory`). On subsequent background updates, the in-memory array is updated in memory and safely flushed to disk, eliminating all read-side disk I/O and JSON parsing.

## 2026-06-12 - [MEDIUM] Event Loop Blocking via Date Parsing in Search Loops
**Performance Bottleneck:** The API determined the currency rates for the last 24 hours by instantiating new `Date` objects inside a search loop: `history.find(h => new Date(h.timestamp).getTime() >= targetTime)`.
**Learning:** Instantiating `Date` objects repeatedly for hundreds or thousands of array elements inside a search loop blocks the event loop and wastes CPU cycles.
**Optimization:** Formatted the target time threshold once as an ISO 8601 string (`new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString()`) and performed a direct lexicographical string comparison (`h.timestamp >= targetTimeString`) on each item. Lexicographical comparisons are extremely fast in V8 and completely avoid object creation.

## 2026-06-12 - [MEDIUM] React Client Re-render Calculations & GC Pressure
**Performance Bottleneck:** The React frontend re-rendered the dashboard every second to update a countdown timer. On every render tick, each of the 8 chart instances called `downsampleData(data, 350)` on the history dataset, running thousands of loop iterations and allocating new arrays. This created constant GC (Garbage Collection) pressure and blocked the main thread.
**Learning:** Timer ticks should only update the timer state. They should never trigger expensive recalculations of static or slowly-changing datasets like chart values.
**Optimization:** Wrapped the `downsampleData` invocation inside a `useMemo` hook, ensuring that it only re-evaluates when the underlying market dataset changes, reducing the render-time CPU usage to zero on timer ticks.

## 2026-06-18 - [HIGH] Cascade Dashboard Re-renders & ICU Date Formatting CPU Overhead
**Performance Bottleneck:** High-frequency timer state (1-second countdown) kept in the main `App` component forced cascading re-renders of the entire dashboard (8 charts, stat cards, converters, layout) every second. Additionally, executing `toLocaleTimeString` and `toLocaleString` repeatedly inside Recharts' axis and tooltip formatters during hover/redraw triggered expensive ICU translation parsing.
**Learning:** High-frequency timers must be isolated in self-contained components to avoid rendering cascade. ICU-dependent functions like `.toLocaleString()` should be cached when formatting stable inputs (like ISO timestamps) to avoid CPU bottlenecks in rendering loops.
**Action:** Decoupled the countdown timer state into a local `<SyncTimer />` component, and introduced a memory-efficient `Map`-based cache for date/time formatting.

## 2026-06-19 - [HIGH] React Client Render & Date/Time Formatting Optimization
**Performance Bottleneck:** The main React `App` component re-rendered every second due to the countdown timer. This triggered a `new Date().toLocaleTimeString(...)` call for the header synchronization time every second. Additionally, hovering over Recharts charts triggered repeated calls to `toLocaleTimeString` and `toLocaleString` without caching, leading to severe layout thrashing and CPU spikes due to ICU translation parsing.
**Learning:** React memoization must be applied strategically to components that do not change between timer ticks, and expensive locale-dependent string formatting (like `toLocaleTimeString` and `toLocaleString`) must be cached when processing stable ISO 8601 timestamps.
**Optimization:** 
1. Memoized the header last sync time string using `useMemo` so it only parses and formats the Date when the synchronization timestamp changes (every 5 minutes, representing a 99.6% reduction in header formatting calls).
2. Introduced global `Map`-based caches (`timeCache`, `dateTimeCache`) for Recharts formatters to reuse formatted string values instead of creating fresh `Date` objects and parsing ICU formats on every redraw.
3. Wrapped `RegionChart` in `React.memo` with a custom props comparison function, completely eliminating all chart re-renders and downsampling calculations during timer ticks.
