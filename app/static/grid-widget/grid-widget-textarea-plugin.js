/*!
* Grid Widget Textarea plugin
*
* Custom datatables plugin which adds a textarea input, where hitting enter closes the editor instead of inserting a new-line
*/

(function (DataTable) {
    var Editor = DataTable.Editor;
    var _fieldTypes = DataTable.ext.editorFields;

    _fieldTypes.textareaEditor = {
        create: function (conf) {
            conf._enabled = true;

            // Create the container for the input
            conf._input = document.createElement('div');
            conf._input.id = Editor.safeId(conf.id);
            conf._input.className = 'textarea-editor-container';

            // Create the textarea element
            let textarea = document.createElement('textarea');
            textarea.className = 'textarea-editor';
            textarea.rows = conf.rows || 4; // Default to 4 rows, can be configured
            textarea.cols = conf.cols || 50; // Default column width

            // Add the textarea to the container
            conf._input.appendChild(textarea);

            // Store reference to the textarea for easier access
            conf._textarea = textarea;

            // Add event listener for the Enter key to save
            textarea.addEventListener('keydown', (e) => {
                if (conf._enabled && e.key === 'Enter' && !e.shiftKey && conf.canReturnSubmit) {
                    e.preventDefault(); // Prevent default Enter behavior (new line)
                    this.submit(); // Submit the form
                }
            });

            return conf._input;
        },

        get: function (conf) {
            return conf._textarea.value;
        },

        set: function (conf, val) {
            conf._textarea.value = val !== null ? val : '';
        },

        enable: function (conf) {
            conf._enabled = true;
            conf._textarea.disabled = false;
        },

        disable: function (conf) {
            conf._enabled = false;
            conf._textarea.disabled = true;
        },
    };
})(DataTable);
