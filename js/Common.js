+function($) {
    $.extend({
        inAssoc: function (value, array, deep) {
            for (var i in array) {
                if (array[i] === value) {
                    return i;
                }
                if (deep === true) {
                    return $.inAssoc(value, array[i], deep);
                }
            }

            return -1;
        }
    });
}(jQuery);