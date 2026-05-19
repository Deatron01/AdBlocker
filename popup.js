// popup.js

async function initPopup() {

    try {

        const result =
            await chrome.storage.local.get("blockedCount");

        const blockedCount =
            result.blockedCount || 0;

        document.getElementById("blockedCount").textContent =
            blockedCount;

    } catch (err) {

        console.error(
            "Hiba a blokkolási statisztika betöltésekor:",
            err
        );
    }
}

initPopup();