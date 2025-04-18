from django.urls import reverse_lazy
from django.views import generic

from . import forms, models


class DemoModelListView(generic.ListView):
    model = models.DemoModel
    template_name = "demo_app/demo_model/demo_model_list.html"


class DemoModelUpdateView(generic.UpdateView):
    model = models.DemoModel
    template_name = "demo_app/demo_model/demo_model_update.html"
    form_class = forms.DemoModelUpdateForm
    success_url = reverse_lazy("demo_app:demo_model_list")
