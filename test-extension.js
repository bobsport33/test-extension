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
        initialProperties: {
            qHyperCubeDef: {
                qDimensions: [],
                qInitialDataFetch: [
                    {
                        qWidth: 10,
                        qHeight: 100,
                    },
                ],
            },
        },
        paint: function ($element, layout) {
            var hc = layout.qHyperCube;

            // Generate unique container ID based on extension ID and index
            var containerId =
                "extension-container-" +
                layout.qInfo.qId +
                "-" +
                layout.qInfo.qType;

            const container = document.getElementById(containerId);

            if (!container) {
                // Create a container for the checkboxes
                var checkboxContainer = $("<div/>", {
                    id: containerId,
                    class: "checkbox-container",
                });

                // Append the checkbox container to the element
                $element.append(checkboxContainer);

                // Iterate over all rows
                hc.qDataPages[0].qMatrix.forEach((row, index) => {
                    const fieldValue = row[0].qText;
                    const checkboxId = `checkbox_${containerId}_${index}_0`;

                    // Create a checkbox element
                    var checkbox = $("<input/>", {
                        type: "checkbox",
                        id: checkboxId,
                        value: fieldValue,
                    });

                    // Create a label for the checkbox
                    var label = $("<label/>", {
                        for: checkboxId,
                        text: fieldValue,
                    });

                    // Append checkbox and label to the container
                    checkboxContainer.append(checkbox, label, $("<br/>"));
                });

                checkboxContainer.on(
                    "click",
                    "input[type='checkbox']",
                    function () {
                        var selectedValues = checkboxContainer
                            .find("input[type='checkbox']:checked")
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
                    }
                );

                // Function to listen for changes to selection state
                const listener = () => {
                    const { selections } = selectionState;

                    if (selections.length === 0) {
                        checkboxContainer
                            .find("input[type='checkbox']")
                            .prop("checked", false);
                    } else {
                        const selectedValues = selections
                            .filter(
                                (selection) =>
                                    selection.fieldName ===
                                    hc.qDimensionInfo[0].qGroupFieldDefs[0]
                            )
                            .map((selection) => selection.getSelectedValues())
                            .flat()
                            .map((value) => value.qName);

                        checkboxContainer
                            .find("input[type='checkbox']")
                            .each(function () {
                                const checkboxValue = $(this).val();
                                $(this).prop(
                                    "checked",
                                    selectedValues.includes(checkboxValue)
                                );
                            });
                    }
                };

                // Get the selection state
                const selectionState = qlik.currApp().selectionState();

                // Listen for changes to selection state
                selectionState.OnData.bind(listener);
                selectionState.OnSelectionsApplied.bind(listener);
            }
        },
    };
});
