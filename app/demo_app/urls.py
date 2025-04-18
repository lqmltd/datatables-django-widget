from django.urls import path

from . import views

app_name = "demo_app"
urlpatterns = [
    path(
        "",
        view=views.DemoModelListView.as_view(),
        name="demo_model_list",
    ),
    path(
        "create",
        view=views.DemoModelCreateView.as_view(),
        name="demo_model_create",
    ),
    path(
        "<int:pk>/",
        view=views.DemoModelUpdateView.as_view(),
        name="demo_model_update",
    ),
]
