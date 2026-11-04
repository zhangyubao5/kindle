/* Clock and two-word batches. ES5 syntax for older Kindle browsers. */
(function () {
    var words = window.KINDLE_N5_WORDS || [], currentIndices = [], lastMinute = "", lastWordAt = 0;
    var interval = 30 * 60 * 1000;
    var textScale = 7;
    function parameter(name) {
        var match = new RegExp("[?&]" + name + "=([^&#]*)").exec(window.location.search);
        try { return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : ""; } catch (error) { return ""; }
    }
    function setText(element, value) {
        var property = "textContent" in element ? "textContent" : "innerText";
        if (element[property] !== value) { element[property] = value; }
    }
    function put(id, value) { setText(document.getElementById(id), value); }
    function clockMoment() {
        var value = moment(new Date()), offset = parameter("utcOffset");
        if (offset === "local") { return value; }
        if (/^[+-](?:0\d|1[0-4]):[0-5]\d$/.test(offset)) { return value.utcOffset(offset, false); }
        return value.tz("America/Los_Angeles");
    }
    function updateClock() {
        var value = clockMoment(), stamp = value.format("YYYY-MM-DD HH:mm Z") + parameter("utcOffset");
        if (stamp !== lastMinute) {
            lastMinute = stamp;
            put("liveClock", value.format("HH:mm"));
            put("date", value.format("dddd, D MMMM YYYY"));
            var offset = parameter("utcOffset");
            put("clockZone", offset === "local" ? "Device time" :
                (/^[+-]/.test(offset) ? "UTC" + value.format("Z") : "Pacific time (" + value.zoneAbbr() + ")"));
        }
        var mode = parameter("night"), hours = /^(\d{1,2})-(\d{1,2})$/.exec(mode), dark = mode === "on";
        if (hours) {
            var from = Number(hours[1]), to = Number(hours[2]), hour = value.hour();
            dark = from > to ? hour >= from || hour < to : hour >= from && hour < to;
        }
        var className = dark ? "night" : "";
        if (document.documentElement.className !== className) { document.documentElement.className = className; }
    }
    function fit() {
        var nw = window.innerWidth || document.documentElement.clientWidth;
        var nh = window.innerHeight || document.documentElement.clientHeight;
        var rotation = parameter("rotation");
        if (!rotation || rotation === "auto") { rotation = nh > nw ? "ll" : "normal"; }
        var sideways = rotation === "ll" || rotation === "lr";
        var width = sideways ? nh : nw, height = sideways ? nw : nh, page = document.getElementById("page");
        page.style.width = width + "px"; page.style.height = height + "px";
        var transform = "";
        if (rotation === "ll") { transform = "translate(" + nw + "px,0) rotate(90deg)"; }
        if (rotation === "lr") { transform = "translate(0," + nh + "px) rotate(-90deg)"; }
        if (rotation === "up") { transform = "translate(" + nw + "px," + nh + "px) rotate(180deg)"; }
        page.style.transform = transform; page.style.webkitTransform = transform;
        textScale = Math.min(height / 100, width / 75);
        document.documentElement.style.fontSize = textScale + "px";
        sizeText();
        document.getElementById("liveClock").style.fontSize = Math.floor(Math.min(height * 0.23, width * 0.28)) + "px";
    }
    function cell(row, className, text, lang) {
        var element = document.createElement("td");
        element.className = className; setText(element, text);
        if (lang) { element.setAttribute("lang", lang); }
        row.appendChild(element); return element;
    }
    function nextWords() {
        var pool = [], i;
        for (i = 0; i < words.length; i++) {
            if (currentIndices.indexOf(i) === -1) { pool.push(i); }
        }
        // Avoid the last set when possible; every set contains distinct entries.
        if (pool.length < Math.min(2, words.length)) {
            pool = []; for (i = 0; i < words.length; i++) { pool.push(i); }
        }
        currentIndices = [];
        var rows = document.getElementById("wordRows");
        while (rows.firstChild) { rows.removeChild(rows.firstChild); }
        for (i = 0; i < 2 && pool.length; i++) {
            var chosen = Math.floor(Math.random() * pool.length), index = pool.splice(chosen, 1)[0];
            currentIndices.push(index);
            var entry = words[index], row = document.createElement("tr");
            cell(row, "word-number", String(i + 1));
            cell(row, "word-japanese" + (entry.word.length > 5 ? " long-word" : ""), entry.word, "ja");
            var reading = cell(row, "word-reading", entry.reading, "ja");
            var romaji = document.createElement("span");
            romaji.className = "word-romaji"; romaji.setAttribute("lang", "en");
            setText(romaji, entry.romaji); reading.appendChild(romaji);
            // Use a compact first gloss, retaining the full meaning in title and JSON.
            var meaning = cell(row, "word-meaning", entry.meaning.split(";")[0], "en");
            meaning.setAttribute("title", entry.meaning);
            if (entry.example) {
                var example = cell(row, "word-example", "", "ja");
                var japanese = document.createElement("span");
                japanese.className = "example-ja"; japanese.setAttribute("lang", "ja");
                setText(japanese, entry.example.ja); example.appendChild(japanese);
                var english = document.createElement("span");
                english.className = "example-en"; english.setAttribute("lang", "en");
                setText(english, entry.example.en); example.appendChild(english);
                if (entry.example.tatoeba_id) {
                    var source = document.createElement("a");
                    source.className = "example-source";
                    source.href = "https://tatoeba.org/en/sentences/show/" + entry.example.tatoeba_id;
                    setText(source, "Tatoeba"); example.appendChild(source);
                }
            }
            rows.appendChild(row);
        }
        put("wordCount", words.length ? words.length + " study words · new set every 30 min" : "Word list unavailable");
        lastWordAt = new Date().getTime();
        sizeText();
    }
    function sizeText() {
        var sizes = {
            "word-number": Math.max(10, textScale * 1.4),
            "word-japanese": Math.max(22, textScale * 4.4),
            "word-reading": Math.max(15, textScale * 2.5),
            "word-romaji": Math.max(11, textScale * 1.7),
            "word-meaning": Math.max(15, textScale * 2.4),
            "example-ja": Math.max(16, textScale * 2.5),
            "example-en": Math.max(13, textScale * 2),
            "example-source": 10
        };
        var elements = document.getElementById("wordRows").getElementsByTagName("*");
        for (var i = 0; i < elements.length; i++) {
            var classes = " " + elements[i].className + " ";
            for (var name in sizes) {
                if (classes.indexOf(" " + name + " ") !== -1) { elements[i].style.fontSize = Math.floor(sizes[name]) * (name === "word-japanese" ? 3 : 1) + "px"; }
            }
            if (classes.indexOf(" long-word ") !== -1) { elements[i].style.fontSize = Math.floor(Math.max(20, textScale * 3.2)) * 3 + "px"; }
        }
        document.getElementById("date").style.fontSize = Math.floor(Math.max(17, textScale * 3)) + "px";
        document.getElementById("clockZone").style.fontSize = Math.floor(Math.max(12, textScale * 1.5)) + "px";
        document.getElementById("wordHeading").style.fontSize = Math.floor(Math.max(12, textScale * 1.8)) + "px";
        document.getElementById("wordCount").style.fontSize = Math.floor(Math.max(10, textScale * 1.4)) + "px";
    }
    function tick() {
        updateClock();
        if (new Date().getTime() - lastWordAt >= interval) { nextWords(); }
    }
    function scheduleTick() {
        tick();
        var now = new Date().getTime();
        window.setTimeout(scheduleTick, Math.min(60000 - (now % 60000) + 100, Math.max(100, lastWordAt + interval - now)));
    }
    window.addEventListener("load", function () {
        var settings = [], names = ["utcOffset", "rotation", "night"];
        for (var i = 0; i < names.length; i++) {
            var value = parameter(names[i]);
            if (value) { settings.push(names[i] + "=" + encodeURIComponent(value)); }
        }
        // Old weather credentials are not carried to the settings page.
        document.getElementById("settingsLink").href = "config.html" + (settings.length ? "?" + settings.join("&") : "");
        fit(); updateClock(); nextWords();
        document.getElementById("nextWords").onclick = nextWords;
        window.addEventListener("resize", fit);
        window.addEventListener("focus", tick);
        window.addEventListener("pageshow", tick);
        if (document.addEventListener) { document.addEventListener("visibilitychange", function () { if (!document.hidden) { tick(); } }); }
        scheduleTick();
    });
}());
