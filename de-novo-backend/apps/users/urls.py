"""
URL routes for User app.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/<int:user_id>/', views.UserProfileView.as_view(), name='user_profile'),
    path('profile/update/', views.UpdateProfileView.as_view(), name='update_profile'),
    path('profile/avatar/', views.AvatarUploadView.as_view(), name='avatar_upload'),
    path('profile/public-key/', views.UpdatePublicKeyView.as_view(), name='update_public_key'),
    path('profile/onboarding/complete/', views.CompleteOnboardingView.as_view(), name='complete_onboarding'),
    
    # Accessibility Settings
    path('settings/accessibility/', views.AccessibilitySettingsView.as_view(), name='accessibility_settings'),
    
    # Contacts
    path('contacts/', views.ContactListView.as_view(), name='contacts'),
    path('contacts/add/', views.AddContactView.as_view(), name='add_contact'),
    path('contacts/<int:contact_id>/remove/', views.RemoveContactView.as_view(), name='remove_contact'),
    path('contacts/<int:contact_id>/block/', views.BlockUserView.as_view(), name='block_user'),
    path('contacts/<int:contact_id>/unblock/', views.UnblockUserView.as_view(), name='unblock_user'),
    
    # Search
    path('search/', views.UserSearchView.as_view(), name='user_search'),
    
    # Online Status
    path('status/online/', views.SetOnlineStatusView.as_view(), name='set_online'),
]
