from django import forms
from utils.fields import ArrayField2D

from . import models

class DemoModelForm(forms.ModelForm):
    demo_array_field = ArrayField2D(column_names=("A", "B", "C", "D", "E"))

    class Meta:
        model = models.DemoModel
        fields = (
            "demo_array_field",
        )
