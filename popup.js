
// Az összes listád ID-ja, amit a manifest.json-ben megadtál
const allRulesetIds = ["ruleset_1", "ruleset_2", "ruleset_3", "ruleset_4"];

if (newState) {
    // Bekapcsolás
    await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: allRulesetIds
    });
} else {
    // Kikapcsolás
    await chrome.declarativeNetRequest.updateEnabledRulesets({
        disableRulesetIds: allRulesetIds
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const toggleBtn = document.getElementById('toggleBtn');
    const statusText = document.getElementById('statusText');

    // Aktuális állapot lekérdezése a tárolóból
    chrome.storage.local.get(['isAdblockEnabled'], (result) => {
        let isEnabled = result.isAdblockEnabled !== false; // Alapértelmezetten true
        updateUI(isEnabled);
    });

    // Gombnyomás eseménykezelő
    toggleBtn.addEventListener('click', () => {
        chrome.storage.local.get(['isAdblockEnabled'], async (result) => {
            let isEnabled = result.isAdblockEnabled !== false;
            let newState = !isEnabled;
            
            // Állapot mentése
            chrome.storage.local.set({ isAdblockEnabled: newState });
            
            // Szabályok frissítése a DeclarativeNetRequest API-n keresztül
            if (newState) {
                await chrome.declarativeNetRequest.updateEnabledRulesets({
                    enableRulesetIds: ["network_rules"]
                });
            } else {
                await chrome.declarativeNetRequest.updateEnabledRulesets({
                    disableRulesetIds: ["network_rules"]
                });
            }
            
            updateUI(newState);
            
            // Opcionális: A jelenlegi lap újratöltése, hogy azonnal látszódjon a változás
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.reload(tabs[0].id);
            });
        });
    });

    // Felület frissítése
    function updateUI(isEnabled) {
        if (isEnabled) {
            statusText.textContent = "Aktív";
            statusText.className = "status";
            toggleBtn.textContent = "Blokkolás kikapcsolása";
        } else {
            statusText.textContent = "Inaktív";
            statusText.className = "status disabled";
            toggleBtn.textContent = "Blokkolás bekapcsolása";
        }
    }
});