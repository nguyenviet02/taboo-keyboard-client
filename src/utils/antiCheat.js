const VIOLATION_THRESHOLD = 1;
const MIN_INTER_KEY_MS = 30;
const UNIFORM_TIMING_TOLERANCE = 5;
const MIN_WORD_TIME_MS = 400;

let violations = [];
let listeners = [];
let keystrokeTimes = [];
let wordStartTime = null;
let devtoolsCheckInterval = null;
let isGameActive = false;

function notify(violation) {
  listeners.forEach((fn) => fn(violation));
}

export function onViolation(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function addViolation(type) {
  if (!isGameActive) return;
  const entry = { type, timestamp: Date.now() };
  violations.push(entry);
  console.warn("[AntiCheat] Violation:", type, "| Total:", violations.length);
  notify(entry);
}

export function getViolations() {
  return [...violations];
}

export function getViolationCount() {
  return violations.length;
}

export function isOverThreshold() {
  return violations.length >= VIOLATION_THRESHOLD;
}

// --- Bot Detection: Keystroke Timing ---

export function recordKeystroke() {
  keystrokeTimes.push(performance.now());
}

export function markWordStart() {
  wordStartTime = performance.now();
  keystrokeTimes = [];
}

export function checkTypingPattern() {
  if (keystrokeTimes.length < 3) return false;

  const delays = [];
  for (let i = 1; i < keystrokeTimes.length; i++) {
    delays.push(keystrokeTimes[i] - keystrokeTimes[i - 1]);
  }

  const allTooFast = delays.every((d) => d < MIN_INTER_KEY_MS);
  if (allTooFast) {
    addViolation("bot_fast_typing");
    return true;
  }

  const avg = delays.reduce((a, b) => a + b, 0) / delays.length;
  const allUniform = delays.every(
    (d) => Math.abs(d - avg) < UNIFORM_TIMING_TOLERANCE,
  );
  if (allUniform && delays.length >= 4) {
    addViolation("bot_uniform_timing");
    return true;
  }

  if (wordStartTime) {
    const elapsed = performance.now() - wordStartTime;
    if (elapsed < MIN_WORD_TIME_MS && keystrokeTimes.length > 3) {
      addViolation("bot_speed");
      return true;
    }
  }

  return false;
}

// --- DevTools / Automation Detection ---

function checkAutomation() {
  if (navigator.webdriver) return true;
  if (window.__selenium) return true;
  if (window.callPhantom) return true;
  if (window.__nightmare) return true;
  return false;
}

function checkDevToolsSize() {
  const threshold = 160;
  const widthDiff = window.outerWidth - window.innerWidth > threshold;
  const heightDiff = window.outerHeight - window.innerHeight > threshold;
  return widthDiff || heightDiff;
}

export function startDevToolsDetection() {
  if (checkAutomation()) {
    addViolation("automation_detected");
  }

  devtoolsCheckInterval = setInterval(() => {
    if (!isGameActive) return;
    if (checkDevToolsSize()) {
      addViolation("devtools_open");
    }
  }, 2000);
}

export function stopDevToolsDetection() {
  if (devtoolsCheckInterval) {
    clearInterval(devtoolsCheckInterval);
    devtoolsCheckInterval = null;
  }
}

// --- Tab Visibility / Focus Detection ---

function handleVisibilityChange() {
  if (!isGameActive) return;
  if (document.hidden) {
    addViolation("tab_hidden");
  }
}

function handleWindowBlur() {
  if (!isGameActive) return;
  addViolation("tab_hidden");
}

export function startVisibilityDetection() {
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleWindowBlur);
}

export function stopVisibilityDetection() {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  window.removeEventListener("blur", handleWindowBlur);
}

// --- Paste Detection ---

export function handlePaste(e) {
  if (!isGameActive) return;
  e.preventDefault();
  addViolation("paste_attempt");
}

// --- Proof of Work ---

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function generateProofOfWork(gameData, difficulty = 4) {
  const prefix = "0".repeat(difficulty);
  let nonce = 0;
  const dataStr = JSON.stringify(gameData);

  while (true) {
    const hash = await sha256(dataStr + nonce);
    if (hash.startsWith(prefix)) {
      return { nonce, hash, gameData: dataStr };
    }
    nonce++;
    if (nonce % 1000 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }
}

// --- Lifecycle ---

export function startAntiCheat() {
  isGameActive = true;
  violations = [];
  keystrokeTimes = [];
  wordStartTime = null;
  startDevToolsDetection();
  startVisibilityDetection();
  console.log("[AntiCheat] Started. isGameActive:", isGameActive);
}

export function stopAntiCheat() {
  isGameActive = false;
  stopDevToolsDetection();
  stopVisibilityDetection();
}

export function resetAntiCheat() {
  stopAntiCheat();
  violations = [];
  keystrokeTimes = [];
  wordStartTime = null;
}
