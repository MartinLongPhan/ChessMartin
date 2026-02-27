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
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 14px;
    letter-spacing: 1px;
}
`;

document.head.appendChild(style);
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


// ===== APPLY SETTINGS FUNCTION =====
function applySettings(settings) {

    // ===== Clock =====
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

    // ===== Hide Opponent =====
    toggleOpponentVisibility(settings.hideOpponent);

    // ===== Clean UI =====
    document.body.classList.toggle("martin-clean", settings.cleanUI);

    document.body.classList.toggle("martin-hide-logo", settings.cleanUI && settings.hideLogo);
    document.body.classList.toggle("martin-hide-ads", settings.cleanUI && settings.hideAds);
    document.body.classList.toggle("martin-hide-notifications", settings.cleanUI && settings.hideNotifications);
}


// ===== Hide Opponent Block (Clean Version) =====
// function toggleOpponentVisibility(hide) {

//     const username = document.querySelector('[data-test-element="user-tagline-username"]');

//     if (!username) return;

//     // Tìm block lớn bao toàn bộ avatar + tên + rating + flag
//     const opponentBlock = username.closest('[class*="player"]');

//     if (opponentBlock) {
//         opponentBlock.style.display = hide ? "none" : "";
//     }
// }

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

            // Hide children inside the user-tagline but keep the ::after overlay visible
            const userTagline = playerBlock.querySelector('[class*="user-tagline"]');
            if (userTagline) {
                userTagline.querySelectorAll('*').forEach(el => {
                    if (!el.dataset.originalVisibility) el.dataset.originalVisibility = el.style.visibility || '';
                    el.style.visibility = 'hidden';
                });
            }

            // Hide flags and rating elements that might sit outside the tagline
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

            // Restore visibility/display for previously-hidden elements
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




// ===== LOAD SETTINGS ON PAGE LOAD =====
// chrome.storage.sync.get(
//     ["largerClock", "hideOpponent"],
//     (data) => {
//         applySettings(data);
//     }
// );



// ===== LISTEN FOR REAL-TIME UPDATE =====
chrome.runtime.onMessage.addListener((message) => {
    // if (message.action === "updateSettings") {
    //     currentSettings = message;
    //     applySettings(currentSettings);
    // }
    if (message.action === "updateSettings") {

        const { action, ...newSettings } = message;

        currentSettings = {
            ...currentSettings,
            ...newSettings
        };

        applySettings(currentSettings);
    }

});



// ===== KEEP SETTINGS AFTER SPA NAVIGATION =====


chrome.storage.sync.get(
    ["largerClock", "hideOpponent", "cleanUI", "hideLogo", "hideAds", "hideNotifications"],
    (data) => {
        currentSettings = data;
        applySettings(currentSettings);
    }
);

// Theo dõi DOM thay đổi (React re-render)
// const observer = new MutationObserver(() => {
//     if (
//         currentSettings.hideOpponent ||
//         currentSettings.largerClock ||
//         currentSettings.cleanUI
//     ) {
//         applySettings(currentSettings);
//     }
// });

let timeout;

const observer = new MutationObserver((mutations) => {

    // Nếu mutation chỉ là attribute class của body thì bỏ qua
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