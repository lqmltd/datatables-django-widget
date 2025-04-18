from django import forms
from django.template.loader import render_to_string
from django.utils.html import escape


class GridWidget(forms.Widget):
    class Media:
        js = (
            "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js",
            "grid-widget/datatables/datatables.min.js",
            "grid-widget/grid-widget-textarea-plugin.js",
            "grid-widget/grid-widget.js",
        )
        css = {
            "all": (
                "grid-widget/datatables/datatables.min.css",
                "grid-widget/grid-widget.css",
            ),
        }

    def render(self, name, value, attrs=None, renderer=None):
        """
        Expects value to be a URI encoded string of a JSON representation of a 2D array
        (To be used in conjunction with utils.fields.ArrayField2D)
        """

        column_names_str = escape(",".join(self.attrs["column_names"]))

        return render_to_string(
            "utils/widgets/grid-widget.html",
            {
                "name": name,
                "column_names": self.attrs["column_names"],
                "column_names_str": column_names_str,
                "value": value,
            },
        )
