from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    """Admin can do anything; others can only read."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'ADMIN'
        )


class HasCoursePurchased(BasePermission):
    """Check if user has purchased the course."""
    message = "You must purchase this course to access this content."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == 'ADMIN':
            return True
        course_id = view.kwargs.get('course_pk') or view.kwargs.get('pk')
        if not course_id:
            return False
        return request.user.purchases.filter(
            course_id=course_id, payment_status='COMPLETED'
        ).exists()
