
from django.urls import path
from api.controllers.bill import CreateBill

urlpatterns = [
    path('create', CreateBill.as_view()),
    path('post', CreateBill.as_view()),
]
