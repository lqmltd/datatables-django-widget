import json
import urllib.parse

from django import forms

from . import widgets


class ArrayField2DError(Exception):
    pass


class ArrayField2D(forms.Field):
    widget = widgets.GridWidget

    def __init__(self, *args, **kwargs):
        if "column_names" not in kwargs:
            msg = "Missing `column_names` argument"
            raise ArrayField2DError(msg)
        self.column_names = kwargs.pop("column_names")
        if "initial" not in kwargs:
            kwargs["initial"] = [["", "", "", "", ""]]
        super().__init__(*args, **kwargs)

    def widget_attrs(self, widget):
        attrs = super().widget_attrs(widget)
        attrs["column_names"] = self.column_names
        return attrs

    def prepare_value(self, value):
        return urllib.parse.quote(json.dumps(value))

    def to_python(self, value):
        return json.loads(urllib.parse.unquote(value))
