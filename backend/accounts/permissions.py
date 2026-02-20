from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """Allow access only to users with ADMIN role."""
    message = "You must be an admin to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'ADMIN'
        )


class IsStudentRole(BasePermission):
    """Allow access only to users with STUDENT role."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'STUDENT'
        )


class IsOwnerOrAdmin(BasePermission):
    """Allow access to object owner or admin."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        return obj == request.user
