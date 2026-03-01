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
    0%   { background: #35322e; box-shadow: 0 0 5px rgba(255,170,0,0.2); }
    50%  { background: linear-gradient(145deg,#ff9f00,#cc7a00); box-shadow: 0 0 20px rgba(255,159,0,0.6); }
    100% { background: #35322e; box-shadow: 0 0 5px rgba(255,170,0,0.2); }
}
@keyframes martin-red-glow {
    0%   { background: #35322e; }
    50%  { background: linear-gradient(145deg,#ff0000,#b30000); box-shadow: 0 0 25px rgba(255,0,0,0.8); }
    100% { background: #35322e; }
}
@keyframes martin-critical-glow {
    0%   { background: #35322e; transform: scale(1); }
    50%  { background: linear-gradient(145deg,#ff004c,#8b0000); box-shadow: 0 0 35px #ff0000, inset 0 0 10px rgba(255,255,255,0.3); transform: scale(1.08); }
    100% { background: #35322e; transform: scale(1); }
}
.martin-time-15 { animation: martin-yellow-glow 1.5s ease-in-out infinite; border-radius: 6px; border: 1px solid rgba(255,159,0,0.3); }
.martin-time-10 { animation: martin-red-glow 0.8s ease-in-out infinite; border-radius: 6px; border: 1px solid rgba(255,0,0,0.5); }
.martin-time-5  { animation: martin-critical-glow 0.4s cubic-bezier(0.4,0,0.6,1) infinite; border-radius: 6px; z-index: 10; border: 1px solid #ff0000; }
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
    if (lowTimeInterval) { clearInterval(lowTimeInterval); lowTimeInterval = null; }
    const myClock = document.querySelector('[class*="clock-bottom"] .clock-time-monospace');
    if (myClock) myClock.classList.remove("martin-time-15", "martin-time-10", "martin-time-5");
}

// ===== DIGITAL CLOCK — 7-SEGMENT LED =====
const SEGMENTS = {
    '0': [1, 1, 1, 1, 1, 1, 0], '1': [0, 1, 1, 0, 0, 0, 0], '2': [1, 1, 0, 1, 1, 0, 1],
    '3': [1, 1, 1, 1, 0, 0, 1], '4': [0, 1, 1, 0, 0, 1, 1], '5': [1, 0, 1, 1, 0, 1, 1],
    '6': [1, 0, 1, 1, 1, 1, 1], '7': [1, 1, 1, 0, 0, 0, 0], '8': [1, 1, 1, 1, 1, 1, 1], '9': [1, 1, 1, 1, 0, 1, 1],
};
const LED_ON = '#cc1100';
const LED_OFF = 'rgba(180,20,0,0.10)';
const S = 3;
const DW = 16;
const DH = 26;
const CW = 7;
const GAP = 2;

function drawDigit(ctx, char, x, y) {
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

function renderTime(canvas, timeStr) {
    const chars = timeStr.replace(/\s/g, '').split('');
    const PAD = 3;
    let totalW = 0;
    chars.forEach(c => { totalW += (c === ':' ? CW : DW) + GAP; });
    totalW = Math.max(totalW - GAP, 1);
    canvas.width = totalW + PAD * 2;
    canvas.height = DH + PAD * 2;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let x = PAD;
    chars.forEach(c => {
        if (c === ':') { drawColon(ctx, x, PAD); x += CW + GAP; }
        else if (SEGMENTS[c]) { drawDigit(ctx, c, x, PAD); x += DW + GAP; }
    });
}

function updateAllClocks() {
    document.querySelectorAll('.clock-time-monospace').forEach(span => {
        let timeText = span.innerText.trim();
        if (!timeText) return;
        timeText = timeText.replace(/\.\d+$/, '');
        let canvas = span.nextElementSibling;
        if (!canvas || !canvas.classList.contains('martin-led-canvas')) {
            canvas = document.createElement('canvas');
            canvas.className = 'martin-led-canvas';
            canvas.style.cssText = `display: block; background: transparent;`;
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
    if (digitalClockInterval) { clearInterval(digitalClockInterval); digitalClockInterval = null; }
    document.body.classList.remove('martin-digital-clock');
    document.querySelectorAll('.martin-led-canvas').forEach(c => c.remove());
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
    document.querySelectorAll(".clock-time-monospace").forEach(clock => {
        clock.style.fontSize = settings.largerClock ? "40px" : "";
        clock.style.fontWeight = settings.largerClock ? "bold" : "";
    });
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
    const avatars = document.querySelectorAll('[data-cy="avatar"]');
    avatars.forEach(avatar => {
        const playerBlock = avatar.closest('[class*="player"]');
        if (!playerBlock) return;
        if (playerBlock.matches('[class*="bottom"]')) return;
        if (hide) {
            if (!avatar.dataset.originalSrc) {
                avatar.dataset.originalSrc = avatar.src;
                avatar.dataset.originalSrcset = avatar.srcset;
            }
            try { avatar.src = chrome.runtime.getURL("assets/chess.png"); } catch (e) { return; }
            avatar.srcset = "";
            const userTagline = playerBlock.querySelector('[class*="user-tagline"]');
            if (userTagline) {
                userTagline.querySelectorAll('*').forEach(el => {
                    if (!el.dataset.originalVisibility) el.dataset.originalVisibility = el.style.visibility || '';
                    el.style.visibility = 'hidden';
                });
            }
            playerBlock.querySelectorAll('[data-cy="country-flag"],.flag,[data-test-element="user-tagline-rating"]')
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
            playerBlock.querySelectorAll('[data-cy="country-flag"],.flag,[data-test-element="user-tagline-rating"]')
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
    padding: 3px 6px !important;
    width: auto !important;
    min-width: unset !important;
    max-height: 44px !important;
    background: #2B2926 !important;
    border: 2px solid #cc1100 !important;
    border-radius: 6px !important;
    box-shadow: 0 0 8px rgba(180,0,0,0.5), inset 0 0 6px rgba(180,0,0,0.1) !important;
    overflow: hidden !important;
}
.martin-digital-clock .martin-led-canvas {
    flex-shrink: 0;
    display: block !important;
    background: transparent !important;
}

/* Legal Moves Pro */
#martin-overlay .martin-move {
    transition: opacity 0.15s ease, transform 0.1s ease;
}
#martin-overlay.dragging .martin-move {
    opacity: 0.55;
    transform: scale(0.95);
}
#martin-overlay .martin-origin {
    position: fixed;
    pointer-events: none;
    background: rgba(255,0,0,0.12);
    border: 2px solid rgba(255,0,0,0.75);
    box-shadow: 0 0 12px rgba(255,0,0,0.5);
    border-radius: 4px;
    transition: opacity 0.15s ease;
}
`;
document.head.appendChild(cleanStyle);


// ===== LEGAL MOVES OVERLAY =====
(function () {

    function log(...args) { console.log('[MartinLegal]', ...args); }

    // ===== STATE =====
    let enabled = false;  // controlled via window._martinSetLegalMoves
    let selectedSq = null;

    // ===== WINDOW BRIDGE — applySettings() gọi từ ngoài IIFE =====
    window._martinSetLegalMoves = function (val) {
        enabled = !!val;
        log('legalMoves enabled:', enabled);
        if (!enabled) clearOverlay();
    };

    // ===== ĐỌC FEN =====
    function getFen() {
        const board = document.querySelector('wc-chess-board');
        if (board) {
            const fen = board.getAttribute('fen');
            if (fen) return fen;
            try {
                const game = board.game || board._game;
                if (game) return game.getFEN?.() || game.fen?.() || null;
            } catch (e) { }
        }
        return buildFenFromDOM();
    }

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
        ov.innerHTML = ''; // clear trực tiếp, không gọi clearOverlay() để giữ selectedSq

        const rect = getBoardRect();
        if (!rect || rect.width === 0) { log('ERROR: board rect zero'); return; }

        // Highlight ô xuất phát
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
            const bw = Math.max(2, cell * 0.065);

            if (!isCap) {
                // Move thường chấm tròn vàng nhỏ
                el.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: ${cell}px;
                height: ${cell}px;
                pointer-events: none;
                display: flex;
                align-items: center;
                justify-content: center;
                `;

                const dot = document.createElement("div");
                dot.style.cssText = `
                width: ${cell * 0.22}px;
                height: ${cell * 0.22}px;
                background: #FFD700;
                border-radius: 50%;
                `;

                el.appendChild(dot);

            } else {
                // Capture vòng tròn bao quanh quân
                el.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: ${cell}px;
                height: ${cell}px;
                pointer-events: none;
                box-sizing: border-box;
                border-radius: 50%;
                border: 3px solid #ff0000;
                background: radial-gradient(circle, transparent 60%, rgba(255,0,0,0.12) 100%);
                box-shadow: 0 0 ${cell * 0.15}px rgba(255,0,0,0.5);
            `;
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
                // Làm mờ dots khi đang drag
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
