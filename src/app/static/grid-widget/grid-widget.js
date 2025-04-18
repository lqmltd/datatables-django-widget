const grid_widget_data = {};
const grid_widget_editors = {};
const grid_widget_tables = {};

// Variable which determines whether to prevent the user reloading the page
let anything_edited = false;
// Show a warning to the user when they are reloading the page, if anything has been edited
window.onbeforeunload = () => {
    return anything_edited;
};

function syncGridWidgetInputValue(gw) {
    /// Store the current value of the grid widget in the hidden field that the form uses for submission

    // Prevent the user reloading the page
    anything_edited = true;

    // Re-number the remaining rows starting from 0 again
    grid_widget_data[gw.id].forEach((row, ind) => {
        row[0] = ind;
    })
    // Strip first item (containing row index) from data
    const data_no_index_column = grid_widget_data[gw.id].map((row) => {
        return row.slice(1);
    })
    // Update hidden input with URI encoded value
    document.getElementsByName(gw.dataset.gridWidgetInputName)[0].value = encodeURIComponent(JSON.stringify(data_no_index_column));
    // Refresh the table's data
    grid_widget_tables[gw.id].ajax.reload();
}

function insertRow(gw, column_names_list, new_row_index) {
    /// Insert a new row into the grid widget

    // Wipe all tooltips, so we can re-initialise them when the new row is added
    disposeTooltips();
    // Create a new empty row (with a row ID of -1, which will be fixed by syncGridWidgetInputValue)
    const new_row = [-1, ...column_names_list.map((_) => "")];
    // Insert the new row into the data store
    grid_widget_data[gw.id].splice(new_row_index, 0, new_row)
    // Update the data table with the new data
    syncGridWidgetInputValue(gw);
    // Re-initialise tooltips, now the new row is here
    initialiseTooltips();
}

window.onload = () => {
    // Find all grid widgets on the page
    const gw_elements = document.getElementsByClassName("grid-widget");
    for (let i = 0; i < gw_elements.length; i++) {
        // Container div
        const gw = gw_elements[i];
        // Table element
        const gw_table = gw.querySelector("table");

        console.log(gw)
        console.log(gw_table)

        // Initialise column options for table and editor
        const column_names_list = gw.dataset.gridWidgetColumnNames.split(",")
        const editor_fields = column_names_list.map((col, ind) => {
            return {label: col, name: ind + 1, data: ind + 1, type: "textareaEditor", canReturnSubmit: true,}
        });
        const table_columns = column_names_list.map((col, ind) => {
            return {data: ind + 1}
        });

        // Initialise field data
        const initial_value = JSON.parse(decodeURIComponent(gw.dataset.gridWidgetValue));
        grid_widget_data[gw.id] = initial_value.map((row, ind) => {
            return [ind, ...row]
        })

        // Initialise editor
        grid_widget_editors[gw.id] = new DataTable.Editor({
            idSrc: 0,  // Tell the editor that the unique ID of the row, is the first element of the row
            ajax: function (method, url, data, success, error) {
                // This function is called when data is updated
                // data example value:
                // {data: {1: {1: 'a', 2: '3'}}, action: 'edit'}
                if (data.action === "edit") {
                    // Go through each edit
                    for (let row_index in data.data) {
                        // Go through each column in the edit
                        for (let col_index in data.data[row_index]) {
                            // Update the data variable
                            grid_widget_data[gw.id][row_index][col_index] = data.data[row_index][col_index];
                        }
                    }
                } else if (data.action === "remove") {
                    // Go through each row to be deleted
                    for (let row_index in data.data) {
                        // We are given the data for the row to be deleted
                        // Get the row ID (the first value in the array, that is artificially added just to track things for datatables)
                        const row_id_to_remove = data.data[row_index][0];
                        // Find the index of the row matching that row ID
                        let row_index_to_remove;
                        for (let row_index_2 in grid_widget_data[gw.id]) {
                            if (grid_widget_data[gw.id][row_index_2][0] === row_id_to_remove) {
                                row_index_to_remove = row_index_2;
                                break;
                            }
                        }
                        if (row_index_to_remove) {
                            // Remove the row
                            grid_widget_data[gw.id].splice(row_index_to_remove, 1);
                        } else {
                            console.log(`Couldn't find row to delete, matching row_id '${row_id_to_remove}'`);
                        }
                    }
                } else {
                    return;
                }
                // Sync the new data to the data store, and visually update the datatable
                syncGridWidgetInputValue(gw);
                // Tell the editor we've successfully updated the data
                success({error: false});
            },
            fields: editor_fields,
            table: gw_table,
        });

        disposeTooltips();  // Wipe all tooltips, so we can re-initialise them after we create the table
        grid_widget_tables[gw.id] = new DataTable(gw_table, {
            paging: false, // Disable pagination
            info: false,  // Disable "X items of Y" text
            ordering: false,  // Disable sorting
            // Tell the table to pull data from the data variable
            ajax: function (data, callback, settings) {
                callback({
                    data: grid_widget_data[gw.id]
                })
            },
            columns: [
                // Insert rows buttons
                {
                    data: null,
                    defaultContent: `
                      <div class="d-flex flex-column">
                        <button class="row-insert-above btn btn-link d-flex p-0" type="button" data-bs-toggle="tooltip" title="Insert row above"><i class="bi bi-plus"></i><i class="bi bi-caret-up"></i></button>
                        <button class="row-insert-below btn btn-link d-flex p-0" type="button" data-bs-toggle="tooltip" title="Insert row below"><i class="bi bi-plus"></i><i class="bi bi-caret-down"></i></button>
                      </div>
                    `,
                    className: 'dt-center py-0',
                    orderable: false
                },
                // Actual columns
                ...table_columns,
                // Delete button
                {
                    data: null,
                    defaultContent: `
                      <div class="d-flex">
                        <button class="row-remove btn btn-link py-0 px-1" type="button" data-bs-toggle="tooltip" title="Delete row"><i class="bi bi-trash"></i></button>
                      </div>
                    `,
                    className: 'dt-center',
                    orderable: false
                },
            ],
            layout: {
                topEnd: null,  // Disable search box
            },
            // Enable Excel-style cell selection
            keys: {
                columns: ':not(:last-child):not(:first-child)',  // Don't allow selecting first and last columns (containing buttons)
            },
            // Add search boxes to the top of each column
            initComplete: function () {
                this.api()
                    .columns(':not(:last-child):not(:first-child)')  // Don't add search on first and last columns (containing buttons)
                    .every(function () {
                        let column = this;

                        // Create input element
                        let input = document.createElement('input');
                        input.placeholder = "Filter...";
                        input.style = "width: 100%;";  // Make the input take the width of the column
                        column.header(1).appendChild(input);  // Add the search box to the second header row (first row is column headers)

                        // Event listener for user input
                        input.addEventListener('keyup', () => {
                            if (column.search() !== this.value) {
                                column.search(input.value).draw();
                            }
                        });
                    });
            }
        });
        // Re-initialise tooltips for dynamically added tooltips on buttons
        initialiseTooltips();

        // Insert row above button
        grid_widget_tables[gw.id].on('click', 'tbody button.row-insert-above', function (e) {
            const new_row_index = grid_widget_tables[gw.id].cells(this.parentNode.parentNode, ':first')[0][0].row;
            insertRow(
                gw, column_names_list, new_row_index
            )
        });

        // Insert row below button
        grid_widget_tables[gw.id].on('click', 'tbody button.row-insert-below', function (e) {
            const new_row_index = grid_widget_tables[gw.id].cells(this.parentNode.parentNode, ':first')[0][0].row + 1;
            insertRow(
                gw, column_names_list, new_row_index
            )
        });

        // Trigger row delete when delete button clicked
        grid_widget_tables[gw.id].on('click', 'tbody button.row-remove', function (e) {
            grid_widget_editors[gw.id].remove(this.closest('tr'), {
                title: 'Delete row',
                message: 'Are you sure you wish to delete this row?',
                buttons: 'Delete'
            });
        });

        // Open single-cell editor when enter key is pressed
        grid_widget_tables[gw.id].on('key', function (e, datatable, key, cell, originalEvent) {
            // When enter key is clicked
            if (key === 13) {
                // Prevent the enter key being typed into the newly opened editor
                originalEvent.preventDefault();

                // Unfocus currently focussed cell
                grid_widget_tables[gw.id].cell.blur();

                // Open inline editor
                grid_widget_editors[gw.id].one(
                    // When the editor is closed
                    'close',
                    function () {
                        setTimeout(function () {
                            // Re-enable Excel-style cell selection
                            grid_widget_tables[gw.id].keys.enable();
                            // Reselect the cell just edited (it gets deselected when you edit a cell)
                            cell.focus();
                        }, 50);
                    }
                ).inline(cell.node(), {  // Open an editor in that cell
                    onBlur: 'submit'  // Save data when clicking out of cell (usually just saves on enter key)
                });

                // Disable Excel-style cell selection whilst we are editing a cell
                grid_widget_tables[gw.id].keys.disable();
            }
        })

        // Open single-cell editor when cell double-clicked
        grid_widget_tables[gw.id].on('dblclick', function (e) {
            // Only run when double-clicking a cell
            if (e.target.tagName !== "TD") {
                return;
            }
            // If an editor is already open, don't open another
            if (grid_widget_editors[gw.id].display() !== false) {
                return
            }
            const selected_cell = grid_widget_tables[gw.id].cell(".focus");
            const selected_cell_node = selected_cell.node();

            // Open inline editor
            grid_widget_editors[gw.id].one(
                // When the editor is closed
                'close',
                function () {
                    setTimeout(function () {
                        // Re-enable Excel-style cell selection
                        grid_widget_tables[gw.id].keys.enable();
                        // Reselect the cell just edited (it gets deselected when you edit a cell)
                        selected_cell.focus();
                    }, 50);
                }
            ).inline(selected_cell_node, {
                onBlur: 'submit'  // Save data when clicking out of cell (usually just saves on enter key)
            });

            // Unfocus currently focussed cell
            grid_widget_tables[gw.id].cell.blur();
            // Disable Excel-style cell selection whilst we are editing a cell
            grid_widget_tables[gw.id].keys.disable();
        })

        // If a cell is clicked, close any open editors
        //   deals with an edge case, where the textarea doesn't fill the whole cell, and clicking that cell doesn't blur the editor
        grid_widget_tables[gw.id].on('click', function (e) {
            // Only run when double-clicking a cell
            if (e.target.tagName !== "TD") {
                return;
            }
            // Close and save any open editors
            grid_widget_editors[gw.id].blur()
        })
    }
}
