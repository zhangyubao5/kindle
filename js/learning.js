/* Clock and vocabulary card. ES5 syntax for older Kindle browsers. */
(function () {
    var lastMinute = "";
    var currentIndex = -1;
    var words = window.KINDLE_N5_WORDS || [];
    var interval = 30 * 60 * 1000;
    var lastWordAt = 0;

    function put(id, value) {
        var element = document.getElementById(id);
        if (element) { element.textContent = value; }
    }

    function clockMoment() {
        var value = moment(new Date());
        if (typeof utcOffset !== "undefined" && utcOffset && utcOffset !== "local" && utcOffset !== "auto") {
            return value.utcOffset(utcOffset, false);
        }
        if ((typeof utcOffset === "undefined" || !utcOffset || utcOffset === "auto") &&
            typeof dataTimeZone === "number") {
            return value.utcOffset(dataTimeZone / 60, false);
        }
        return value;
    }

    function updateClock() {
        var value = clockMoment();
        var stamp = value.format("YYYY-MM-DD HH:mm Z");
        if (stamp !== lastMinute) {
            lastMinute = stamp;
            put("liveClock", value.format("HH:mm"));
            put("date", value.format("ddd, D MMM YYYY"));
            var label = "Device time";
            if (typeof utcOffset !== "undefined" && utcOffset && utcOffset !== "auto" && utcOffset !== "local") {
                label = "UTC" + value.format("Z");
            } else if ((typeof utcOffset === "undefined" || !utcOffset || utcOffset === "auto") &&
                typeof dataTimeZone === "number") {
                label = "Location time · UTC" + value.format("Z");
            }
            put("clockZone", label);
        }
    }

    function nextWord() {
        if (!words.length) {
            put("japaneseWord", "Word list unavailable");
            return;
        }
        // Choose uniformly from the other words, so the next word never repeats immediately.
        var index;
        if (words.length === 1 || currentIndex < 0) {
            index = Math.floor(Math.random() * words.length);
        } else {
            index = Math.floor(Math.random() * (words.length - 1));
            if (index >= currentIndex) { index += 1; }
        }
        currentIndex = index;
        var entry = words[index];
        put("japaneseWord", entry.word);
        put("japaneseReading", entry.reading);
        put("japaneseRomaji", entry.romaji);
        put("japaneseMeaning", entry.meaning);
        put("wordCount", words.length + " N5 study words · changes every 30 min");
        var card = document.getElementById("wordCard");
        card.className = entry.meaning.length > 100 ? "word-card long-meaning" : "word-card";
        lastWordAt = new Date().getTime();
    }

    window.addEventListener("load", function () {
        updateClock();
        nextWord();
        document.getElementById("nextWord").onclick = nextWord;
        // Only change the clock text once per minute to limit e-ink redraws.
        // Checking elapsed time also handles a Kindle waking up from sleep.
        window.setInterval(function () {
            updateClock();
            if (new Date().getTime() - lastWordAt >= interval) { nextWord(); }
        }, 15000);
    });
}());
