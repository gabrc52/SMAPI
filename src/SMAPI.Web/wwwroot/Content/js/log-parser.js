/* globals $ */

var smapi = smapi || {};
var app;
smapi.logParser = function (data, sectionUrl) {
    // internal filter counts
    var stats = data.stats = {
        modsShown: 0,
        modsHidden: 0
    };
    function updateModFilters() {
        // counts
        stats.modsShown = 0;
        stats.modsHidden = 0;
        for (var key in data.showMods) {
            if (data.showMods.hasOwnProperty(key)) {
                if (data.showMods[key])
                    stats.modsShown++;
                else
                    stats.modsHidden++;
            }
        }
    }

    // set local time started
    if(data)
        data.localTimeStarted = ("0" + data.logStarted.getHours()).slice(-2) + ":" + ("0" + data.logStarted.getMinutes()).slice(-2);

    // init app
    app = new Vue({
        el: '#output',
        data: data,
        computed: {
            anyModsHidden: function () {
                return stats.modsHidden > 0;
            },
            anyModsShown: function () {
                return stats.modsShown > 0;
            }
        },
        methods: {
            toggleLevel: function (id) {
                if (!data.enableFilters)
                    return;

                this.showLevels[id] = !this.showLevels[id];
            },

            toggleMod: function (id) {
                if (!data.enableFilters)
                    return;

                var curShown = this.showMods[id];

                // first filter: only show this by default
                if (stats.modsHidden === 0) {
                    this.hideAllMods();
                    this.showMods[id] = true;
                }

                // unchecked last filter: reset
                else if (stats.modsShown === 1 && curShown)
                    this.showAllMods();

                // else toggle
                else
                    this.showMods[id] = !this.showMods[id];

                updateModFilters();
            },

            toggleSection: function (name) {
                if (!data.enableFilters)
                    return;

                this.showSections[name] = !this.showSections[name];
            },

            showAllMods: function () {
                if (!data.enableFilters)
                    return;

                for (var key in this.showMods) {
                    if (this.showMods.hasOwnProperty(key)) {
                        this.showMods[key] = true;
                    }
                }
                updateModFilters();
            },

            hideAllMods: function () {
                if (!data.enableFilters)
                    return;

                for (var key in this.showMods) {
                    if (this.showMods.hasOwnProperty(key)) {
                        this.showMods[key] = false;
                    }
                }
                updateModFilters();
            },

            filtersAllow: function(modId, level) {
                return this.showMods[modId] !== false && this.showLevels[level] !== false;
            },

            sectionsAllow: function (section) {
                return this.showSections[section] !== false;
            }
        }
    });

    /**********
    ** Upload form
    *********/
    var input = $("#input");
    if (input.length) {
        // get elements
        var systemOptions = $("input[name='os']");
        var systemInstructions = $("div[data-os]");
        var submit = $("#submit");

        // instruction OS chooser
        var chooseSystem = function() {
            systemInstructions.hide();
            systemInstructions.filter("[data-os='" + $("input[name='os']:checked").val() + "']").show();
        }
        systemOptions.on("click", chooseSystem);
        chooseSystem();

        // disable submit if it's empty
        var toggleSubmit = function()
        {
            var hasText = !!input.val().trim();
            submit.prop("disabled", !hasText);
        }
        input.on("input", toggleSubmit);
        toggleSubmit();

        // drag & drop file
        input.on({
            'dragover dragenter': function(e) {
                e.preventDefault();
                e.stopPropagation();
            },
            'drop': function(e) {
                var dataTransfer = e.originalEvent.dataTransfer;
                if (dataTransfer && dataTransfer.files.length) {
                    e.preventDefault();
                    e.stopPropagation();
                    var file = dataTransfer.files[0];
                    var reader = new FileReader();
                    reader.onload = $.proxy(function(file, $input, event) {
                        $input.val(event.target.result);
                        toggleSubmit();
                    }, this, file, $("#input"));
                    reader.readAsText(file);
                }
            }
        });
    }
};
