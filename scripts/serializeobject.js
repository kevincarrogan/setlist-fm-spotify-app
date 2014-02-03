require([
    'scripts/underscore',
], function (underscore) {
    var _ = underscore._,
        serializeObject = function ($el) {
            var arr = $el.serializeArray(),
                data = {};

            _.each(arr, function (kv) {
                data[kv.name] = kv.value;
            });

            return data;
        };

    exports.serializeObject = serializeObject;
});
