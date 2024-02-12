from django.urls import path
from .views import RegisterView, LoginView, UserView, UserLogout

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('user', UserView.as_view(), name='user'),
    path('logout', UserLogout.as_view(), name='logout')
]
