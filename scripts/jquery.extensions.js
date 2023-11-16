(function ($) {
    $.fn.formToJson = function () {
        var formData = $(this).serializeArray();
        var json = {};

        $.each(formData, function (index, field) {
            var keys = field.name.split('.'); // Split field name into keys

            // Create a reference to the current position in the JSON object
            var currentObj = json;

            // Iterate through the keys to build the nested structure
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];

                // If the key doesn't exist in the current object, create it
                if (!currentObj[key]) {
                    if (i === keys.length - 1) {
                        // If it's the last key, set the value
                        currentObj[key] = field.value;
                    } else {
                        // Otherwise, create an empty object for nesting
                        currentObj[key] = {};
                    }
                }

                // Move the reference deeper into the object
                currentObj = currentObj[key];
            }
        });

        return json;
    },

    $.fn.scrollModalBottom = function () {
        var modals = $(this);
        modals.each(function () {
            var modal = $(this);
            var body = modal.find(".modal-body");
            body.animate({ scrollTop: body.prop("scrollHeight") }, 1000);

            modal.animate({ scrollTop: modal.prop("scrollHeight") }, 1000);
        });
    }

}(jQuery));