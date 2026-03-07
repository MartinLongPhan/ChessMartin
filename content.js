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
    isHudEnabled = !!settings.opponentStats;
    if (!isHudEnabled) {
        removeStatsBoard();
        lastOpponentUsername = null;
    } else {
        injectStatsBoard(); // thử inject ngay nếu đang trong ván
    }

    if (typeof window._martinSetTacticalMap === 'function') {
        window._martinSetTacticalMap(!!settings.tacticalMap);
    }
    if (typeof window._martinSetMirrorBoard === 'function') {
        window._martinSetMirrorBoard(!!settings.mirrorBoard);
    }
    if (typeof window._martinSetSafeDrop === 'function') {
        window._martinSetSafeDrop(!!settings.safeDrop);
    }

    applyTheme(settings.boardTheme || "default", settings.pieceSet || "default");

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
        "hideNotifications", "lowTimeAlert", "hideGameMessages", "digitalClock", "legalMoves", "opponentStats","boardTheme", "pieceSet","tacticalMap","mirrorBoard","safeDrop"],
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
            if (e.button !== 0) return;
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
        const whiteName = document.querySelector(
            '[data-cy="white-player-tagline"] .user-tagline-username, ' +
            '.player-tagline-white .user-tagline-username'
        )?.innerText?.trim() || "White";

        const blackName = document.querySelector(
            '[data-cy="black-player-tagline"] .user-tagline-username, ' +
            '.player-tagline-black .user-tagline-username'
        )?.innerText?.trim() || "Black";

        // Lấy tất cả node nước đi theo thứ tự
        const nodes = document.querySelectorAll('.main-line-ply');
        if (!nodes.length) {
            console.error('[MartinPGN] Không tìm thấy .main-line-ply');
            return null;
        }

        const moves = [];
        nodes.forEach(node => {
            const span = node.querySelector('.node-highlight-content');
            if (!span) return;

            // Lấy chữ cái quân cờ từ data-figurine (N, B, R, Q, K)
            const figurine = span.querySelector('[data-figurine]')?.dataset?.figurine || '';

            // Lấy text thuần — bỏ qua icon, chỉ lấy text node
            let moveText = '';
            span.childNodes.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    moveText += child.textContent;
                }
            });
            moveText = moveText.trim(); // ví dụ: "f6", "xc5", "d4"

            if (!moveText) return;

            // Ghép lại: "N" + "f6" = "Nf6", "" + "d4" = "d4"
            const fullMove = figurine + moveText;
            console.log('[MartinPGN] node:', node.dataset.node, '→', fullMove);
            moves.push(fullMove);
        });

        if (!moves.length) return null;

        // Dựng PGN
        let pgnBody = '';
        moves.forEach((m, i) => {
            if (i % 2 === 0) pgnBody += `${Math.floor(i / 2) + 1}. ${m} `;
            else pgnBody += `${m} `;
        });

        const pgn = `[Event "Live Chess"]\n[White "${whiteName}"]\n[Black "${blackName}"]\n[Result "*"]\n\n${pgnBody.trim()}`;
        console.log('[MartinPGN] PGN:\n', pgn);
        return pgn;

    } catch (e) {
        console.error('[MartinPGN] Lỗi:', e);
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


// ===== OPPONENT STATS HUD =====
let isHudEnabled = false;
let lastOpponentUsername = null;

let hudMinimized = false;

function getBoardLeftEdge() {
    const boardEl = document.querySelector('wc-chess-board .board, wc-chess-board');
    if (!boardEl) return 12;
    const rect = boardEl.getBoundingClientRect();
    const left = rect.left - 226; // 210px HUD + 16px gap
    return Math.max(left, 8);
}

function updateHudPosition() {
    const el = document.getElementById('martin-stats-board');
    if (el) el.style.left = getBoardLeftEdge() + 'px';
}




function isMyGame() {
    return !!document.querySelector('.clock-bottom');
}

chrome.storage.sync.get(['opponentStats'], (data) => {
    isHudEnabled = data.opponentStats || false;
});

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "updateSettings") {
        isHudEnabled = !!request.opponentStats;
        if (!isHudEnabled) {
            removeStatsBoard();
            lastOpponentUsername = null;
        }
    }
});

function removeStatsBoard() {
    document.getElementById('martin-stats-board')?.remove();
}

function getOpponentUsername() {
    const el = document.querySelector(
        '.board-layout-top .cc-user-username-component, ' +
        '.player-top .cc-user-username-component, ' +
        '.board-layout-top .user-tagline-username'
    );
    return el?.innerText?.trim() || null;
}
async function fetchChessComStats(username) {
    return new Promise((resolve) => {
        try {
            chrome.runtime.sendMessage(
                { action: 'fetchStats', username },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.warn('[MartinHUD] Lỗi:', chrome.runtime.lastError.message);
                        resolve(null);
                    } else {
                        resolve(response);
                    }
                }
            );
        } catch (e) {
            // Extension context invalidated — reload trang để fix
            console.warn('[MartinHUD] Extension context lỗi, cần reload trang');
            resolve(null);
        }
    });
}
function formatWDL(cat) {
    if (!cat?.record) return '—';
    const { win = 0, draw = 0, loss = 0 } = cat.record;
    const total = win + draw + loss;
    const pct = total > 0 ? Math.round(win / total * 100) : 0;
    return `${win}W ${draw}D ${loss}L <span style="color:#aaa;font-size:10px">(${pct}%)</span>`;
}


function renderStatsBoard(username, data) {
    removeStatsBoard();

    const stats   = data?.stats;
    const profile = data?.profile;

    const bullet = stats?.chess_bullet;
    const blitz  = stats?.chess_blitz;
    const rapid  = stats?.chess_rapid;

    const country = profile?.country ? profile.country.split('/').pop() : null;
    const joinDate = profile?.joined
        ? new Date(profile.joined * 1000).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short' })
        : null;

    const rows = [
        { label: '⚡ Bullet', rating: bullet?.last?.rating, wdl: formatWDL(bullet) },
        { label: '🔥 Blitz',  rating: blitz?.last?.rating,  wdl: formatWDL(blitz)  },
        { label: '🕐 Rapid',  rating: rapid?.last?.rating,  wdl: formatWDL(rapid)  },
    ];

    // Giữ lại vị trí đã kéo nếu có
    if (!window._martinHudPos) {
        window._martinHudPos = { left: 8, top: window.innerHeight / 2 - 14 };
    }

    const wrapper = document.createElement('div');
    wrapper.id = 'martin-stats-board';
    wrapper.style.cssText = `
        position: fixed;
        top: ${window._martinHudPos.top}px;
        left: ${window._martinHudPos.left}px;
        z-index: 99999;
        font-family: 'Segoe UI', sans-serif;
        font-size: 12px;
    `;

    wrapper.innerHTML = `
        <div id="martin-hud-icon" style="
            width: 28px; height: 28px;
            background: rgba(12,12,14,0.88);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            cursor: grab;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            transition: background 0.2s, border-color 0.2s;
            user-select: none;
        ">👤</div>

        <div id="martin-hud-panel" style="
            display: none;
            position: absolute;
            left: 36px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(12,12,14,0.95);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.09);
            border-radius: 10px;
            padding: 10px 14px;
            min-width: 220px;
            color: #e0e0e0;
            box-shadow: 0 8px 32px rgba(0,0,0,0.6);
            white-space: nowrap;
            pointer-events: none;
        ">
            <div style="font-size:11px;color:#888;margin-bottom:2px">
                👤 <b style="color:#ccc">${username}</b>
                ${country ? `<span style="color:#555;margin-left:6px">🌍 ${country}</span>` : ''}
                ${joinDate ? `<span style="color:#555;margin-left:4px">📅 ${joinDate}</span>` : ''}
            </div>
            <table style="width:100%;border-collapse:collapse;margin-top:6px">
                <tr style="color:#555;font-size:10px;text-transform:uppercase">
                    <td style="padding:2px 4px">Mode</td>
                    <td style="padding:2px 4px;text-align:right">Rating</td>
                    <td style="padding:2px 8px;text-align:right">W / D / L</td>
                </tr>
                ${rows.map(r => `
                <tr style="border-top:1px solid rgba(255,255,255,0.05)">
                    <td style="padding:4px 4px;color:#bbb">${r.label}</td>
                    <td style="padding:4px 4px;text-align:right;font-weight:bold;color:#fff">
                        ${r.rating ?? '—'}
                    </td>
                    <td style="padding:4px 8px;text-align:right;white-space:nowrap">
                        ${r.wdl}
                    </td>
                </tr>`).join('')}
            </table>
        </div>
    `;

    document.body.appendChild(wrapper);

    const icon  = document.getElementById('martin-hud-icon');
    const panel = document.getElementById('martin-hud-panel');

    // ===== DRAG =====
    let dragging = false;
    let dragOffsetX = 0, dragOffsetY = 0;

    icon.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        dragging = true;
        dragOffsetX = e.clientX - wrapper.getBoundingClientRect().left;
        dragOffsetY = e.clientY - wrapper.getBoundingClientRect().top;
        icon.style.cursor = 'grabbing';
        icon.setPointerCapture(e.pointerId);
        panel.style.display = 'none'; // ẩn panel khi đang kéo
        e.preventDefault();
    });

    icon.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const newLeft = Math.max(0, Math.min(window.innerWidth  - 36, e.clientX - dragOffsetX));
        const newTop  = Math.max(0, Math.min(window.innerHeight - 36, e.clientY - dragOffsetY));
        wrapper.style.left = newLeft + 'px';
        wrapper.style.top  = newTop  + 'px';
        window._martinHudPos = { left: newLeft, top: newTop };
    });

    icon.addEventListener('pointerup', (e) => {
        if (!dragging) return;
        dragging = false;
        icon.style.cursor = 'grab';

        // Tự điều chỉnh hướng bung panel (trái/phải) tùy vị trí
        const left = wrapper.getBoundingClientRect().left;
        if (left > window.innerWidth / 2) {
            panel.style.left  = 'auto';
            panel.style.right = '36px';
        } else {
            panel.style.left  = '36px';
            panel.style.right = 'auto';
        }
    });

    // ===== HOVER =====
    icon.addEventListener('mouseenter', () => {
        if (dragging) return;
        panel.style.pointerEvents = 'auto';
        panel.style.display = 'block';
        icon.style.background   = 'rgba(57,255,20,0.15)';
        icon.style.borderColor  = 'rgba(57,255,20,0.4)';
    });

    wrapper.addEventListener('mouseleave', () => {
        if (dragging) return;
        panel.style.display = 'none';
        icon.style.background  = 'rgba(12,12,14,0.88)';
        icon.style.borderColor = 'rgba(255,255,255,0.12)';
    });
}
// Cập nhật vị trí HUD khi resize window
window.addEventListener('resize', updateHudPosition);

async function injectStatsBoard() {
    if (!isHudEnabled) return;
    if (!isMyGame()) return; 
    if (document.getElementById('martin-stats-board')) return;

    const username = getOpponentUsername();
    if (!username) return;
    if (username === lastOpponentUsername) return;

    lastOpponentUsername = username;

    // Placeholder loading
    const loading = document.createElement('div');
    loading.id = 'martin-stats-board';
    loading.style.cssText = `
        position:fixed;top:60px;left:12px;z-index:99999;
        background:rgba(12,12,14,0.88);border:1px solid rgba(255,255,255,0.08);
        border-radius:10px;padding:10px 16px;color:#888;font-size:12px;
        font-family:'Segoe UI',sans-serif;
    `;
    loading.innerText = '⏳ Loading stats...';
    document.body.appendChild(loading);

    const data = await fetchChessComStats(username);
    renderStatsBoard(username, data);
}

// Theo dõi khi đối thủ thay đổi (ván mới)
let hudCheckInterval = setInterval(() => {
    if (!isHudEnabled) return;
    if (!isMyGame()) {         // ← thêm block này
        removeStatsBoard();
        lastOpponentUsername = null;
        return;
    }
    const username = getOpponentUsername();
    if (!username) return;

    if (username !== lastOpponentUsername) {
        lastOpponentUsername = null; // reset để trigger fetch mới
        removeStatsBoard();
        injectStatsBoard();
    }
}, 2000);


// ===== APPLY THEME =====
function applyTheme(boardValue, pieceValue) {
    let styleEl = document.getElementById('martin-theme-overrides');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'martin-theme-overrides';
        document.head.appendChild(styleEl);
    }

    let css = "";

    if (boardValue === "wood_premium") {
        css += `
            wc-chess-board {
                background-image: url("https://i.imgur.com/Io7cpFa.jpg") !important;
                background-size: cover !important;
                background-position: center !important;
            }
            wc-chess-board svg.coordinates {
                opacity: 0.6 !important;
            }
        `;
    } else if (boardValue === "dark_neon") {
        css += `
            wc-chess-board {
                background: repeating-conic-gradient(
                    #0d1117 0% 25%, 
                    #1e2a3a 0% 50%
                ) 0 0 / 12.5% 12.5% !important;
            }
            wc-chess-board svg.coordinates {
                opacity: 0.5 !important;
            }
        `;
    }

    if (pieceValue === "shadow") {
        css += `
            wc-chess-board .piece {
                filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.7)) !important;
            }
        `;
    } else if (pieceValue === "neo_custom") {
        css += `
            .piece.wp, .promotion-piece.wp { background-image: url("https://i.imgur.com/DjCKKYN.png") !important; }
            .piece.wn, .promotion-piece.wn { background-image: url("https://i.imgur.com/RNsTmEW.png") !important; }
            .piece.wb, .promotion-piece.wb { background-image: url("https://i.imgur.com/fRplOUQ.png") !important; }
            .piece.wr, .promotion-piece.wr { background-image: url("https://i.imgur.com/slzILd1.png") !important; }
            .piece.wq, .promotion-piece.wq { background-image: url("https://i.imgur.com/wTj4X48.png") !important; }
            .piece.wk, .promotion-piece.wk { background-image: url("https://i.imgur.com/0FdRIHg.png") !important; }
            .piece.bp, .promotion-piece.bp { background-image: url("https://i.imgur.com/7bZESur.png") !important; }
            .piece.bn, .promotion-piece.bn { background-image: url("https://i.imgur.com/wWR8jGH.png") !important; }
            .piece.bb, .promotion-piece.bb { background-image: url("https://i.imgur.com/pwsxxEq.png") !important; }
            .piece.br, .promotion-piece.br { background-image: url("https://i.imgur.com/GrmgNSd.png") !important; }
            .piece.bq, .promotion-piece.bq { background-image: url("https://i.imgur.com/pc1nijw.png") !important; }
            .piece.bk, .promotion-piece.bk { background-image: url("https://i.imgur.com/WEUrraI.png") !important; }
        `;
    }

    styleEl.innerHTML = css;
}


// ===== TACTICAL MAP — Move Consequence Highlight =====
(function () {
    let enabled = false;
    let overlayEl = null;

    // Expose để applySettings() gọi từ ngoài
    window._martinSetTacticalMap = function (val) {
        enabled = !!val;
        document.body.classList.toggle('martin-tactical-active', enabled);
        if (!enabled) clearTacticalOverlay();
    };

    // ===== STYLE =====
    const style = document.createElement('style');
    style.textContent = `
        /* Container chính */
#martin-tactical-overlay {
    position: fixed;
    pointer-events: none;
    z-index: 9998;
    top: 0; left: 0;
    width: 0; height: 0;
}

/* Base của ô vuông */
.martin-tactical-sq {
    position: fixed;
    pointer-events: none;
    background: transparent !important; /* Tuyệt đối không có màu nền */
    border: none !important;            /* Không dùng border để tránh chiếm diện tích */
    box-sizing: border-box;
}

/* Đỏ: Khung mục tiêu có thể ăn được */
.martin-tactical-sq.attack {
    /* Dùng outline để tạo khung mà không phủ lên ô cờ */
    outline: 3px solid #dc2626 !important;
    outline-offset: -3px; /* Đẩy khung vào sát bên trong mép ô cờ */
}

/* Xanh: Khung bảo vệ quân mình */
.martin-tactical-sq.defend {
    outline: 3px solid #2563eb !important;
    outline-offset: -3px;
}

/* HỒNG: Cảnh báo quân vừa đi đang bị đối thủ nhắm ăn */
.martin-tactical-sq.under-attack {
    /* Màu hồng đậm (Deep Pink) cực kỳ gắt để báo động */
    outline: 4px solid #ff1493 !important; 
    outline-offset: -4px;
    /* Chớp tắt liên tục để fen không thể ngó lơ */
    animation: martin-tactical-blink 0.6s steps(2) infinite;
}

/* Nhấp nháy kiểu đèn hiệu (chỉ hiện/ẩn cái khung) */
@keyframes martin-tactical-blink {
    0% { visibility: visible; }
    100% { visibility: hidden; }
}
    `;
    document.head.appendChild(style);

    // ===== OVERLAY =====
    function ensureTacticalOverlay() {
        if (overlayEl?.isConnected) return overlayEl;
        overlayEl = document.createElement('div');
        overlayEl.id = 'martin-tactical-overlay';
        document.body.appendChild(overlayEl);
        return overlayEl;
    }

    function clearTacticalOverlay() {
        if (overlayEl) overlayEl.innerHTML = '';
    }

    // ===== BOARD HELPERS (tái sử dụng từ Legal Moves module) =====
    function getBoardRect() {
        const boardEl = document.querySelector('wc-chess-board');
        if (!boardEl) return null;
        const inner = boardEl.querySelector('.board');
        return (inner || boardEl).getBoundingClientRect();
    }

    function getFlipped() {
        return document.querySelector('wc-chess-board')?.classList.contains('flipped') ?? false;
    }

    function sqToPixel(sq, rect, flipped) {
        const f = sq.charCodeAt(0) - 97;
        const r = parseInt(sq[1]) - 1;
        const cell = rect.width / 8;
        const col = flipped ? 7 - f : f;
        const row = flipped ? r : 7 - r;
        return { x: rect.left + col * cell, y: rect.top + row * cell, cell };
    }

    function drawTacticalSquare(ov, sq, type, rect, flipped) {
        const { x, y, cell } = sqToPixel(sq, rect, flipped);
        const el = document.createElement('div');
        el.className = `martin-tactical-sq ${type}`;
        el.style.left   = `${x}px`;
        el.style.top    = `${y}px`;
        el.style.width  = `${cell}px`;
        el.style.height = `${cell}px`;
        ov.appendChild(el);
    }

    // ===== CORE LOGIC =====
    function buildFen() {
        // Tái sử dụng hàm getFen() từ Legal Moves module
        if (typeof window.martinGetFen === 'function') return window.martinGetFen();
        return null;
    }

    function getLastMovedSquare() {
        // Chess.com highlight ô vừa di chuyển bằng class "highlight"
        const highlights = document.querySelectorAll('wc-chess-board .highlight');
        // Thường có 2 highlight: ô xuất phát và ô đến — lấy ô đến (last child / by order)
        if (!highlights.length) return null;
        
        // Thử đọc từ last-move attribute của board
        const board = document.querySelector('wc-chess-board');
        if (board) {
            // Một số version chess.com có data-last-move="e2e4"
            const attr = board.getAttribute('data-last-move') || board.getAttribute('last-move');
            if (attr && attr.length >= 4) {
                return attr.slice(2, 4); // ô đến
            }
        }

        // Fallback: parse từ class square-XX của highlight
        for (const h of highlights) {
            const cls = h.className || '';
            const m = cls.match(/square-(\d)(\d)/);
            if (m) {
                const file = String.fromCharCode(96 + parseInt(m[1]));
                const rank = m[2];
                return file + rank;
            }
        }
        return null;
    }

    function getMyColor() {
        // Đọc màu người chơi từ DOM
        const myClockSide = document.querySelector('.clock-bottom');
        if (!myClockSide) return 'w';
        const board = document.querySelector('wc-chess-board');
        const flipped = board?.classList.contains('flipped');
        return flipped ? 'b' : 'w';
    }

    function analyzeTactical() {
        if (!enabled) return;

        const fenRaw = buildFen();
        if (!fenRaw) return;

        const rect = getBoardRect();
        if (!rect || rect.width === 0) return;

        const flipped = getFlipped();
        const myColor = getMyColor();
        const oppColor = myColor === 'w' ? 'b' : 'w';

        let ch;
        try {
            ch = new Chess(fenRaw);
        } catch (e) {
            try { ch = new Chess(fenRaw.split(' ')[0] + ' w - - 0 1'); }
            catch (e2) { return; }
        }

        const lastSq = getLastMovedSquare();

        // ===== 1. Tính tất cả nước đi của quân mình (để biết mình tấn công / bảo vệ gì) =====
        // Chuyển lượt sang màu mình để query
        const fenParts = fenRaw.split(' ');
        fenParts[1] = myColor;
        let myChess;
        try { myChess = new Chess(fenParts.join(' ')); }
        catch (e) { return; }

        const myMoves = myChess.moves({ verbose: true });

        // Ô bị tấn công (quân đối thủ nằm ở đó)
        const attackSquares = new Set();
        // Ô được bảo vệ (quân mình nằm ở đó, mình có thể "đi đến" bằng capture)
        const defendSquares = new Set();

        myMoves.forEach(m => {
            if (m.captured) {
                // Ô có quân đối thủ → đang bị tấn công
                attackSquares.add(m.to);
            } else {
                // Kiểm tra nếu ô đó đang có quân mình (bảo vệ = mình kiểm soát ô đó)
                const pieceAtTo = ch.get(m.to);
                if (pieceAtTo && pieceAtTo.color === myColor) {
                    defendSquares.add(m.to);
                }
            }
        });

        // ===== 2. Tính quân vừa đi có đang bị tấn công không =====
        const underAttackSquares = new Set();
        if (lastSq) {
            fenParts[1] = oppColor;
            let oppChess;
            try { oppChess = new Chess(fenParts.join(' ')); }
            catch (e) { oppChess = null; }

            if (oppChess) {
                const oppMoves = oppChess.moves({ verbose: true });
                oppMoves.forEach(m => {
                    if (m.to === lastSq && m.captured) {
                        underAttackSquares.add(lastSq);
                    }
                });
            }
        }

        // ===== 3. Render =====
        const ov = ensureTacticalOverlay();
        clearTacticalOverlay();

        // Thứ tự render: defend → attack → under-attack (under-attack vẽ sau cùng để lên trên)
        defendSquares.forEach(sq => {
            if (!underAttackSquares.has(sq)) // không override under-attack
                drawTacticalSquare(ov, sq, 'defend', rect, flipped);
        });
        attackSquares.forEach(sq => drawTacticalSquare(ov, sq, 'attack', rect, flipped));
        underAttackSquares.forEach(sq => drawTacticalSquare(ov, sq, 'under-attack', rect, flipped));
    }

    // ===== OBSERVER: chạy lại mỗi khi có nước đi mới =====
    let lastFenTactical = null;
    const tacticalObs = new MutationObserver(() => {
        if (!enabled) return;
        const fen = buildFen();
        if (!fen || fen === lastFenTactical) return;
        lastFenTactical = fen;
        // Delay nhỏ để chess.com update DOM xong
        setTimeout(analyzeTactical, 150);
    });

    function initTactical() {
        const board = document.querySelector('wc-chess-board');
        if (!board) { setTimeout(initTactical, 600); return; }
        tacticalObs.observe(board, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['class', 'fen', 'data-fen', 'data-last-move']
        });
        console.log('[MartinTactical] Tactical Map READY ✓');
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTactical);
    else initTactical();

    // Cập nhật vị trí khi resize (board thay đổi kích thước)
    window.addEventListener('resize', () => {
        if (enabled) analyzeTactical();
    });

})();

// ===== MIRRORBOARD — Inject vào vị trí Move List =====
(function () {

    let enabled = false;
    let lastRenderedFen = null;
    let injected = false;

    window._martinSetMirrorBoard = function (val) {
        enabled = !!val;
        if (enabled) injectMirrorBoard();
        else removeMirrorBoard();
    };

    // ===== STYLE =====
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@500;700&display=swap');

        /* Ẩn move list khi mirror board bật */
        .martin-mirror-active .move-list-component,
        .martin-mirror-active [class*="move-list"],
        .martin-mirror-active .main-line-row {
            display: none !important;
        }

        #martin-mirror-inject {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: rgba(8, 8, 10, 0.97);
            font-family: 'Rajdhani', sans-serif;
            user-select: none;
            overflow: hidden;
        }

        /* Header */
        #mmb-inject-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 10px 5px;
            background: rgba(57,255,20,0.04);
            border-bottom: 1px solid rgba(57,255,20,0.08);
            flex-shrink: 0;
        }
        #mmb-inject-title {
            font-weight: 700;
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: rgba(57,255,20,0.8);
            display: flex;
            align-items: center;
            gap: 6px;
        }
        #mmb-inject-pulse {
            width: 5px; height: 5px;
            border-radius: 50%;
            background: rgba(57,255,20,0.9);
            box-shadow: 0 0 5px rgba(57,255,20,0.8);
            animation: mmb-blink 1.5s ease-in-out infinite;
        }
        #mmb-inject-pulse.stale {
            background: #444; box-shadow: none; animation: none;
        }
        @keyframes mmb-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        #mmb-inject-badge {
            font-size: 9px;
            letter-spacing: 1px;
            color: rgba(255,255,255,0.2);
            padding: 1px 5px;
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 3px;
        }

        /* Canvas area — chiếm hết phần còn lại */
        #mmb-inject-canvas-wrap {
            position: relative;
            flex: 1;
            min-height: 0;
            overflow: hidden;
        }
        #mmb-inject-canvas {
            display: block;
            image-rendering: pixelated;
        }

        /* Scanline CRT */
        #mmb-inject-canvas-wrap::after {
            content: '';
            position: absolute;
            inset: 0;
            background: repeating-linear-gradient(
                0deg,
                transparent, transparent 2px,
                rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px
            );
            pointer-events: none;
        }

        /* Legend */
        #mmb-inject-legend {
            display: flex;
            gap: 10px;
            padding: 5px 10px 6px;
            border-top: 1px solid rgba(255,255,255,0.04);
            flex-shrink: 0;
            flex-wrap: wrap;
        }
        .mmb-inject-legend-item {
            display: flex; align-items: center; gap: 4px;
            font-size: 9px; color: #444; letter-spacing: 0.5px;
        }
        .mmb-inject-legend-dot {
            width: 7px; height: 7px; border-radius: 2px; flex-shrink: 0;
        }
        .mmb-inject-legend-dot.attack { background: rgba(220,38,38,0.8); box-shadow: 0 0 3px rgba(255,0,0,0.5); }
        .mmb-inject-legend-dot.defend { background: rgba(37,99,235,0.8);  box-shadow: 0 0 3px rgba(59,130,246,0.5); }
        .mmb-inject-legend-dot.danger { background: rgba(124,58,237,0.8); box-shadow: 0 0 3px rgba(139,92,246,0.5); }

        /* Status */
        #mmb-inject-status {
            padding: 2px 10px 5px;
            font-family: 'Share Tech Mono', monospace;
            font-size: 8px;
            color: rgba(57,255,20,0.25);
            letter-spacing: 1px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);

    // ===== PIECES =====
    const PIECE_UNICODE = {
        'K':'♔','Q':'♕','R':'♖','B':'♗','N':'♘','P':'♙',
        'k':'♚','q':'♛','r':'♜','b':'♝','n':'♞','p':'♟',
    };

    function parseFen(fen) {
        return fen.split(' ')[0].split('/').map(row => {
            const cells = [];
            for (const ch of row) {
                if (isNaN(ch)) cells.push(ch);
                else for (let i = 0; i < parseInt(ch); i++) cells.push(null);
            }
            return cells;
        });
    }

    function getTacticalData(fenRaw) {
        const result = { attack: new Set(), defend: new Set(), danger: new Set() };
        if (typeof Chess === 'undefined' || !fenRaw) return result;
        try {
            const parts = fenRaw.split(' ');
            const myColor  = getMyColor();
            const oppColor = myColor === 'w' ? 'b' : 'w';
            const baseChess = new Chess(fenRaw);

            parts[1] = myColor;
            new Chess(parts.slice(0,6).join(' ')).moves({ verbose: true }).forEach(m => {
                if (m.captured) result.attack.add(m.to);
                else { const p = baseChess.get(m.to); if (p?.color === myColor) result.defend.add(m.to); }
            });

            parts[1] = oppColor;
            new Chess(parts.slice(0,6).join(' ')).moves({ verbose: true }).forEach(m => {
                if (m.captured) { const p = baseChess.get(m.to); if (p?.color === myColor) result.danger.add(m.to); }
            });
        } catch(e) {}
        return result;
    }

    function getMyColor() {
        return document.querySelector('wc-chess-board')?.classList.contains('flipped') ? 'b' : 'w';
    }

    // ===== DRAW BOARD =====
    function drawBoard(canvas, fenRaw, w, h) {
        // Bàn cờ phải vuông — lấy cạnh nhỏ hơn
        const size = Math.min(w, h);
        const dpr  = window.devicePixelRatio || 1;
        canvas.width  = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width  = size + 'px';
        canvas.style.height = size + 'px';

        // Căn giữa trong vùng chứa
        canvas.style.position = 'absolute';
        canvas.style.left = Math.floor((w - size) / 2) + 'px';
        canvas.style.top  = Math.floor((h - size) / 2) + 'px';

        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const cell  = size / 8;
        const board = parseFen(fenRaw);

        let tactical = { attack: new Set(), defend: new Set(), danger: new Set() };
        try { tactical = getTacticalData(fenRaw); } catch(e) {}

        const mainFlipped = document.querySelector('wc-chess-board')?.classList.contains('flipped');
        const needRotate  = !mainFlipped;

        if (needRotate) {
            ctx.translate(size, size);
            ctx.rotate(Math.PI);
        }

        // Vẽ ô
        for (let ri = 0; ri < 8; ri++) {
            for (let fi = 0; fi < 8; fi++) {
                const isLight = (ri + fi) % 2 === 0;
                const sq = String.fromCharCode(97 + fi) + (8 - ri);

                let base;
                if (isLight) {
                    base = tactical.attack.has(sq) ? '#5c1a1a' :
                           tactical.danger.has(sq) ? '#3a1a5c' :
                           tactical.defend.has(sq) ? '#1a2f5c' : '#2c2c2c';
                } else {
                    base = tactical.attack.has(sq) ? '#3d0d0d' :
                           tactical.danger.has(sq) ? '#270d3d' :
                           tactical.defend.has(sq) ? '#0d1e3d' : '#1a1a1a';
                }
                ctx.fillStyle = base;
                ctx.fillRect(fi * cell, ri * cell, cell, cell);

                if (tactical.attack.has(sq)) {
                    ctx.strokeStyle = 'rgba(220,38,38,0.7)'; ctx.lineWidth = 1.5;
                    ctx.strokeRect(fi*cell+0.75, ri*cell+0.75, cell-1.5, cell-1.5);
                } else if (tactical.danger.has(sq)) {
                    ctx.strokeStyle = 'rgba(167,139,250,0.8)'; ctx.lineWidth = 1.5;
                    ctx.strokeRect(fi*cell+0.75, ri*cell+0.75, cell-1.5, cell-1.5);
                } else if (tactical.defend.has(sq)) {
                    ctx.strokeStyle = 'rgba(96,165,250,0.6)'; ctx.lineWidth = 1;
                    ctx.strokeRect(fi*cell+0.5, ri*cell+0.5, cell-1, cell-1);
                }
            }
        }

        // Vẽ quân
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let ri = 0; ri < 8; ri++) {
            for (let fi = 0; fi < 8; fi++) {
                const piece = board[ri]?.[fi];
                if (!piece) continue;
                const sym = PIECE_UNICODE[piece];
                if (!sym) continue;
                const cx = fi * cell + cell / 2;
                const cy = ri * cell + cell / 2;
                const isWhite = piece === piece.toUpperCase();
                ctx.font = `${Math.round(cell * 0.7)}px serif`;

                ctx.save();
                ctx.translate(cx, cy);
                if (needRotate) ctx.rotate(Math.PI);
                ctx.translate(-cx, -cy);

                ctx.fillStyle = isWhite ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.7)';
                ctx.fillText(sym, cx+1, cy+1);
                ctx.fillStyle = isWhite ? '#f0d9b5' : '#1a1a1a';
                ctx.fillText(sym, cx, cy);
                if (isWhite) {
                    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
                    ctx.lineWidth = 0.5;
                    ctx.strokeText(sym, cx, cy);
                }
                ctx.restore();
            }
        }

        // Coordinates
        ctx.font = `${Math.round(cell * 0.2)}px 'Share Tech Mono', monospace`;
        for (let i = 0; i < 8; i++) {
            ctx.save();
            ctx.translate(i * cell + cell * 0.12, size - cell * 0.12);
            if (needRotate) ctx.rotate(Math.PI);
            ctx.fillStyle = 'rgba(57,255,20,0.3)';
            ctx.textAlign = 'center';
            ctx.fillText(String.fromCharCode(97 + i), 0, 0);
            ctx.restore();

            ctx.save();
            ctx.translate(size - cell * 0.12, i * cell + cell * 0.22);
            if (needRotate) ctx.rotate(Math.PI);
            ctx.fillStyle = 'rgba(57,255,20,0.3)';
            ctx.textAlign = 'center';
            ctx.fillText(8 - i, 0, 0);
            ctx.restore();
        }
    }

    // ===== TÌM CONTAINER CỦA MOVE LIST =====
    function getMoveListContainer() {
        // Thử nhiều selector vì chess.com thay đổi class thường xuyên
        return (
            document.querySelector('.move-list-component')?.parentElement ||
            document.querySelector('[class*="move-list"]')?.parentElement ||
            document.querySelector('.board-layout-sidebar') ||
            document.querySelector('[data-cy="move-list"]')?.parentElement ||
            null
        );
    }

    // ===== INJECT =====
    function injectMirrorBoard() {
        if (injected && document.getElementById('martin-mirror-inject')) return;

        const container = getMoveListContainer();
        if (!container) {
            setTimeout(injectMirrorBoard, 500);
            return;
        }

        // Đánh dấu để CSS ẩn move list
        document.body.classList.add('martin-mirror-active');

        // Tạo wrapper inject
        const el = document.createElement('div');
        el.id = 'martin-mirror-inject';
        el.innerHTML = `
            <div id="mmb-inject-header">
                <div id="mmb-inject-title">
                    <div id="mmb-inject-pulse"></div>
                    MIRROR BOARD
                </div>
                <div id="mmb-inject-badge">—</div>
            </div>
            <div id="mmb-inject-canvas-wrap">
                <canvas id="mmb-inject-canvas"></canvas>
            </div>
            <div id="mmb-inject-legend">
                <div class="mmb-inject-legend-item">
                    <div class="mmb-inject-legend-dot attack"></div><span>ATTACK</span>
                </div>
                <div class="mmb-inject-legend-item">
                    <div class="mmb-inject-legend-dot defend"></div><span>DEFEND</span>
                </div>
                <div class="mmb-inject-legend-item">
                    <div class="mmb-inject-legend-dot danger"></div><span>DANGER</span>
                </div>
            </div>
            <div id="mmb-inject-status">WAITING FOR FEN...</div>
        `;

        container.appendChild(el);
        injected = true;

        // Resize observer — canvas tự điều chỉnh theo container
        const wrap = el.querySelector('#mmb-inject-canvas-wrap');
        const ro = new ResizeObserver(() => {
            const w = wrap.clientWidth;
            const h = wrap.clientHeight;
            if (w > 0 && h > 0) {
                const fenRaw = typeof window.martinGetFen === 'function' ? window.martinGetFen() : null;
                if (fenRaw) {
                    const canvas = el.querySelector('#mmb-inject-canvas');
                    drawBoard(canvas, fenRaw, w, h);
                }
            }
        });
        ro.observe(wrap);

        // Vẽ ngay lần đầu
        updateInjectBoard();

        console.log('[MartinMirror] Injected into move list ✓');
    }

    function removeMirrorBoard() {
        document.body.classList.remove('martin-mirror-active');
        document.getElementById('martin-mirror-inject')?.remove();
        injected = false;
        lastRenderedFen = null;
    }

    // ===== UPDATE =====
    function updateInjectBoard() {
        const el = document.getElementById('martin-mirror-inject');
        if (!el) return;

        const fenRaw = typeof window.martinGetFen === 'function' ? window.martinGetFen() : null;
        const pulse  = el.querySelector('#mmb-inject-pulse');
        const status = el.querySelector('#mmb-inject-status');
        const badge  = el.querySelector('#mmb-inject-badge');
        const canvas = el.querySelector('#mmb-inject-canvas');
        const wrap   = el.querySelector('#mmb-inject-canvas-wrap');

        if (!fenRaw) {
            pulse?.classList.add('stale');
            if (status) status.textContent = 'NO GAME DETECTED';
            return;
        }

        if (fenRaw === lastRenderedFen) return;
        lastRenderedFen = fenRaw;

        pulse?.classList.remove('stale');
        if (status) status.textContent = fenRaw.substring(0, 42) + '…';

        const isFlipped = document.querySelector('wc-chess-board')?.classList.contains('flipped');
        if (badge) {
            badge.textContent = isFlipped ? 'BLACK' : 'WHITE';
            badge.style.color = isFlipped ? 'rgba(200,150,255,0.5)' : 'rgba(200,200,200,0.35)';
        }

        if (canvas && wrap) {
            drawBoard(canvas, fenRaw, wrap.clientWidth, wrap.clientHeight);
        }
    }

    // ===== OBSERVER =====
    function startFenObserver() {
        const board = document.querySelector('wc-chess-board');
        if (!board) { setTimeout(startFenObserver, 600); return; }
        new MutationObserver(() => { if (enabled) updateInjectBoard(); })
            .observe(board, {
                subtree: true, childList: true, attributes: true,
                attributeFilter: ['class', 'fen', 'data-fen']
            });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startFenObserver);
    else startFenObserver();

})();

// ===== SAFE-DROP INDICATOR — Cảnh báo khi đang rê quân =====
(function () {

    let enabled = false;
    window._martinSetSafeDrop = function (val) {
        enabled = !!val;
        if (!enabled) clearDropOverlay();
    };

    // ===== STYLE =====
    const style = document.createElement('style');
    style.textContent = `
        #martin-drop-overlay {
            position: fixed;
            pointer-events: none;
            z-index: 99998;
            top: 0; left: 0;
            width: 0; height: 0;
            overflow: visible;
        }

        /* Ô đang hover khi rê quân */
        #martin-drop-sq {
            position: fixed;
            pointer-events: none;
            border-radius: 2px;
            transition: left 0.04s, top 0.04s;
        }

        /* SAFE — xanh lá: ô an toàn, không bị tấn công */
        #martin-drop-sq.safe {
            background: rgba(34, 197, 94, 0.18);
            border: 2px solid rgba(34, 197, 94, 0.85);
            box-shadow: inset 0 0 12px rgba(34,197,94,0.15), 0 0 8px rgba(34,197,94,0.3);
        }

        /* WARN — cam: bị tấn công nhưng có quân bảo vệ (có thể đi được nhưng rủi ro) */
        #martin-drop-sq.warn {
            background: rgba(251, 146, 60, 0.2);
            border: 2px solid rgba(251, 146, 60, 0.9);
            box-shadow: inset 0 0 12px rgba(251,146,60,0.2), 0 0 10px rgba(251,146,60,0.4);
            animation: martin-drop-warn-pulse 0.6s ease-in-out infinite;
        }

        /* DANGER — đỏ: bị tấn công, ít hoặc không có quân bảo vệ (blunder ngay!) */
        #martin-drop-sq.danger {
            background: rgba(239, 68, 68, 0.22);
            border: 2px solid rgba(239, 68, 68, 1);
            box-shadow: inset 0 0 14px rgba(239,68,68,0.25), 0 0 16px rgba(239,68,68,0.5);
            animation: martin-drop-danger-pulse 0.35s ease-in-out infinite;
        }

        @keyframes martin-drop-warn-pulse {
            0%,100% { opacity: 0.8; }
            50%      { opacity: 1; }
        }
        @keyframes martin-drop-danger-pulse {
            0%,100% { opacity: 0.75; box-shadow: inset 0 0 14px rgba(239,68,68,0.25), 0 0 16px rgba(239,68,68,0.5); }
            50%      { opacity: 1;    box-shadow: inset 0 0 20px rgba(239,68,68,0.4), 0 0 28px rgba(239,68,68,0.8); }
        }

        /* Quân đang cầm mờ đi khi vào vùng nguy hiểm */
        .martin-drag-warn .piece.dragging,
        .martin-drag-warn .piece[class*="drag"] {
            opacity: 0.55 !important;
            filter: saturate(0.4) !important;
        }
        .martin-drag-danger .piece.dragging,
        .martin-drag-danger .piece[class*="drag"] {
            opacity: 0.4 !important;
            filter: saturate(0.2) sepia(0.5) !important;
        }

        /* Tooltip nhỏ hiện lý do */
        #martin-drop-tooltip {
            position: fixed;
            pointer-events: none;
            z-index: 99999;
            font-family: 'Segoe UI', sans-serif;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.5px;
            padding: 4px 8px;
            border-radius: 5px;
            white-space: nowrap;
            transform: translate(-50%, -130%);
            transition: left 0.04s, top 0.04s, opacity 0.15s;
            opacity: 0;
        }
        #martin-drop-tooltip.visible { opacity: 1; }
        #martin-drop-tooltip.safe    { background: rgba(21,128,61,0.92);  color: #bbf7d0; border: 1px solid rgba(34,197,94,0.5); }
        #martin-drop-tooltip.warn    { background: rgba(154,52,18,0.92);  color: #fed7aa; border: 1px solid rgba(251,146,60,0.5); }
        #martin-drop-tooltip.danger  { background: rgba(127,29,29,0.95);  color: #fecaca; border: 1px solid rgba(239,68,68,0.6); }
    `;
    document.head.appendChild(style);

    // ===== DOM =====
    const overlayEl = document.createElement('div');
    overlayEl.id = 'martin-drop-overlay';

    const dropSqEl = document.createElement('div');
    dropSqEl.id = 'martin-drop-sq';

    const tooltipEl = document.createElement('div');
    tooltipEl.id = 'martin-drop-tooltip';

    overlayEl.appendChild(dropSqEl);
    overlayEl.appendChild(tooltipEl);
    document.body.appendChild(overlayEl);

    // ===== STATE =====
    let isDragging = false;
    let dragPiece  = null;   // { color: 'w'|'b', type: 'p'|'n'|'b'|'r'|'q'|'k', sq: 'e2' }
    let lastHoverSq = null;

    // ===== HELPERS =====
    function getBoardRect() {
        const boardEl = document.querySelector('wc-chess-board');
        if (!boardEl) return null;
        return (boardEl.querySelector('.board') || boardEl).getBoundingClientRect();
    }

    function getFlipped() {
        return document.querySelector('wc-chess-board')?.classList.contains('flipped') ?? false;
    }

    function getMyColor() {
        return getFlipped() ? 'b' : 'w';
    }

    function clientToSq(clientX, clientY) {
        const rect = getBoardRect();
        if (!rect) return null;
        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null;
        const cell = rect.width / 8;
        const fi = Math.floor((clientX - rect.left) / cell);
        const ri = Math.floor((clientY - rect.top)  / cell);
        const flipped = getFlipped();
        const file = flipped ? 7 - fi : fi;
        const rank = flipped ? ri + 1 : 8 - ri;
        if (file < 0 || file > 7 || rank < 1 || rank > 8) return null;
        return String.fromCharCode(97 + file) + rank;
    }

    function sqToPixel(sq) {
        const rect = getBoardRect();
        if (!rect) return null;
        const flipped = getFlipped();
        const f = sq.charCodeAt(0) - 97;
        const r = parseInt(sq[1]) - 1;
        const cell = rect.width / 8;
        const col = flipped ? 7 - f : f;
        const row = flipped ? r : 7 - r;
        return { x: rect.left + col * cell, y: rect.top + row * cell, cell };
    }

    function getPieceAtSq(sq) {
        const file = sq.charCodeAt(0) - 96;
        const rank  = sq[1];
        const el = document.querySelector(`.piece.square-${file}${rank}`);
        if (!el) return null;
        const m = el.className.match(/\b([wb][pnbrqk])\b/);
        return m ? m[1] : null;
    }

    function getFen() {
        return typeof window.martinGetFen === 'function' ? window.martinGetFen() : null;
    }

    // ===== CORE: đánh giá độ an toàn của ô drop =====
    // Trả về: { level: 'safe'|'warn'|'danger', reason: string }
    function evaluateDrop(fromSq, toSq, fenRaw) {
        if (typeof Chess === 'undefined' || !fenRaw) return null;

        const myColor  = getMyColor();
        const oppColor = myColor === 'w' ? 'b' : 'w';

        let ch;
        try { ch = new Chess(fenRaw); }
        catch (e) { return null; }

        // Kiểm tra nước đi có hợp lệ không
        const parts = fenRaw.split(' ');
        parts[1] = myColor;
        let myChess;
        try { myChess = new Chess(parts.slice(0, 6).join(' ')); }
        catch (e) { return null; }

        const legalMoves = myChess.moves({ square: fromSq, verbose: true });
        const isLegal = legalMoves.some(m => m.to === toSq);
        if (!isLegal) return null; // ô không hợp lệ → không hiện gì

        // Thực hiện nước đi thử (simulate)
        let simChess;
        try { simChess = new Chess(parts.slice(0, 6).join(' ')); }
        catch (e) { return null; }

        // Thử đi nước đó
        const moveResult = simChess.move({ from: fromSq, to: toSq, promotion: 'q' });
        if (!moveResult) return null;

        // Sau khi đi xong, đổi lượt sang đối thủ và kiểm tra họ có thể ăn quân mình ở toSq không
        const afterFenParts = simChess.fen().split(' ');
        afterFenParts[1] = oppColor;
        let oppChess;
        try { oppChess = new Chess(afterFenParts.slice(0, 6).join(' ')); }
        catch (e) { return null; }

        const oppMoves = oppChess.moves({ verbose: true });
        const attackers = oppMoves.filter(m => m.to === toSq && m.captured);

        if (attackers.length === 0) {
            return { level: 'safe', reason: '✓ Safe square' };
        }

        // Có attackers — giờ đếm quân mình bảo vệ toSq sau khi đã đi
        afterFenParts[1] = myColor;
        let myDefChess;
        try { myDefChess = new Chess(afterFenParts.slice(0, 6).join(' ')); }
        catch (e) { return null; }

        const myDefMoves = myDefChess.moves({ verbose: true });
        const defenders  = myDefMoves.filter(m => m.to === toSq);

        // Đánh giá đơn giản: so sánh số lượng
        if (defenders.length >= attackers.length) {
            return { level: 'warn', reason: `⚠ ${attackers.length} attacker${attackers.length > 1 ? 's' : ''}, ${defenders.length} defender${defenders.length > 1 ? 's' : ''}` };
        } else {
            return { level: 'danger', reason: `✗ Hanging! ${attackers.length} attacker${attackers.length > 1 ? 's' : ''}, only ${defenders.length} defender${defenders.length > 1 ? 's' : ''}` };
        }
    }

    // ===== RENDER DROP INDICATOR =====
    function renderDropIndicator(sq, evaluation, mouseX, mouseY) {
        const pos = sqToPixel(sq);
        if (!pos) { clearDropOverlay(); return; }

        if (!evaluation) {
            // Ô không hợp lệ → ẩn
            dropSqEl.style.display = 'none';
            tooltipEl.classList.remove('visible');
            return;
        }

        const { level, reason } = evaluation;

        // Vẽ ô
        dropSqEl.style.display = 'block';
        dropSqEl.style.left    = pos.x + 'px';
        dropSqEl.style.top     = pos.y + 'px';
        dropSqEl.style.width   = pos.cell + 'px';
        dropSqEl.style.height  = pos.cell + 'px';
        dropSqEl.className     = level; // 'safe' | 'warn' | 'danger'

        // Tooltip
        tooltipEl.textContent = reason;
        tooltipEl.className   = `visible ${level}`;
        tooltipEl.style.left  = mouseX + 'px';
        tooltipEl.style.top   = mouseY + 'px';

        // Làm mờ quân đang cầm nếu nguy hiểm
        const board = document.querySelector('wc-chess-board');
        if (board) {
            board.classList.remove('martin-drag-warn', 'martin-drag-danger');
            if (level === 'warn')   board.classList.add('martin-drag-warn');
            if (level === 'danger') board.classList.add('martin-drag-danger');
        }
    }

    function clearDropOverlay() {
        dropSqEl.style.display = 'none';
        tooltipEl.classList.remove('visible');
        lastHoverSq = null;
        isDragging  = false;
        dragPiece   = null;
        const board = document.querySelector('wc-chess-board');
        board?.classList.remove('martin-drag-warn', 'martin-drag-danger');
    }

    // ===== EVENT LISTENERS =====
    function onPointerDown(e) {
        if (!enabled || e.button !== 0) return;

        const sq = clientToSq(e.clientX, e.clientY);
        if (!sq) return;

        const pieceCode = getPieceAtSq(sq);
        if (!pieceCode) return;

        const myColor = getMyColor();
        if (pieceCode[0] !== myColor) return; // không phải quân mình

        isDragging = true;
        dragPiece  = { code: pieceCode, sq };
        lastHoverSq = null;
    }

    function onPointerMove(e) {
        if (!enabled || !isDragging || !dragPiece) return;

        const sq = clientToSq(e.clientX, e.clientY);
        if (!sq || sq === dragPiece.sq) {
            // Vẫn trên ô gốc hoặc ra ngoài bàn cờ
            dropSqEl.style.display = 'none';
            tooltipEl.classList.remove('visible');
            return;
        }

        if (sq === lastHoverSq) return; // không tính lại nếu vẫn ô cũ
        lastHoverSq = sq;

        const fenRaw = getFen();
        if (!fenRaw) return;

        const evaluation = evaluateDrop(dragPiece.sq, sq, fenRaw);
        renderDropIndicator(sq, evaluation, e.clientX, e.clientY);
    }

    function onPointerUp() {
        if (!enabled) return;
        clearDropOverlay();
    }

    // ===== INIT =====
    function init() {
        const board = document.querySelector('wc-chess-board');
        if (!board) { setTimeout(init, 600); return; }

        board.addEventListener('pointerdown',  onPointerDown);
        document.addEventListener('pointermove', onPointerMove, { passive: true });
        document.addEventListener('pointerup',   onPointerUp);

        console.log('[MartinSafeDrop] Safe-Drop Indicator READY ✓');
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

})();