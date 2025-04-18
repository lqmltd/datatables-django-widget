from django import forms

from . import models

class DemoModelUpdateForm(forms.ModelForm):
    class Meta:
        model = models.DemoModel
        fields = (
            "demo_array_field",
        )
