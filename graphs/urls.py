from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("data/<str:data_id>", views.display_data, name="display_data"),
    path("data/<str:data_id>/all", views.all_data, name="all_data"),
    
    # API Routes
    path("data/<int:data_id>/json", views.json_data, name="json_data"),
    path("data/<int:data_id>/json/labels", views.json_labels, name="json_labels"),
    path("data/<int:data_id>/json/rows", views.json_rows, name="json_rows"),
    path("data/<int:data_id>/json/values", views.json_values, name="json_values"),
    path("data/<int:data_id>/json/<str:row_nmb>", views.json_row_items, name="json_row_items")
]