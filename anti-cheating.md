# Anti-Cheating (Client-Side Detection)

## Goal
Detect and penalize cheating attempts (bots, devtools, tab switching) without backend changes. Deter casual cheaters; accept that determined attackers can always bypass client-side checks.

## Tasks

- [ ] **Task 1: Create `src/utils/antiCheat.js` module**
  - Central module exporting detection utilities and a "violation" event system
  - Tracks violation count; exposes `getViolations()` for game logic to query
  - Verify: File exists, imports cleanly

- [ ] **Task 2: Bot detection — typing pattern analysis**
  - Track keystroke timing (inter-key delay) in `useGameLogic`
  - Flag if: consistent sub-30ms intervals (inhuman), or perfectly uniform timing
  - Flag if: words submitted faster than humanly typeable (~15 WPM minimum per word)
  - Verify: Type normally → no flag. Paste a word rapidly → flag triggers

- [ ] **Task 3: DevTools / automation tool detection**
  - Detect debugger presence via timing (`debugger` statement + `performance.now()` delta)
  - Detect `window.outerHeight - window.innerHeight` threshold change (devtools open)
  - Detect common automation: `navigator.webdriver`, `window.__selenium`, `window.callPhantom`
  - Verify: Open DevTools → detection fires. Close → normal play resumes (or game ends)

- [ ] **Task 4: Tab visibility / focus detection**
  - Use `document.visibilitychange` + `window.blur/focus` events
  - If tab loses focus during active round: pause timer? or flag as violation?
  - Short grace period (2s) to avoid false positives from notifications
  - Verify: Switch tab during round → violation logged after grace period

- [ ] **Task 5: Proof-of-work on score submission**
  - Before submitting score, require a small client-side PoW (e.g., find a nonce where `SHA-256(gameData + nonce)` has N leading zeros)
  - Difficulty low enough for instant solve on real browsers (~50-200ms), but adds friction for scripted mass submissions
  - Include `gameData` = serialized round history so PoW is tied to actual gameplay
  - Verify: Score submits after short computation. Forged payload without PoW → rejected by submission logic

- [ ] **Task 6: Integrate detections into game flow**
  - On violation threshold (e.g., 3 strikes): end game immediately, mark score as tainted (don't submit to leaderboard)
  - Show generic "Session ended" message (don't reveal which detection triggered — makes bypassing harder)
  - Verify: Trigger 3 violations → game ends, no leaderboard submission

- [ ] **Task 7: Clipboard / paste detection**
  - Intercept `paste` event on the input field
  - Either block paste entirely or count as violation
  - Verify: Ctrl+V in game input → blocked or flagged

## Done When
- [ ] Bots with uniform typing patterns are detected and blocked
- [ ] DevTools open triggers detection
- [ ] Tab switch during gameplay is caught
- [ ] Score submission includes PoW hash
- [ ] Paste is blocked/flagged
- [ ] All detections feed into a unified violation system that ends the game at threshold

## Notes
- Client-side only = deterrence, not prevention. Determined attackers can patch JS.
- Keep detection logic obfuscated (minified names, indirect checks) to raise the bar slightly.
- False positive tolerance: grace periods and thresholds prevent punishing legitimate players.
