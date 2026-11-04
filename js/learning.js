/* Clock and five-word batches. ES5 syntax for older Kindle browsers. */
(function () {
    var words = window.KINDLE_N5_WORDS || [], currentIndices = [], lastMinute = "", lastWordAt = 0;
    var interval = 30 * 60 * 1000;
    function parameter(name) {
        var match = new RegExp("[?&]" + name + "=([^&#]*)").exec(window.location.search);
        return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : "";
    }
    function put(id, value) { document.getElementById(id).textContent = value; }
    function clockMoment() {
        var value = moment(new Date()), offset = parameter("utcOffset");
        if (/^[+-](?:0\d|1[0-4]):[0-5]\d$/.test(offset)) { value.utcOffset(offset, false); }
        return value;
    }
    function updateClock() {
        var value = clockMoment(), stamp = value.format("YYYY-MM-DD HH:mm Z");
        if (stamp !== lastMinute) {
            lastMinute = stamp;
            put("liveClock", value.format("HH:mm"));
            put("date", value.format("dddd, D MMMM YYYY"));
            put("clockZone", /^[+-]/.test(parameter("utcOffset")) ? "UTC" + value.format("Z") : "Device time");
        }
        var mode = parameter("night"), hours = /^(\d{1,2})-(\d{1,2})$/.exec(mode), dark = mode === "on";
        if (hours) {
            var from = Number(hours[1]), to = Number(hours[2]), hour = value.hour();
            dark = from > to ? hour >= from || hour < to : hour >= from && hour < to;
        }
        document.documentElement.className = dark ? "night" : "";
    }
    function fit() {
        var nw = window.innerWidth || document.documentElement.clientWidth;
        var nh = window.innerHeight || document.documentElement.clientHeight;
        var rotation = parameter("rotation"), sideways = rotation === "ll" || rotation === "lr";
        var width = sideways ? nh : nw, height = sideways ? nw : nh, page = document.getElementById("page");
        page.style.width = width + "px"; page.style.height = height + "px";
        var transform = "";
        if (rotation === "ll") { transform = "translate(" + nw + "px,0) rotate(90deg)"; }
        if (rotation === "lr") { transform = "translate(0," + nh + "px) rotate(-90deg)"; }
        if (rotation === "up") { transform = "translate(" + nw + "px," + nh + "px) rotate(180deg)"; }
        page.style.transform = transform; page.style.webkitTransform = transform;
        document.documentElement.style.fontSize = Math.min(height / 100, width / 75) + "px";
        document.getElementById("liveClock").style.fontSize = Math.floor(Math.min(height * 0.23, width * 0.28)) + "px";
    }
    function cell(row, className, text, lang) {
        var element = document.createElement("td");
        element.className = className; element.textContent = text;
        if (lang) { element.setAttribute("lang", lang); }
        row.appendChild(element); return element;
    }
    function nextWords() {
        var pool = [], i;
        for (i = 0; i < words.length; i++) {
            if (currentIndices.indexOf(i) === -1) { pool.push(i); }
        }
        // Avoid the last set when possible; every set contains distinct entries.
        if (pool.length < Math.min(5, words.length)) {
            pool = []; for (i = 0; i < words.length; i++) { pool.push(i); }
        }
        currentIndices = [];
        var rows = document.getElementById("wordRows");
        while (rows.firstChild) { rows.removeChild(rows.firstChild); }
        for (i = 0; i < 5 && pool.length; i++) {
            var chosen = Math.floor(Math.random() * pool.length), index = pool.splice(chosen, 1)[0];
            currentIndices.push(index);
            var entry = words[index], row = document.createElement("tr");
            cell(row, "word-number", String(i + 1));
            cell(row, "word-japanese" + (entry.word.length > 5 ? " long-word" : ""), entry.word, "ja");
            var reading = cell(row, "word-reading", entry.reading, "ja");
            var romaji = document.createElement("span");
            romaji.className = "word-romaji"; romaji.setAttribute("lang", "en");
            romaji.textContent = entry.romaji; reading.appendChild(romaji);
            // Use a compact first gloss, retaining the full meaning in title and JSON.
            var meaning = cell(row, "word-meaning", entry.meaning.split(";")[0], "en");
            meaning.setAttribute("title", entry.meaning); rows.appendChild(row);
        }
        put("wordCount", words.length ? words.length + " study words · new set every 30 min" : "Word list unavailable");
        lastWordAt = new Date().getTime();
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
        window.setInterval(function () {
            updateClock();
            if (new Date().getTime() - lastWordAt >= interval) { nextWords(); }
        }, 15000);
    });
}());
