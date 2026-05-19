// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
});

const staticBlockList = [
    "doubleclick.net",
    "adservice.google",
    "adnxs.com",
    "taboola.com"
];

chrome.runtime.onInstalled.addListener(async () => {

    const existingRules =
        await chrome.declarativeNetRequest.getDynamicRules();

    const existingIds = new Set(existingRules.map(r => r.id));
    const existingFilters = new Set(
        existingRules.map(r => r.condition.urlFilter)
    );

    const rulesToAdd = [];

    staticBlockList.forEach((domain, index) => {

        const ruleId = 20000 + index;
        const filter = `||${domain}`;

        // Ne add hozzá újra ha már létezik
        if (
            existingIds.has(ruleId) ||
            existingFilters.has(filter)
        ) {
            return;
        }

        rulesToAdd.push({
            id: ruleId,
            priority: 1,
            action: { type: "block" },
            condition: {
                urlFilter: filter,
                resourceTypes: [
                    "main_frame",
                    "sub_frame",
                    "script"
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

let blockedCount = 0;

chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener((info) => {
    blockedCount++;

    chrome.storage.local.set({
        blockedCount
    });
});