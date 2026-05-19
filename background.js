// background.js

const staticBlockList = [
    "doubleclick.net",
    "adservice.google",
    "adnxs.com",
    "taboola.com"
];

// 1. ÖSSZEVONT ÜZENETKEZELŐ (Csak egyetlen addeListener lehet!)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    // A: Új domain dinamikus megtanulása és blokkolása
    if (message.type === 'LEARN_NEW_AD_DOMAIN' && message.domain) {
        const targetDomain = message.domain;

        chrome.declarativeNetRequest.getDynamicRules(existingRules => {
            const isAlreadyBlocked = existingRules.some(rule =>
                rule.condition.urlFilter === `||${targetDomain}`
            );

            if (isAlreadyBlocked) return;

            // Biztonságos ID generálás
            const maxId = existingRules.reduce((max, r) => Math.max(max, r.id), 9999);
            const newId = maxId + 1;

            chrome.declarativeNetRequest.updateDynamicRules({
                addRules: [{
                    id: newId,
                    priority: 2,
                    action: { type: "block" },
                    condition: {
                        urlFilter: `||${targetDomain}`,
                        resourceTypes: [
                            "main_frame", // Meggátolja az átirányítást erre a domainre
                            "sub_frame",
                            "script",
                            "image",
                            "xmlhttprequest"
                        ]
                    }
                }]
            })
            .then(() => {
                console.log(`🛡️ Új domain blokkolva: ${targetDomain} (ID: ${newId})`);
            })
            .catch(err => {
                console.error("Hiba a szabály hozzáadásakor:", err);
            });
        });
    }

    // B: Számláló növelése a content.js / page_context.js felől érkező jelek alapján
    if (message.type === "INCREMENT_BLOCKED_COUNT") {
        chrome.storage.local.get({ blockedCount: 0 }, (result) => {
            const currentCount = result.blockedCount + (message.amount || 1);
            chrome.storage.local.set({ blockedCount: currentCount });
        });
    }
    
    // Manifest V3-ban jó gyakorlat true-val visszatérni, ha aszinkron válaszunk is lehetne
    return true; 
});

// 2. Statikus lista betöltése kiterjesztés telepítésekor vagy frissítésekor
chrome.runtime.onInstalled.addListener(async () => {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingIds = new Set(existingRules.map(r => r.id));
    const existingFilters = new Set(existingRules.map(r => r.condition.urlFilter));

    const rulesToAdd = [];

    staticBlockList.forEach((domain, index) => {
        const ruleId = 20000 + index;
        const filter = `||${domain}`;

        if (existingIds.has(ruleId) || existingFilters.has(filter)) {
            return;
        }

        rulesToAdd.push({
            id: ruleId,
            priority: 1,
            action: { type: "block" },
            condition: {
                urlFilter: filter,
                resourceTypes: [
                    "main_frame", // Átirányítás elleni védelem a statikus listára is
                    "sub_frame",
                    "script",
                    "image"
                ]
            }
        });
    });

    if (rulesToAdd.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
            addRules: rulesToAdd
        });
        console.log("✅ Static szabályok hozzáadva");
    }
});

// 3. Biztonságos hálózati számláló kezelés (Kizárólag kicsomagolt fejlesztői módban fut!)
if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
    chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
        chrome.storage.local.get({ blockedCount: 0 }, (result) => {
            const currentCount = result.blockedCount + 1;
            chrome.storage.local.set({ blockedCount: currentCount });
        });
    });
}