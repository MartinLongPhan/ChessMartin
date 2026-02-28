const style = document.createElement("style");
style.textContent = `
.martin-hide-opponent 
[class*="player"]:not([class*="bottom"]) 
.player-tagline {
    background: #302E2B;
    backdrop-filter: blur(6px);
    border-radius: 6px;
}

.martin-hide-opponent 
[class*="player"]:not([class*="bottom"]) 
.player-tagline * {
    visibility: hidden !important;
}

.martin-hide-opponent 
[class*="player"]:not([class*="bottom"]) 
.player-tagline::after {
    content: "Anonymous Opponent";
    position: absolute;
    inset: 0;
    display: flex;
    align-items: left;
    justify-content: left;
    color: white;
    font-weight: bold;
    font-size: 14px;
    letter-spacing: 1px;
}
`;

const timeAlertStyle = document.createElement("style");
timeAlertStyle.textContent = `
@keyframes martin-yellow-glow {
    0%   { background: #35322e; box-shadow: 0 0 5px rgba(255, 170, 0, 0.2); }
    50%  { background: linear-gradient(145deg, #ff9f00, #cc7a00); box-shadow: 0 0 20px rgba(255, 159, 0, 0.6); }
    100% { background: #35322e; box-shadow: 0 0 5px rgba(255, 170, 0, 0.2); }
}
@keyframes martin-red-glow {
    0%   { background: #35322e; }
    50%  { background: linear-gradient(145deg, #ff0000, #b30000); box-shadow: 0 0 25px rgba(255, 0, 0, 0.8); }
    100% { background: #35322e; }
}
@keyframes martin-critical-glow {
    0%   { background: #35322e; transform: scale(1); }
    50%  { background: linear-gradient(145deg, #ff004c, #8b0000); box-shadow: 0 0 35px #ff0000, inset 0 0 10px rgba(255,255,255,0.3); transform: scale(1.08); }
    100% { background: #35322e; transform: scale(1); }
}
.martin-time-15 {
    animation: martin-yellow-glow 1.5s ease-in-out infinite;
    border-radius: 6px;
    border: 1px solid rgba(255, 159, 0, 0.3);
}
.martin-time-10 {
    animation: martin-red-glow 0.8s ease-in-out infinite;
    border-radius: 6px;
    border: 1px solid rgba(255, 0, 0, 0.5);
}
.martin-time-5 {
    animation: martin-critical-glow 0.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    border-radius: 6px;
    z-index: 10;
    border: 1px solid #ff0000;
}
`;
document.head.appendChild(timeAlertStyle);
document.head.appendChild(style);

// ===== LOW TIME ALERT =====
function checkLowTime() {
    const myClock = document.querySelector('[class*="clock-bottom"] .clock-time-monospace');
    if (!myClock) return;

    const timeText = myClock.innerText.trim();
    let seconds = 0;

    if (timeText.includes(":")) {
        const parts = timeText.split(":");
        seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else {
        seconds = parseInt(timeText);
    }

    myClock.classList.remove("martin-time-15", "martin-time-10", "martin-time-5");
    if (!currentSettings.lowTimeAlert) return;

    if (seconds <= 5) myClock.classList.add("martin-time-5");
    else if (seconds <= 10) myClock.classList.add("martin-time-10");
    else if (seconds <= 15) myClock.classList.add("martin-time-15");
}

let lowTimeInterval = null;

function startLowTimeInterval() {
    if (lowTimeInterval) return;
    lowTimeInterval = setInterval(checkLowTime, 500);
}

function stopLowTimeInterval() {
    if (lowTimeInterval) {
        clearInterval(lowTimeInterval);
        lowTimeInterval = null;
    }
    const myClock = document.querySelector('[class*="clock-bottom"] .clock-time-monospace');
    if (myClock) myClock.classList.remove("martin-time-15", "martin-time-10", "martin-time-5");
}

// ===== DIGITAL CLOCK — 7-SEGMENT LED =====

// Mỗi chữ số gồm 7 nét: [a, b, c, d, e, f, g]
// a=top, b=top-right, c=bot-right, d=bot, e=bot-left, f=top-left, g=mid
const SEGMENTS = {
    '0': [1, 1, 1, 1, 1, 1, 0],
    '1': [0, 1, 1, 0, 0, 0, 0],
    '2': [1, 1, 0, 1, 1, 0, 1],
    '3': [1, 1, 1, 1, 0, 0, 1],
    '4': [0, 1, 1, 0, 0, 1, 1],
    '5': [1, 0, 1, 1, 0, 1, 1],
    '6': [1, 0, 1, 1, 1, 1, 1],
    '7': [1, 1, 1, 0, 0, 0, 0],
    '8': [1, 1, 1, 1, 1, 1, 1],
    '9': [1, 1, 1, 1, 0, 1, 1],
};

const LED_ON = '#ff2200';
const LED_OFF = 'rgba(255,34,0,0.07)';
const S = 5;    // độ dày nét
const DW = 26;   // digit width
const DH = 44;   // digit height
const CW = 12;   // colon width
const GAP = 3;    // gap giữa ký tự

function drawDigit(ctx, char, x, y) {
    const segs = SEGMENTS[char];
    if (!segs) return;
    const [a, b, c, d, e, f, g] = segs;

    // Nét ngang (top, mid, bot)
    function hSeg(on, yy) {
        ctx.fillStyle = on ? LED_ON : LED_OFF;
        ctx.beginPath();
        ctx.moveTo(x + S, yy + S * 0.5);
        ctx.lineTo(x + S * 1.5, yy);
        ctx.lineTo(x + DW - S * 1.5, yy);
        ctx.lineTo(x + DW - S, yy + S * 0.5);
        ctx.lineTo(x + DW - S * 1.5, yy + S);
        ctx.lineTo(x + S * 1.5, yy + S);
        ctx.closePath();
        ctx.fill();
    }

    // Nét dọc (top-left, top-right, bot-left, bot-right)
    function vSeg(on, xx, yy) {
        ctx.fillStyle = on ? LED_ON : LED_OFF;
        ctx.beginPath();
        ctx.moveTo(xx + S * 0.5, yy + S);
        ctx.lineTo(xx + S, yy + S * 1.5);
        ctx.lineTo(xx + S, yy + DH / 2 - S * 1.5);
        ctx.lineTo(xx + S * 0.5, yy + DH / 2 - S);
        ctx.lineTo(xx, yy + DH / 2 - S * 1.5);
        ctx.lineTo(xx, yy + S * 1.5);
        ctx.closePath();
        ctx.fill();
    }

    hSeg(a, y);                        // top
    vSeg(b, x + DW - S, y);           // top-right
    vSeg(c, x + DW - S, y + DH / 2);    // bot-right
    hSeg(d, y + DH - S);              // bottom
    vSeg(e, x, y + DH / 2);             // bot-left
    vSeg(f, x, y);                     // top-left
    hSeg(g, y + DH / 2 - S / 2);          // middle
}

function drawColon(ctx, x, y) {
    ctx.fillStyle = LED_ON;
    const r = S * 0.85;
    const cx = x + CW / 2;
    ctx.beginPath(); ctx.arc(cx, y + DH * 0.3, r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, y + DH * 0.7, r, 0, Math.PI * 2); ctx.fill();
}

function renderTime(canvas, timeStr) {
    const chars = timeStr.replace(/\s/g, '').split('');

    // Tính tổng width
    let totalW = 0;
    chars.forEach(c => { totalW += (c === ':' ? CW : DW) + GAP; });
    totalW = Math.max(totalW - GAP, 1);

    canvas.width = totalW;
    canvas.height = DH;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let x = 0;
    chars.forEach(c => {
        if (c === ':') {
            drawColon(ctx, x, 0);
            x += CW + GAP;
        } else if (SEGMENTS[c]) {
            drawDigit(ctx, c, x, 0);
            x += DW + GAP;
        }
    });
}

function updateAllClocks() {
    document.querySelectorAll('.clock-time-monospace').forEach(span => {
        let timeText = span.innerText.trim();
        if (!timeText) return;

        // Chess.com hiển thị "0:16.2" khi < 20s — bỏ phần thập phân
        timeText = timeText.replace(/\.\d+$/, '');

        // Canvas đặt SAU span
        let canvas = span.nextElementSibling;
        if (!canvas || !canvas.classList.contains('martin-led-canvas')) {
            canvas = document.createElement('canvas');
            canvas.className = 'martin-led-canvas';
            canvas.style.cssText = `
                display: block;
                filter: drop-shadow(0 0 5px #ff2200) drop-shadow(0 0 12px rgba(255,34,0,0.5));
            `;
            span.after(canvas);
        }

        renderTime(canvas, timeText);
    });
}

let digitalClockInterval = null;

function startDigitalClock() {
    if (digitalClockInterval) return;
    document.body.classList.add('martin-digital-clock');
    updateAllClocks();
    digitalClockInterval = setInterval(updateAllClocks, 200);
}

function stopDigitalClock() {
    if (digitalClockInterval) {
        clearInterval(digitalClockInterval);
        digitalClockInterval = null;
    }
    document.body.classList.remove('martin-digital-clock');
    document.querySelectorAll('.martin-led-canvas').forEach(c => c.remove());
}

// ===== FULLSCREEN BUTTON =====
const btn = document.createElement("button");
btn.innerText = "⛶";
btn.title = "Fullscreen";
btn.style.position = "fixed";
btn.style.top = "15px";
btn.style.right = "15px";
btn.style.zIndex = "9999";
btn.style.padding = "8px 12px";
btn.style.fontSize = "16px";
btn.style.borderRadius = "6px";
btn.style.border = "none";
btn.style.cursor = "pointer";
btn.style.backgroundColor = "#2b2b2b";
btn.style.color = "white";
btn.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

btn.onclick = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
};
document.body.appendChild(btn);

let currentSettings = {};
console.log("MartinChessVN loaded");

// ===== APPLY SETTINGS =====
function applySettings(settings) {

    // Clock size
    document.querySelectorAll(".clock-time-monospace").forEach(clock => {
        clock.style.fontSize = settings.largerClock ? "40px" : "";
        clock.style.fontWeight = settings.largerClock ? "bold" : "";
    });

    // Hide Opponent
    toggleOpponentVisibility(settings.hideOpponent);

    // Clean UI
    document.body.classList.toggle("martin-clean", !!settings.cleanUI);
    document.body.classList.toggle("martin-hide-logo", !!(settings.cleanUI && settings.hideLogo));
    document.body.classList.toggle("martin-hide-ads", !!(settings.cleanUI && settings.hideAds));
    document.body.classList.toggle("martin-hide-notifications", !!(settings.cleanUI && settings.hideNotifications));

    // Low Time Alert
    settings.lowTimeAlert ? startLowTimeInterval() : stopLowTimeInterval();

    // Hide Game Messages
    document.body.classList.toggle("martin-hide-game-messages", !!settings.hideGameMessages);

    // Digital Clock
    settings.digitalClock ? startDigitalClock() : stopDigitalClock();
}

// ===== HIDE OPPONENT =====
function toggleOpponentVisibility(hide) {
    document.body.classList.toggle("martin-hide-opponent", !!hide);

    const avatars = document.querySelectorAll('[data-cy="avatar"]');
    avatars.forEach(avatar => {
        const playerBlock = avatar.closest('[class*="player"]');
        if (!playerBlock) return;

        const isUserBlock = playerBlock.matches('[class*="bottom"]');
        if (isUserBlock) return;

        if (hide) {
            if (!avatar.dataset.originalSrc) {
                avatar.dataset.originalSrc = avatar.src;
                avatar.dataset.originalSrcset = avatar.srcset;
            }
            avatar.src = chrome.runtime.getURL("assets/chess.png");
            avatar.srcset = "";

            const userTagline = playerBlock.querySelector('[class*="user-tagline"]');
            if (userTagline) {
                userTagline.querySelectorAll('*').forEach(el => {
                    if (!el.dataset.originalVisibility) el.dataset.originalVisibility = el.style.visibility || '';
                    el.style.visibility = 'hidden';
                });
            }

            playerBlock.querySelectorAll('[data-cy="country-flag"], .flag, [data-test-element="user-tagline-rating"]')
                .forEach(el => {
                    if (!el.dataset.originalDisplay) el.dataset.originalDisplay = el.style.display || '';
                    el.style.display = 'none';
                });

        } else {
            if (avatar.dataset.originalSrc) {
                avatar.src = avatar.dataset.originalSrc;
                avatar.srcset = avatar.dataset.originalSrcset || "";
                delete avatar.dataset.originalSrc;
                delete avatar.dataset.originalSrcset;
            }

            const userTagline = playerBlock.querySelector('[class*="user-tagline"]');
            if (userTagline) {
                userTagline.querySelectorAll('*').forEach(el => {
                    if (el.dataset.originalVisibility !== undefined) {
                        el.style.visibility = el.dataset.originalVisibility;
                        delete el.dataset.originalVisibility;
                    }
                });
            }

            playerBlock.querySelectorAll('[data-cy="country-flag"], .flag, [data-test-element="user-tagline-rating"]')
                .forEach(el => {
                    if (el.dataset.originalDisplay !== undefined) {
                        el.style.display = el.dataset.originalDisplay;
                        delete el.dataset.originalDisplay;
                    }
                });
        }
    });
}

// ===== LISTEN FOR REAL-TIME UPDATE =====
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "updateSettings") {
        const { action, ...newSettings } = message;
        currentSettings = { ...currentSettings, ...newSettings };
        applySettings(currentSettings);
    }
});

// ===== LOAD SETTINGS ON PAGE LOAD =====
chrome.storage.sync.get(
    ["largerClock", "hideOpponent", "cleanUI", "hideLogo", "hideAds",
        "hideNotifications", "lowTimeAlert", "hideGameMessages", "digitalClock"],
    (data) => {
        currentSettings = data;
        applySettings(currentSettings);
    }
);

// ===== KEEP SETTINGS AFTER SPA NAVIGATION =====
let timeout;
const observer = new MutationObserver((mutations) => {
    const onlyBodyClassChange = mutations.every(m =>
        m.type === "attributes" && m.target === document.body
    );
    if (onlyBodyClassChange) return;

    clearTimeout(timeout);
    timeout = setTimeout(() => applySettings(currentSettings), 100);
});

observer.observe(document.body, { childList: true, subtree: true, attributes: true });

// ===== STYLES =====
const cleanStyle = document.createElement("style");
cleanStyle.textContent = `

/* Clean UI toggles */
.martin-hide-logo .header-logo { display: none !important; }
.martin-hide-ads .advertisement,
.martin-hide-ads [class*="ad-"] { display: none !important; }
.martin-hide-notifications .notification-area,
.martin-hide-notifications [class*="notification"] { display: none !important; }

/* Hide Game Messages (toggle) */
.martin-hide-game-messages .game-over-message-component,
.martin-hide-game-messages .game-rate-sport-message-component,
.martin-hide-game-messages .game-start-message-component,
.martin-hide-game-messages .chat-input-component,
.martin-hide-game-messages .chat-room-chat,
.martin-hide-game-messages .resizable-chat-area-component {
    display: none !important;
}

/* Digital Clock — ẩn text gốc bằng font-size 0, giữ layout */
.martin-digital-clock .clock-time-monospace {
    font-size: 0 !important;
    line-height: 0 !important;
    color: transparent !important;
}

.martin-digital-clock .clock-icon-icon {
    display: none !important;
}

/* Căn chỉnh clock container để canvas hiển thị đẹp */
.martin-digital-clock .clock-component {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 6px 10px !important;
}
`;
document.head.appendChild(cleanStyle);