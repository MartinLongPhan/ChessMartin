const style = document.createElement("style");
style.textContent = `
/* ===== HIDE OPPONENT - ẩn hết trừ clock và captured pieces ===== */

/* Ẩn toàn bộ player-top, sau đó show lại những gì cần giữ */
.martin-hide-opponent #board-layout-player-top > * {
visibility: hidden !important;
}

/* Giữ lại đồng hồ */
.martin-hide-opponent #board-layout-player-top [class*="clock"],
.martin-hide-opponent #board-layout-player-top [class*="Clock"] {
visibility: visible !important;
}
.martin-hide-opponent #board-layout-player-top [class*="clock"] *,
.martin-hide-opponent #board-layout-player-top [class*="Clock"] * {
visibility: visible !important;
}

/* Giữ lại captured pieces */
.martin-hide-opponent #board-layout-player-top [class*="captured"],
.martin-hide-opponent #board-layout-player-top [class*="material"],
.martin-hide-opponent #board-layout-player-top [class*="Captured"],
.martin-hide-opponent #board-layout-player-top [class*="Material"] {
visibility: visible !important;
}
.martin-hide-opponent #board-layout-player-top [class*="captured"] *,
.martin-hide-opponent #board-layout-player-top [class*="material"] *,
.martin-hide-opponent #board-layout-player-top [class*="Captured"] *,
.martin-hide-opponent #board-layout-player-top [class*="Material"] * {
visibility: visible !important;
}
`;

const timeAlertStyle = document.createElement("style");
timeAlertStyle.textContent = `
@keyframes martin-yellow-glow {
0%   { box-shadow: 0 0 6px rgba(0,150,255,0.4), 0 0 12px rgba(0,150,255,0.2); border-color: rgba(0,150,255,0.7); }
50%  { box-shadow: 0 0 14px rgba(0,180,255,0.9), 0 0 28px rgba(0,150,255,0.5), inset 0 0 8px rgba(0,150,255,0.15); border-color: rgba(0,180,255,1); }
100% { box-shadow: 0 0 6px rgba(0,150,255,0.4), 0 0 12px rgba(0,150,255,0.2); border-color: rgba(0,150,255,0.7); }
}
@keyframes martin-red-glow {
0%   { box-shadow: 0 0 8px rgba(140,0,255,0.5), 0 0 18px rgba(140,0,255,0.25); border-color: rgba(140,0,255,0.8); }
50%  { box-shadow: 0 0 18px rgba(180,0,255,1), 0 0 36px rgba(140,0,255,0.6), inset 0 0 10px rgba(160,0,255,0.2); border-color: rgba(180,0,255,1); }
100% { box-shadow: 0 0 8px rgba(140,0,255,0.5), 0 0 18px rgba(140,0,255,0.25); border-color: rgba(140,0,255,0.8); }
}
@keyframes martin-critical-glow {
0%   { box-shadow: 0 0 10px rgba(255,0,60,0.5), 0 0 22px rgba(255,0,60,0.25); border-color: rgba(255,0,60,0.8); transform: scale(1); }
30%  { box-shadow: 0 0 22px rgba(255,0,60,1), 0 0 45px rgba(255,0,60,0.7), 0 0 70px rgba(255,0,60,0.3), inset 0 0 12px rgba(255,0,60,0.25); border-color: #ff003c; transform: scale(1.06); }
60%  { box-shadow: 0 0 14px rgba(255,0,60,0.7), 0 0 28px rgba(255,0,60,0.4); border-color: rgba(255,0,60,0.9); transform: scale(0.98); }
100% { box-shadow: 0 0 10px rgba(255,0,60,0.5), 0 0 22px rgba(255,0,60,0.25); border-color: rgba(255,0,60,0.8); transform: scale(1); }
}

/* đảm bảo clock có position */
.clock-component {
position: relative !important;
}

/* base cho vạch accent */
.clock-component.martin-time-15::before,
.clock-component.martin-time-10::before,
.clock-component.martin-time-5::before {
content: "";
position: absolute;
left: 0;
top: 8%;
height: 84%;
width: 4px;
border-radius: 4px;
pointer-events: none;
}

/* 15 giây – xanh hiện đại */
.clock-component.martin-time-15::before {
background: #3b82f6;
}

/* 10 giây – vàng hổ phách */
.clock-component.martin-time-10::before {
background: #f59e0b;
}

/* 5 giây – đỏ trầm */
.clock-component.martin-time-5::before {
background: #ef4444;
}

.martin-time-5 {
    animation: martin-panic-shake 0.2s infinite;
}

@keyframes martin-panic-shake {
    0% { transform: translate(0,0); }
    25% { transform: translate(1px, -1px); }
    75% { transform: translate(-1px, 1px); }
    100% { transform: translate(0,0); }
}

.clock-component.martin-time-15,
.clock-component.martin-time-10,
.clock-component.martin-time-5 {
overflow: visible !important;
}
`;
document.head.appendChild(timeAlertStyle);
document.head.appendChild(style);

// ===== LOW TIME ALERT =====
function checkLowTime() {
    // FIX #5: Dùng selector chuẩn hơn thay vì [class*="clock-bottom"]
    const myClock = document.querySelector('[data-cy="clock-bottom"] .clock-time-monospace')
        || document.querySelector('.clock-bottom .clock-time-monospace');
    if (!myClock) return;

    const timeText = myClock.innerText.trim();
    let seconds = 0;
    if (timeText.includes(":")) {
        const parts = timeText.split(":");
        seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else {
        seconds = parseInt(timeText);
    }

    const clockComp = myClock.closest('[class*="clock-component"]') || myClock;
    clockComp.classList.remove("martin-time-15", "martin-time-10", "martin-time-5");

    if (!currentSettings.lowTimeAlert) return;
    if (seconds <= 5) clockComp.classList.add("martin-time-5");
    else if (seconds <= 10) clockComp.classList.add("martin-time-10");
    else if (seconds <= 15) clockComp.classList.add("martin-time-15");
}

let lowTimeInterval = null;
function startLowTimeInterval() {
    if (lowTimeInterval) clearInterval(lowTimeInterval);
    lowTimeInterval = setInterval(checkLowTime, 500);
}
function stopLowTimeInterval() {
    if (lowTimeInterval) { clearInterval(lowTimeInterval); lowTimeInterval = null; }
    document.querySelectorAll('[class*="clock-component"]').forEach(el =>
        el.classList.remove("martin-time-15", "martin-time-10", "martin-time-5")
    );
}

// ===== DIGITAL CLOCK — 7-SEGMENT LED =====
const SEGMENTS = {
    '0': [1, 1, 1, 1, 1, 1, 0], '1': [0, 1, 1, 0, 0, 0, 0], '2': [1, 1, 0, 1, 1, 0, 1],
    '3': [1, 1, 1, 1, 0, 0, 1], '4': [0, 1, 1, 0, 0, 1, 1], '5': [1, 0, 1, 1, 0, 1, 1],
    '6': [1, 0, 1, 1, 1, 1, 1], '7': [1, 1, 1, 0, 0, 0, 0], '8': [1, 1, 1, 1, 1, 1, 1], '9': [1, 1, 1, 1, 0, 1, 1],
};
const LED_ON = '#000000';
const LED_OFF = 'rgba(0, 0, 0, 0.05)';
const S = 3;
const DW = 16;
const DH = 26;
const CW = 7;
const GAP = 2;

// Cấu hình màu sắc chuẩn Gaming
const THEME = {
    SAFE:   { color: '#39ff14', glow: '#20c20e', bg: 'rgba(57, 255, 20, 0.03)' }, // Xanh Neon
    WARN:   { color: '#ff9900', glow: '#cc7a00', bg: 'rgba(255, 153, 0, 0.03)' }, // Vàng Amber
    DANGER: { color: '#ff3131', glow: '#d00000', bg: 'rgba(255, 49, 49, 0.03)' }  // Đỏ rực
};

function drawDigit(ctx, char, x, y) {
    // Hàm gốc vẫn giữ cho tương thích nếu có nơi khác dùng
    const segs = SEGMENTS[char];
    if (!segs) return;
    const [a, b, c, d, e, f, g] = segs;
    function hSeg(on, yy) {
        ctx.fillStyle = on ? LED_ON : LED_OFF;
        ctx.beginPath();
        ctx.moveTo(x + S, yy + S * 0.5); ctx.lineTo(x + S * 1.5, yy);
        ctx.lineTo(x + DW - S * 1.5, yy); ctx.lineTo(x + DW - S, yy + S * 0.5);
        ctx.lineTo(x + DW - S * 1.5, yy + S); ctx.lineTo(x + S * 1.5, yy + S);
        ctx.closePath(); ctx.fill();
    }
    function vSeg(on, xx, yy) {
        ctx.fillStyle = on ? LED_ON : LED_OFF;
        ctx.beginPath();
        ctx.moveTo(xx + S * 0.5, yy + S); ctx.lineTo(xx + S, yy + S * 1.5);
        ctx.lineTo(xx + S, yy + DH / 2 - S * 1.5); ctx.lineTo(xx + S * 0.5, yy + DH / 2 - S);
        ctx.lineTo(xx, yy + DH / 2 - S * 1.5); ctx.lineTo(xx, yy + S * 1.5);
        ctx.closePath(); ctx.fill();
    }
    hSeg(a, y);
    vSeg(b, x + DW - S, y);
    vSeg(c, x + DW - S, y + DH / 2);
    hSeg(d, y + DH - S);
    vSeg(e, x, y + DH / 2);
    vSeg(f, x, y);
    hSeg(g, y + DH / 2 - S / 2);
}

function drawColon(ctx, x, y) {
    ctx.fillStyle = LED_ON;
    const r = S * 0.85;
    const cx = x + CW / 2;
    ctx.beginPath(); ctx.arc(cx, y + DH * 0.3, r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, y + DH * 0.7, r, 0, Math.PI * 2); ctx.fill();
}

// function renderTime(canvas, timeStr) {
//     const chars = timeStr.replace(/\s/g, '').split('');
//     const PAD = 3;
//     let totalW = 0;
//     chars.forEach(c => { totalW += (c === ':' ? CW : DW) + GAP; });
//     totalW = Math.max(totalW - GAP, 1);
//     canvas.width = totalW + PAD * 2;
//     canvas.height = DH + PAD * 2;
//     const ctx = canvas.getContext('2d');
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     let x = PAD;
//     chars.forEach(c => {
//         if (c === ':') { drawColon(ctx, x, PAD); x += CW + GAP; }
//         else if (SEGMENTS[c]) { drawDigit(ctx, c, x, PAD); x += DW + GAP; }
//     });
// }

function renderTime(canvas, timeStr, seconds) {
    const chars = timeStr.replace(/\s/g, '').split('');
    const PAD = 4;
    
    // Chọn Theme dựa trên số giây
    let activeTheme = THEME.SAFE;
    if (seconds <= 5) activeTheme = THEME.DANGER;
    else if (seconds <= 15) activeTheme = THEME.WARN;

    let totalW = 0;
    chars.forEach(c => { totalW += (c === ':' ? CW : DW) + GAP; });

    const logicalWidth = totalW - GAP + PAD * 2;
    const logicalHeight = DH + PAD * 2;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = logicalWidth + 'px';
    canvas.style.height = logicalHeight + 'px';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    let x = PAD;
    chars.forEach(c => {
        if (c === ':') {
            // Vẽ Colon (Dấu hai chấm) có Glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = activeTheme.glow;
            ctx.fillStyle = activeTheme.color;
            drawColon(ctx, x, PAD);
            x += CW + GAP;
        } else if (SEGMENTS[c]) {
            // Vẽ từng Digit với hiệu ứng high-tech
            drawDigitAdvanced(ctx, c, x, PAD, activeTheme);
            x += DW + GAP;
        }
    });
}

function drawDigitAdvanced(ctx, char, x, y, theme) {
    const segs = SEGMENTS[char];
    if (!segs) return;

    // Helper vẽ Segment với hiệu ứng tắt/bật
    const drawS = (on, type, xx, yy) => {
        ctx.beginPath();
        // Nếu ON thì bật Glow rực rỡ, nếu OFF thì vẽ mờ ảo phía sau
        ctx.shadowBlur = on ? 12 : 0;
        ctx.shadowColor = theme.glow;
        ctx.fillStyle = on ? theme.color : theme.bg;

        if (type === 'h') {
            ctx.moveTo(xx + S, yy + S * 0.5); 
            ctx.lineTo(xx + S * 1.5, yy);
            ctx.lineTo(xx + DW - S * 1.5, yy); 
            ctx.lineTo(xx + DW - S, yy + S * 0.5);
            ctx.lineTo(xx + DW - S * 1.5, yy + S); 
            ctx.lineTo(xx + S * 1.5, yy + S);
        } else {
            ctx.moveTo(xx + S * 0.5, yy + S); 
            ctx.lineTo(xx + S, yy + S * 1.5);
            ctx.lineTo(xx + S, yy + DH / 2 - S * 1.5); 
            ctx.lineTo(xx + S * 0.5, yy + DH / 2 - S);
            ctx.lineTo(xx, yy + DH / 2 - S * 1.5); 
            ctx.lineTo(xx, yy + S * 1.5);
        }
        ctx.closePath();
        ctx.fill();
    };

    // Vẽ đủ 7 thanh (thanh nào OFF vẫn vẽ bóng ma mờ phía sau)
    drawS(segs[0], 'h', x, y);                         // a
    drawS(segs[1], 'v', x + DW - S, y);                // b
    drawS(segs[2], 'v', x + DW - S, y + DH / 2);       // c
    drawS(segs[3], 'h', x, y + DH - S);                // d
    drawS(segs[4], 'v', x, y + DH / 2);                // e
    drawS(segs[5], 'v', x, y);                         // f
    drawS(segs[6], 'h', x, y + DH / 2 - S / 2);        // g
}

// function updateAllClocks() {
//     document.querySelectorAll('.clock-time-monospace').forEach(span => {
//         let timeText = span.innerText.trim();
//         if (!timeText) return;
//         timeText = timeText.replace(/\.\d+$/, '');
//         let canvas = span.nextElementSibling;
//         if (!canvas || !canvas.classList.contains('martin-led-canvas')) {
//             canvas = document.createElement('canvas');
//             canvas.className = 'martin-led-canvas';
//             canvas.style.cssText = `display: block; background: transparent;`;
//             span.after(canvas);
//         }
//         renderTime(canvas, timeText);
//     });
// }

function updateAllClocks() {
    if (!document.body.classList.contains('martin-digital-clock')) return;
    document.querySelectorAll('.clock-time-monospace').forEach(span => {
        let timeText = span.innerText.trim();
        if (!timeText) return;

        timeText = timeText.replace(/\.\d+$/, '');

        // Tính số giây theo format linh hoạt (h:m:s hoặc mm:ss hoặc ss)
        const seconds = timeText.includes(":")
            ? timeText.split(":").reduce((acc, t) => (60 * acc) + parseInt(t, 10), 0)
            : parseInt(timeText, 10);

        let canvas = span.nextElementSibling;
        if (!canvas || !canvas.classList.contains('martin-led-canvas')) {
            canvas = document.createElement('canvas');
            canvas.className = 'martin-led-canvas';
            canvas.style.cssText = `display: block; background: transparent;`;
            span.after(canvas);
        }
        
        // Truyền thêm seconds vào đây
        renderTime(canvas, timeText, seconds); 
    });
}

let digitalClockInterval = null;
function startDigitalClock() {
    if (digitalClockInterval) return;
    document.body.classList.add('martin-digital-clock');
    updateAllClocks();
    // FIX #4: Giảm từ 200ms → 500ms để nhẹ CPU hơn (clock chess.com update theo giây)
    digitalClockInterval = setInterval(updateAllClocks, 500);
}
function stopDigitalClock() {
    if (digitalClockInterval) { 
        clearInterval(digitalClockInterval); 
        digitalClockInterval = null; 
    }
    document.body.classList.remove('martin-digital-clock');
    
    // Xóa canvas trước
    document.querySelectorAll('.martin-led-canvas').forEach(c => c.remove());
    
    // Reset font-size về mặc định cho clock text
    document.querySelectorAll('.clock-time-monospace').forEach(el => {
        el.style.fontSize = '';
        el.style.lineHeight = '';
        el.style.color = '';
    });
}

// ===== FULLSCREEN BUTTON =====
const btn = document.createElement("button");
btn.innerText = "⛶";
btn.title = "Fullscreen";
btn.style.cssText = `position:fixed;top:15px;right:15px;z-index:9999;padding:8px 12px;font-size:16px;border-radius:6px;border:none;cursor:pointer;background-color:#2b2b2b;color:white;box-shadow:0 2px 6px rgba(0,0,0,0.3);`;
btn.onclick = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
};
document.body.appendChild(btn);

let currentSettings = {};
console.log("MartinChessVN loaded");

// ===== APPLY SETTINGS =====
function applySettings(settings) {
    document.body.classList.toggle("martin-larger-clock", !!settings.largerClock);
    toggleOpponentVisibility(settings.hideOpponent);
    document.body.classList.toggle("martin-clean", !!settings.cleanUI);
    document.body.classList.toggle("martin-hide-logo", !!(settings.cleanUI && settings.hideLogo));
    document.body.classList.toggle("martin-hide-ads", !!(settings.cleanUI && settings.hideAds));
    document.body.classList.toggle("martin-hide-notifications", !!(settings.cleanUI && settings.hideNotifications));
    settings.lowTimeAlert ? startLowTimeInterval() : stopLowTimeInterval();
    document.body.classList.toggle("martin-hide-game-messages", !!settings.hideGameMessages);
    settings.digitalClock ? startDigitalClock() : stopDigitalClock();

    // Legal Moves — dùng window bridge để giao tiếp với IIFE
    if (typeof window._martinSetLegalMoves === 'function') {
        window._martinSetLegalMoves(!!settings.legalMoves);
    }
}

// ===== HIDE OPPONENT =====
function toggleOpponentVisibility(hide) {
    document.body.classList.toggle("martin-hide-opponent", !!hide);

    // Chỉ tìm các avatar nằm trong khu vực của đối thủ (player-top)
    const opponentAvatars = document.querySelectorAll('#board-layout-player-top [data-cy="avatar"], .board-layout-player-top [data-cy="avatar"]');

    opponentAvatars.forEach(avatar => {
        const playerBlock = avatar.closest('[class*="player"]');
        if (!playerBlock) return;

        if (hide) {
            // Lưu lại ảnh gốc để có thể khôi phục sau này
            if (!avatar.dataset.originalSrc) {
                avatar.dataset.originalSrc = avatar.src;
                avatar.dataset.originalSrcset = avatar.srcset;
            }

            try {
                // Thay bằng ảnh happy-face.png từ thư mục extension
                avatar.src = chrome.runtime.getURL('assets/happy-face.png');
                avatar.srcset = "";
            } catch (e) { return; }

            // Ẩn tên và rating của đối thủ
            const userTagline = playerBlock.querySelector('[class*="user-tagline"]');
            if (userTagline) {
                userTagline.querySelectorAll('*').forEach(el => {
                    if (!el.dataset.originalVisibility) el.dataset.originalVisibility = el.style.visibility || 'visible';
                    el.style.visibility = 'hidden';
                });
            }

            playerBlock.querySelectorAll('[data-cy="country-flag"], .flag, [data-test-element="user-tagline-rating"]')
                .forEach(el => {
                    if (!el.dataset.originalDisplay) el.dataset.originalDisplay = el.style.display || 'block';
                    el.style.display = 'none';
                });
        } else {
            // Khôi phục lại như cũ khi tắt tính năng
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
        "hideNotifications", "lowTimeAlert", "hideGameMessages", "digitalClock", "legalMoves"],
    (data) => { currentSettings = data; applySettings(currentSettings); }
);

// ===== KEEP SETTINGS AFTER SPA NAVIGATION =====
let timeout;
const observer = new MutationObserver((mutations) => {
    const onlyBodyClassChange = mutations.every(m => m.type === "attributes" && m.target === document.body);
    if (onlyBodyClassChange) return;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        try { applySettings(currentSettings); }
        catch (e) { if (e.message?.includes('Extension context')) observer.disconnect(); }
    }, 100);
});
observer.observe(document.body, { childList: true, subtree: true, attributes: true });

// ===== STYLES =====
const cleanStyle = document.createElement("style");
cleanStyle.textContent = `
/* Larger Clock */
.martin-larger-clock .clock-time-monospace {
font-size: 28px !important;
font-weight: bold !important;
line-height: 1 !important;
}
.martin-larger-clock .clock-component {
padding: 4px 10px !important;
min-width: unset !important;
width: auto !important;
display: inline-flex !important;
align-items: center !important;
justify-content: center !important;
border-radius: 8px !important;
overflow: visible !important;
}
/* Khi cả 2 tính năng cùng bật — digital clock override larger clock */
.martin-digital-clock .clock-time-monospace {
font-size: 0 !important;
}

.martin-larger-clock .clock-icon-icon {
flex-shrink: 0 !important;
width: 16px !important;
height: 16px !important;
margin-right: 2px !important;
}

.martin-larger-clock .clock-time-monospace {
flex-shrink: 0 !important;
white-space: nowrap !important;
}

.martin-hide-logo .header-logo { display: none !important; }
.martin-hide-ads .advertisement,
.martin-hide-ads [class*="ad-"] { display: none !important; }
.martin-hide-notifications .notification-area,
.martin-hide-notifications [class*="notification"] { display: none !important; }
.martin-hide-game-messages .game-over-message-component,
.martin-hide-game-messages .game-rate-sport-message-component,
.martin-hide-game-messages .game-start-message-component,
.martin-hide-game-messages .chat-input-component,
.martin-hide-game-messages .chat-room-chat,
.martin-hide-game-messages .resizable-chat-area-component { display: none !important; }

.martin-digital-clock .clock-time-monospace {
font-size: 0 !important; line-height: 0 !important; color: transparent !important;
}
.martin-digital-clock .clock-icon-icon { display: none !important; }
.martin-digital-clock .clock-component {
display: inline-flex !important;
align-items: center !important;
justify-content: center !important;
padding: 4px 14px !important;
background: rgba(10, 10, 10, 0.85) !important; /* Nền đen sâu */
backdrop-filter: blur(6px) !important; /* Hiệu ứng kính mờ */
border: 1px solid rgba(255, 255, 255, 0.08) !important;
border-radius: 8px !important;
box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.4) !important;
overflow: visible !important;
transition: all 0.3s ease;
}
.martin-digital-clock .martin-led-canvas {
flex-shrink: 0;
display: block !important;
background: transparent !important;
}

/* ===== LEGAL MOVES PRO — Yellow & Red Design ===== */

.martin-move {
    will-change: transform, opacity;
    contain: strict;
}


#martin-overlay .martin-move {
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    transition: opacity 0.15s ease, transform 0.1s ease;
}

#martin-overlay.dragging .martin-move {
    opacity: 0.55;
    transform: scale(0.95);
}

#martin-overlay .martin-origin {
    position: fixed;
    pointer-events: none;
    background: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
    transition: opacity 0.15s ease;
}

/* ===== Move thường — chấm tròn vàng ===== */
#martin-overlay .martin-move.dot {
    border-radius: 50%;
    background: #D3B014;
    opacity: 0.85;
}

/* ===== Capture — viền đỏ + glow, không tô nền ===== */
#martin-overlay .martin-move.capture {
    border-radius: 0;
    background: transparent;
    border: 2px solid #ff2a2a;
    box-shadow: 0 0 12px rgba(255, 42, 42, 1);
}

/* Ẩn highlight gốc chess.com khi legal moves bật */
.martin-legal-active wc-chess-board .selected-squares,
.martin-legal-active wc-chess-board [class*="selected"],
.martin-legal-active wc-chess-board .legal-moves-overlay,
.martin-legal-active wc-chess-board [class*="legal-move"],
.martin-legal-active wc-chess-board [data-test-element="move-destination"],
.martin-legal-active wc-chess-board .piece-square-targets,
.martin-legal-active wc-chess-board [class*="hint"] {
display: none !important;
opacity: 0 !important;
visibility: hidden !important;
}
.martin-legal-active wc-chess-board .hover-square {
visibility: hidden !important;
display: none !important;
}



.martin-lichess-btn {
    transition: all 0.2s ease-in-out !important;
}

.martin-lichess-btn:hover {
    background-color: #36332e !important; /* Sáng lên một chút khi hover */
    color: #ffffff !important;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    transform: translateY(-1px);
}

.martin-lichess-btn:active {
    transform: translateY(0px);
}


`;
document.head.appendChild(cleanStyle);


// ===== LEGAL MOVES OVERLAY =====
(function () {

    function log(...args) { console.log('[MartinLegal]', ...args); }

    // ===== STATE =====
    let enabled = false;
    let selectedSq = null;

    // ===== WINDOW BRIDGE — applySettings() gọi từ ngoài IIFE =====
    window._martinSetLegalMoves = function (val) {
        enabled = !!val;
        log('legalMoves enabled:', enabled);
        document.body.classList.toggle('martin-legal-active', enabled);
        if (!enabled) clearOverlay();
    };

    // ===== ĐỌC FEN =====
    function getFen() {
        try {
            // Cách 1: Thử lấy từ URL (Chess.com đôi khi cập nhật FEN vào URL khi kết thúc)
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('fen')) return urlParams.get('fen');
    
            // Cách 2: Tự quét bàn cờ (DOM Scanner) - Cách này cực kỳ ổn định
            const board = Array(8).fill(null).map(() => Array(8).fill(null));
            const pieceMap = {
                'pawn': 'p', 'knight': 'n', 'bishop': 'b', 'rook': 'r', 'queen': 'q', 'king': 'k',
                'white': (s) => s.toUpperCase(),
                'black': (s) => s.toLowerCase()
            };
    
            // Tìm tất cả các quân cờ đang hiển thị
            const pieces = document.querySelectorAll('.piece');
            if (pieces.length === 0) return null;
    
            pieces.forEach(p => {
                const classes = p.className.split(' ');
                const typeClass = classes.find(c => c.length === 2 && !c.includes('-')); // ví dụ: 'wn', 'bp'
                const posClass = classes.find(c => c.startsWith('square-')); // ví dụ: 'square-52'
    
                if (typeClass && posClass) {
                    const color = typeClass[0] === 'w' ? 'white' : 'black';
                    const type = typeClass[1]; // p, n, b, r, q, k
                    const col = parseInt(posClass[7]) - 1;
                    const row = 8 - parseInt(posClass[8]);
                    
                    let pieceChar = type;
                    if (color === 'white') pieceChar = pieceChar.toUpperCase();
                    board[row][col] = pieceChar;
                }
            });
    
            // Chuyển mảng thành chuỗi FEN chuẩn
            let fenRows = [];
            for (let r = 0; r < 8; r++) {
                let empty = 0, rowStr = "";
                for (let c = 0; c < 8; c++) {
                    if (board[r][c] === null) {
                        empty++;
                    } else {
                        if (empty > 0) { rowStr += empty; empty = 0; }
                        rowStr += board[r][c];
                    }
                }
                if (empty > 0) rowStr += empty;
                fenRows.push(rowStr);
            }
    
            // Thêm các thông số phụ (giả định lượt đi và nhập thành để Lichess vẫn nhận diện được thế cờ)
            return fenRows.join('/') + " w KQkq - 0 1"; 
        } catch (e) {
            console.error("Lỗi khi quét FEN:", e);
            return null;
        }
    }

    // Expose global helper để chỗ khác (nút Lichess) có thể dùng lại
    window.martinGetFen = getFen;

    function buildFenFromDOM() {
        const MAP = {
            'wp': 'P', 'wn': 'N', 'wb': 'B', 'wr': 'R', 'wq': 'Q', 'wk': 'K',
            'bp': 'p', 'bn': 'n', 'bb': 'b', 'br': 'r', 'bq': 'q', 'bk': 'k'
        };
        const board = Array.from({ length: 8 }, () => Array(8).fill(null));
        document.querySelectorAll('.piece').forEach(el => {
            const cls = el.className;
            const sqM = cls.match(/square-(\d)(\d)/);
            const pcM = cls.match(/\b(wp|wn|wb|wr|wq|wk|bp|bn|bb|br|bq|bk)\b/);
            if (!sqM || !pcM) return;
            const fi = parseInt(sqM[1]) - 1;
            const ri = parseInt(sqM[2]) - 1;
            if (fi < 0 || fi > 7 || ri < 0 || ri > 7) return;
            board[ri][fi] = pcM[1];
        });
        let fen = '';
        for (let r = 7; r >= 0; r--) {
            let empty = 0;
            for (let f = 0; f < 8; f++) {
                const p = board[r][f];
                if (p) { if (empty) { fen += empty; empty = 0; } fen += MAP[p]; }
                else empty++;
            }
            if (empty) fen += empty;
            if (r > 0) fen += '/';
        }
        return fen + ' w - - 0 1';
    }

    function getPieceColorAt(sq) {
        const file = sq.charCodeAt(0) - 96;
        const rank = parseInt(sq[1]);
        const els = document.querySelectorAll(`.piece.square-${file}${rank}`);
        for (const el of els) {
            if (el.className.match(/\bw[pnbrqk]\b/)) return 'w';
            if (el.className.match(/\bb[pnbrqk]\b/)) return 'b';
        }
        return null;
    }

    function getFlipped() {
        return document.querySelector('wc-chess-board')?.classList.contains('flipped') ?? false;
    }

    // ===== OVERLAY =====
    let overlayEl = null;

    function ensureOverlay() {
        if (overlayEl?.isConnected) return overlayEl;
        overlayEl = document.createElement('div');
        overlayEl.id = 'martin-overlay';
        overlayEl.style.cssText = `position:fixed;pointer-events:none;z-index:99999;top:0;left:0;width:0;height:0;overflow:visible;`;
        document.body.appendChild(overlayEl);
        return overlayEl;
    }

    function clearOverlay() {
        if (overlayEl) overlayEl.innerHTML = '';
        selectedSq = null;
    }

    function getBoardRect() {
        const boardEl = document.querySelector('wc-chess-board');
        if (!boardEl) return null;
        const inner = boardEl.querySelector('.board');
        return (inner || boardEl).getBoundingClientRect();
    }

    function sqToPixel(sq, rect, flipped) {
        const f = sq.charCodeAt(0) - 97;
        const r = parseInt(sq[1]) - 1;
        const cell = rect.width / 8;
        const col = flipped ? 7 - f : f;
        const row = flipped ? r : 7 - r;
        return { x: rect.left + col * cell, y: rect.top + row * cell, cell };
    }

    function renderDots(moves, captureSet, flipped) {
        const ov = ensureOverlay();
        if (!ov) return;
        ov.innerHTML = '';

        const rect = getBoardRect();
        if (!rect || rect.width === 0) {
            log('ERROR: board rect zero');
            return;
        }

        // 🟨 Highlight ô xuất phát
        if (selectedSq) {
            const { x, y, cell } = sqToPixel(selectedSq, rect, flipped);
            const origin = document.createElement('div');
            origin.className = 'martin-origin';
            origin.style.left = `${x}px`;
            origin.style.top = `${y}px`;
            origin.style.width = `${cell}px`;
            origin.style.height = `${cell}px`;
            ov.appendChild(origin);
        }

        moves.forEach(sq => {
            const { x, y, cell } = sqToPixel(sq, rect, flipped);
            const isCap = captureSet.has(sq);
            const el = document.createElement('div');
            el.className = 'martin-move';

            if (isCap) {
                el.classList.add('capture');
                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
                el.style.width = `${cell}px`;
                el.style.height = `${cell}px`;
            } else {
                // 🟡 MOVE THƯỜNG
                const size = cell * 0.22;
                el.classList.add('dot');
                el.style.left = `${x + cell / 2 - size / 2}px`;
                el.style.top = `${y + cell / 2 - size / 2}px`;
                el.style.width = `${size}px`;
                el.style.height = `${size}px`;
            }

            ov.appendChild(el);
        });

        log('Rendered', moves.length, 'moves, captures:', captureSet.size);
    }

    // ===== SHOW MOVES =====
    function showMovesForSq(sq) {
        const fenRaw = getFen();
        if (!fenRaw) return;

        const pieceColor = getPieceColorAt(sq);
        if (!pieceColor) { clearOverlay(); return; }

        const parts = fenRaw.split(' ');
        parts[1] = pieceColor;
        const fen = parts.slice(0, 6).join(' ') || (parts[0] + ' ' + pieceColor + ' - - 0 1');

        let ch;
        try { ch = new Chess(fen); }
        catch (err) {
            try { ch = new Chess(parts[0] + ' ' + pieceColor + ' - - 0 1'); }
            catch (e2) { log('Chess error:', e2.message); return; }
        }

        const moves = ch.moves({ square: sq, verbose: true });
        log('Moves from', sq, ':', moves.map(m => m.to));
        if (!moves.length) { clearOverlay(); return; }

        selectedSq = sq;
        const caps = new Set(moves.filter(m => m.captured).map(m => m.to));
        renderDots(moves.map(m => m.to), caps, getFlipped());
    }

    // ===== HELPER: lấy square từ tọa độ pointer =====
    function sqFromPointer(e) {
        const boardEl = document.querySelector('wc-chess-board');
        if (!boardEl) return null;
        const inner = boardEl.querySelector('.board') || boardEl;
        const rect = inner.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top || e.clientY > rect.bottom) return null;
        const cell = rect.width / 8;
        const fi = Math.floor((e.clientX - rect.left) / cell);
        const ri = Math.floor((e.clientY - rect.top) / cell);
        const flipped = getFlipped();
        const file = flipped ? 7 - fi : fi;
        const rank = flipped ? ri + 1 : 8 - ri;
        if (file < 0 || file > 7 || rank < 1 || rank > 8) return null;
        return String.fromCharCode(97 + file) + rank;
    }

    // ===== CLICK + DRAG HANDLER =====
    let pointerDownSq = null;
    let pointerMoved = false;

    function initPointerEvents(board) {

        board.addEventListener('pointerdown', (e) => {
            if (!enabled) return;
            pointerMoved = false;

            const piece = e.target.closest('.piece');
            if (!piece) {
                clearOverlay();
                pointerDownSq = null;
                return;
            }

            const sq = sqFromPointer(e);
            if (!sq) return;
            pointerDownSq = sq;

            if (selectedSq === sq) {
                // Click lại đúng quân → toggle off
                clearOverlay();
                pointerDownSq = null;
                return;
            }

            // Hiện dots ngay (cả click lẫn drag)
            if (overlayEl) overlayEl.classList.remove('dragging');
            showMovesForSq(sq);
        });

        board.addEventListener('pointermove', (e) => {
            if (e.buttons > 0 && pointerDownSq) {
                pointerMoved = true;
                if (overlayEl) overlayEl.classList.add('dragging');
            }
        });

        board.addEventListener('pointerup', () => {
            if (overlayEl) overlayEl.classList.remove('dragging');
            if (!pointerDownSq) return;

            if (pointerMoved) {
                // Drag xong → clear (FEN observer cũng sẽ catch)
                clearOverlay();
            }
            // Click thuần → giữ dots, FEN observer lo phần clear
            pointerDownSq = null;
            pointerMoved = false;
        });

        board.addEventListener('pointercancel', () => {
            if (overlayEl) overlayEl.classList.remove('dragging');
            clearOverlay();
            pointerDownSq = null;
            pointerMoved = false;
        });
    }

    // Chỉ clear khi FEN thực sự thay đổi (nước đi hoàn tất)
    let lastFen = null;
    const moveObs = new MutationObserver(() => {
        const currentFen = getFen();
        if (!currentFen) return;
        if (lastFen && currentFen !== lastFen) {
            clearOverlay();
        }
        lastFen = currentFen;
    });

    function init() {
        if (typeof Chess === 'undefined') {
            log('ERROR: Chess not defined');
            return;
        }
        const board = document.querySelector('wc-chess-board');
        if (!board) { setTimeout(init, 500); return; }

        initPointerEvents(board);
        // Chỉ observe FEN attribute, KHÔNG observe class (class đổi liên tục khi drag)
        moveObs.observe(board, {
            attributes: true,
            attributeFilter: ['fen', 'data-fen']
        });
        log('Legal moves READY ✓');
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

})();


// 1. Hàm tạo và chèn nút Lichess
function injectLichessButton() {
    const buttonContainer = document.querySelector('.game-over-modal-buttons');
    
    if (buttonContainer && !document.querySelector('.martin-lichess-btn')) {
        const btn = document.createElement('button');
        btn.className = 'cc-button-component cc-button-secondary cc-button-xx-large cc-bg-secondary martin-lichess-btn';
        
        btn.style.cssText = `
            margin-top: 10px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            background-color: #262421 !important;
            color: #bababa !important;
            border: 1px solid #403d39 !important;
            font-weight: bold;
            cursor: pointer;
        `;
        
        btn.innerHTML = `<span>🧬 Phân tích trên Lichess (Full)</span>`;

        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
        
            const pgnData = getPGN();
            
            if (pgnData) {
                // 1. Lưu vào Clipboard để bạn có thể Ctrl+V nếu URL bị lỗi
                await navigator.clipboard.writeText(pgnData);
                
                // 2. Thử mở qua URL (Dùng định dạng tối giản)
                const encodedPGN = encodeURIComponent(pgnData);
                const url = `https://lichess.org/analysis/pgn/${encodedPGN}`;
                
                window.open(url, '_blank');
        
                // Hiện một thông báo nhỏ trên nút để biết đã xử lý
                const originalText = btn.innerHTML;
                btn.innerHTML = "✅ Đã Copy PGN & Đang mở...";
                setTimeout(() => btn.innerHTML = originalText, 2000);
            } else {
                alert("Không tìm thấy danh sách nước đi! Hãy chắc chắn bảng Move List đang hiển thị.");
            }
        }, true);

        buttonContainer.appendChild(btn);
    }
}

function getPGN() {
    try {
        // 1. Lấy tên người chơi
        const whiteName = document.querySelector('.player-tagline-white .user-tagline-username, [data-cy="white-player-name"]')?.innerText || "White";
        const blackName = document.querySelector('.player-tagline-black .user-tagline-username, [data-cy="black-player-name"]')?.innerText || "Black";
        
        // 2. Tìm tất cả các node chứa nước đi (thử mọi selector có thể)
        const moveNodes = document.querySelectorAll('.vertical-move-list .node, .move-node, [data-whole-move-number] .node');
        
        if (moveNodes.length === 0) return null;

        let movesArray = [];
        moveNodes.forEach((node) => {
            let txt = node.innerText.trim();
            // CHỈ LẤY: Các ký tự như e4, Nf3, O-O, d5... 
            // LOẠI BỎ: Số thứ tự (1., 2.), thời gian (0:15), icon (!!, ?)
            if (txt && 
                !txt.includes(':') && 
                !txt.includes('.') && 
                txt.length >= 2 && 
                txt.length <= 7) {
                // Làm sạch nước đi (chỉ lấy mã nước đi đầu tiên nếu bị dính chữ)
                movesArray.push(txt.split(/\s+/)[0]);
            }
        });

        // 3. Loại bỏ nước đi trùng lặp nếu Chess.com render thừa (thường xảy ra ở ván kết thúc)
        // Chess.com đôi khi render 2 lần nước đi cuối, ta cần lọc lại.
        let uniqueMoves = [];
        for(let i = 0; i < movesArray.length; i++) {
            if (movesArray[i] !== movesArray[i-1]) {
                uniqueMoves.push(movesArray[i]);
            }
        }

        if (uniqueMoves.length === 0) return null;

        // 4. Dựng PGN chuẩn
        let pgnMoves = "";
        for (let i = 0; i < uniqueMoves.length; i++) {
            if (i % 2 === 0) {
                pgnMoves += `${(i / 2) + 1}. ${uniqueMoves[i]} `;
            } else {
                pgnMoves += `${uniqueMoves[i]} `;
            }
        }

        return `[Event "Live Chess"]\n[White "${whiteName}"]\n[Black "${blackName}"]\n[Result "*"]\n\n${pgnMoves.trim()}`;
    } catch (e) {
        console.error("Lỗi quét PGN:", e);
        return null;
    }
}

// 2. Tích hợp vào Observer có sẵn của bạn
// Giả sử bạn đang có một observer theo dõi bàn cờ, hãy thêm dòng này vào:
const gameObserver = new MutationObserver((mutations) => {
    // Các logic cũ (cập nhật đồng hồ LED, vv...)
    updateAllClocks();
    
    // Tự động kiểm tra để chèn nút Lichess
    injectLichessButton();
});

gameObserver.observe(document.body, { childList: true, subtree: true });