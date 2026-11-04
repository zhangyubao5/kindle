/* Small ES5 fallbacks used by the bundled clock libraries on old WebKit. */
(function () {
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (value, from) {
            var length = this.length >>> 0, i = Number(from) || 0;
            i = i < 0 ? Math.max(0, length + Math.ceil(i)) : Math.floor(i);
            for (; i < length; i++) { if (i in this && this[i] === value) { return i; } }
            return -1;
        };
    }
    if (!Array.prototype.map) {
        Array.prototype.map = function (fn, context) {
            var length = this.length >>> 0, result = new Array(length);
            for (var i = 0; i < length; i++) { if (i in this) { result[i] = fn.call(context, this[i], i, this); } }
            return result;
        };
    }
    if (!Array.prototype.filter) {
        Array.prototype.filter = function (fn, context) {
            var result = [], length = this.length >>> 0;
            for (var i = 0; i < length; i++) { if (i in this && fn.call(context, this[i], i, this)) { result.push(this[i]); } }
            return result;
        };
    }
    if (!Object.keys) {
        Object.keys = function (object) {
            var result = [];
            for (var key in object) { if (Object.prototype.hasOwnProperty.call(object, key)) { result.push(key); } }
            return result;
        };
    }
}());
