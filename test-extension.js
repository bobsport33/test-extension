define(["jquery", "qlik"], function ($, qlik) {
    "use strict";

    return {
        definition: {
            type: "items",
            component: "accordion",
            items: {
                dimensions: {
                    uses: "dimensions",
                },
                sorting: {
                    uses: "sorting",
                },
                appearance: {
                    uses: "settings",
                },
            },
        },
        paint: function ($element, layout) {
            var hc = layout.qHyperCube;

            // Generate unique container ID based on extension ID
            var containerId = "extension-container-" + layout.qInfo.qId;

            const container = document.getElementById(containerId);

            if (!container) {
                // Create a container for the checkboxes
                var checkboxContainer = $(
                    '<div id="' +
                        containerId +
                        '" class="checkbox-container"></div>'
                );

                // Append the checkbox container to the element
                $element.append(checkboxContainer);

                // Iterate over all rows
                for (var r = 0; r < hc.qDataPages[0].qMatrix.length; r++) {
                    // Iterate over all cells within a row
                    for (
                        var c = 0;
                        c < hc.qDataPages[0].qMatrix[r].length;
                        c++
                    ) {
                        // Assuming the first dimension contains the field for checkboxes
                        if (c === 0) {
                            var fieldValue =
                                hc.qDataPages[0].qMatrix[r][c].qText;
                            var checkboxId =
                                "checkbox_" + containerId + "_" + r + "_" + c;

                            // Create a checkbox element
                            var checkbox = $(
                                '<input type="checkbox" id="' +
                                    checkboxId +
                                    '" value="' +
                                    fieldValue +
                                    '">'
                            );
                            checkboxContainer.append(checkbox);

                            // Create a label for the checkbox
                            var label = $(
                                '<label for="' +
                                    checkboxId +
                                    '">' +
                                    fieldValue +
                                    "</label>"
                            );
                            checkboxContainer.append(label);

                            // Add line break after each checkbox
                            checkboxContainer.append("<br>");
                        }
                    }
                }

                checkboxContainer
                    .find("input[type='checkbox']")
                    .on("click", function () {
                        var checkedCheckboxes = checkboxContainer.find(
                            "input[type='checkbox']:checked"
                        );
                        var selectedValues = checkedCheckboxes
                            .map(function () {
                                return $(this).val();
                            })
                            .get();

                        // Get the app object
                        var app = qlik.currApp();

                        // Get the field name from the layout
                        var fieldName = hc.qDimensionInfo[0].qGroupFieldDefs[0];

                        // Make selection
                        app.field(fieldName).selectValues(selectedValues);
                    });

                // Function to listen for changes to selection state
                const listener = () => {
                    const { selections } = selectionState;

                    if (selections.length === 0) {
                        checkboxContainer
                            .find("input[type='checkbox']")
                            .each(function () {
                                $(this).prop("checked", false);
                            });
                    } else {
                        selections.forEach((selection) => {
                            if (
                                selection.fieldName ===
                                hc.qDimensionInfo[0].qGroupFieldDefs[0]
                            ) {
                                const { selectedValues } = selection;

                                const values = selectedValues.map(
                                    (v) => v.qName
                                );
                                checkboxContainer
                                    .find("input[type='checkbox']")
                                    .each(function () {
                                        const checkboxValue = $(this).val();

                                        $(this).prop(
                                            "checked",
                                            values.includes(checkboxValue)
                                        );
                                    });
                            }
                        });
                    }
                };

                // Get the selection state
                const selectionState = qlik.currApp().selectionState();
                // Listen for changes to selection state
                selectionState.OnData.bind(listener);
            }
        },
    };
});
