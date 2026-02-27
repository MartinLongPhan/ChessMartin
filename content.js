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
@keyframes martin-yellow {
    0% { background: rgba(255, 200, 0, 0.2); }
    50% { background: rgba(255, 200, 0, 0.7); }
    100% { background: rgba(255, 200, 0, 0.2); }
}

@keyframes martin-red {
    0% { background: rgba(255, 0, 0, 0.3); }
    50% { background: rgba(255, 0, 0, 0.9); }
    100% { background: rgba(255, 0, 0, 0.3); }
}

@keyframes martin-critical {
    0% { background: rgba(255, 0, 0, 0.6); transform: scale(1); }
    50% { background: rgba(255, 0, 0, 1); transform: scale(1.05); }
    100% { background: rgba(255, 0, 0, 0.6); transform: scale(1); }
}

.martin-time-15 {
    animation: martin-yellow 1.2s infinite;
    border-radius: 8px;
}

.martin-time-10 {
    animation: martin-red 0.6s infinite;
    border-radius: 8px;
}

.martin-time-5 {
    animation: martin-critical 0.4s infinite;
    border-radius: 8px;
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

    if (seconds <= 5) {
        myClock.classList.add("martin-time-5");
    } else if (seconds <= 10) {
        myClock.classList.add("martin-time-10");
    } else if (seconds <= 15) {
        myClock.classList.add("martin-time-15");
    }
}

// Dùng interval riêng để check đồng hồ mỗi 500ms
// KHÔNG phụ thuộc vào MutationObserver — đảm bảo phản ứng kịp thời
let lowTimeInterval = null;

function startLowTimeInterval() {
    if (lowTimeInterval) return; // Tránh tạo nhiều interval trùng nhau
    lowTimeInterval = setInterval(checkLowTime, 500);
}

function stopLowTimeInterval() {
    if (lowTimeInterval) {
        clearInterval(lowTimeInterval);
        lowTimeInterval = null;
    }
    // Xóa hết class animation khi tắt tính năng
    const myClock = document.querySelector('[class*="clock-bottom"] .clock-time-monospace');
    if (myClock) myClock.classList.remove("martin-time-15", "martin-time-10", "martin-time-5");
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
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
};
document.body.appendChild(btn);

let currentSettings = {};
console.log("MartinChessVN loaded");

// ===== APPLY SETTINGS =====
function applySettings(settings) {

    // Clock size
    const clocks = document.querySelectorAll(".clock-time-monospace");
    clocks.forEach(clock => {
        if (settings.largerClock) {
            clock.style.fontSize = "40px";
            clock.style.fontWeight = "bold";
        } else {
            clock.style.fontSize = "";
            clock.style.fontWeight = "";
        }
    });

    // Hide Opponent
    toggleOpponentVisibility(settings.hideOpponent);

    // Clean UI
    document.body.classList.toggle("martin-clean", !!settings.cleanUI);
    document.body.classList.toggle("martin-hide-logo", !!(settings.cleanUI && settings.hideLogo));
    document.body.classList.toggle("martin-hide-ads", !!(settings.cleanUI && settings.hideAds));
    document.body.classList.toggle("martin-hide-notifications", !!(settings.cleanUI && settings.hideNotifications));

    // Low Time Alert — bật/tắt interval
    if (settings.lowTimeAlert) {
        startLowTimeInterval();
    } else {
        stopLowTimeInterval();
    }
}

// ===== HIDE OPPONENT =====
function toggleOpponentVisibility(hide) {
    if (hide) {
        document.body.classList.add("martin-hide-opponent");
    } else {
        document.body.classList.remove("martin-hide-opponent");
    }

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
            const chessURL = chrome.runtime.getURL("assets/chess.png");
            avatar.src = chessURL;
            avatar.srcset = "";

            const userTagline = playerBlock.querySelector('[class*="user-tagline"]');
            if (userTagline) {
                userTagline.querySelectorAll('*').forEach(el => {
                    if (!el.dataset.originalVisibility) el.dataset.originalVisibility = el.style.visibility || '';
                    el.style.visibility = 'hidden';
                });
            }

            const extraEls = playerBlock.querySelectorAll('[data-cy="country-flag"], .flag, [data-test-element="user-tagline-rating"]');
            extraEls.forEach(el => {
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

            const extraEls = playerBlock.querySelectorAll('[data-cy="country-flag"], .flag, [data-test-element="user-tagline-rating"]');
            extraEls.forEach(el => {
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
    ["largerClock", "hideOpponent", "cleanUI", "hideLogo", "hideAds", "hideNotifications", "lowTimeAlert"],
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
    timeout = setTimeout(() => {
        applySettings(currentSettings);
    }, 100);
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
});

// ===== CLEAN UI STYLES =====
const cleanStyle = document.createElement("style");
cleanStyle.textContent = `
.martin-hide-logo .header-logo {
    display: none !important;
}
.martin-hide-ads .advertisement,
.martin-hide-ads [class*="ad-"] {
    display: none !important;
}
.martin-hide-notifications .notification-area,
.martin-hide-notifications [class*="notification"] {
    display: none !important;
}
`;
document.head.appendChild(cleanStyle);