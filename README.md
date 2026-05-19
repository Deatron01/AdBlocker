# 🛡️ Privát & Nyílt Forrású AdBlocker

Egy minimalista, villámgyors és maximálisan adatvédelmi fókuszú hirdetésblokkoló Google Chrome (és más Chromium-alapú) böngészőkhöz.

## 🚀 Miért készült ez a projekt?

A legtöbb mai népszerű hirdetésblokkolót és kiterjesztést profitorientált cégek vásárolták fel vagy üzemeltetik. Ezek a bővítmények gyakran **nyomon követik a böngészési előzményeidet, adatokat gyűjtenek rólad, és értékesítik azokat harmadik feleknek**, vagy "elfogadható hirdetések" címszóval pénzért mégis átengednek reklámokat.

**Ez a kiterjesztés teljesen más:**
* 🔒 **Maximális Adatvédelem:** Nem gyűjt, nem tárol és nem küld el semmilyen adatot a böngésződből. Minden statisztika és szabály helyileg, a saját eszközödön marad.
* 🛑 **Valódi Blokkolás:** Nem köt kompromisszumokat és nem enged át fizetett hirdetéseket. Amit letiltasz, az letiltva is marad.
* ⚡ **Pehelykönnyű:** Nem lassítja le a böngészőt felesleges háttérfolyamatokkal és telemetriával.

---

## 🛠️ Főbb Funkciók & Amit Szűr

A kiterjesztés a modern **Manifest V3** architektúrára és a Chrome beépített, nagy teljesítményű `declarativeNetRequest` motorjára épül, kiegészítve egy intelligens oldalszintű védelmi vonallal:

1. **Hálózati szintű reklámszűrés:** Automatikusan blokkolja a statikus és dinamikusan tanult listák alapján a reklámszervereket, scripteket, trackereket (követőkódokat), képeket és aszinkron (`XHR/Fetch`) lekéréseket.
2. **Felugró ablakok (Popup) kiiktatása:** Beépített védelem a trükkös, kattintásra megnyíló kéretlen hirdetési ablakok ellen (felülírt `window.open` logika a legbiztonságosabb szűrésért).
3. **Átirányításgátlás (`main_frame` védelem):** Megakadályozza, hogy a meglátogatott oldal akaratod ellenére átirányítson gyanús külső hirdetési platformokra vagy adathalász oldalakra.
4. **Dinamikus Domain-Tanulás:** Ha a rendszer gyanús hirdetési hálózati mintát észlel, képes azt menet közben megtanulni és véglegesen tiltólistára tenni.
5. **Helyi és Perzisztens Számláló:** Pontosan méri és mutatja a blokkolt elemek számát, amely a `chrome.storage.local` használatának köszönhetően a böngésző vagy a háttérfolyamat újraindulásakor sem nullázódik le.

---

## 💻 Telepítés Fejlesztői Módban

Mivel a projekt teljesen nyílt forrású és a te ellenőrzésed alatt áll, kicsomagolt kiterjesztésként tudod hozzáadni a böngésződhöz:

1. Töltsd le vagy klónozd ezt a repót.
2. Nyisd meg a Google Chrome-ot és navigálj a `chrome://extensions/` oldalra.
3. A jobb felső sarokban kapcsold be a **Fejlesztői mód** (Developer mode) csúszkát.
4. Kattints a bal felső sarokban megjelenő **Kicsomagolt betöltése** (Load unpacked) gombra.
5. Válaszd ki azt a mappát, amiben a projekt fájljai (köztük a `manifest.json`) találhatók.
6. Kész! A kiterjesztés máris aktívan véd.

---

## 📁 Projekt Felépítése

* `manifest.json` - A kiterjesztés konfigurációja és engedélyei (Manifest V3).
* `background.js` - A háttérben futó Service Worker, amely a hálózati szabályokat kezeli és menti a statisztikákat.
* `content.js` - Az elszigetelt környezetben futó script, ami hídként szolgál a weboldal és a kiterjesztés között.
* `page_context.js` - Közvetlenül az oldal kontextusában (`MAIN` world) futó kód a felugró ablakok és injektált scriptek blokkolására.
* `popup.html` & `popup.js` - A kiterjesztés ikonjára kattintva megjelenő letisztult felhasználói felület és a számláló.

---

## 📜 Licenc

Nyílt forráskódú projekt. Szabadon módosíthatod, ellenőrizheted és testreszabhatod – nincsenek elrejtett kódok, nincsen adatlopás.
