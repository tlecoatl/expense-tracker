from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from .models import Expense, Category
from .serializers import (
    ExpenseSerializer,
    ExpenseListSerializer,
    CategorySummarySerializer,
    MonthlyReportSerializer,
)


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class ExpenseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['title', 'notes']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date']

    def get_queryset(self):
        queryset = Expense.objects.filter(owner=self.request.user)

        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)

        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return ExpenseListSerializer
        return ExpenseSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], url_path='report/by-category')
    def report_by_category(self, request):
        queryset = self.get_queryset()
        data = (
            queryset
            .values('category')
            .annotate(total=Sum('amount'), count=Count('id'))
            .order_by('-total')
        )
        serializer = CategorySummarySerializer(data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='report/monthly')
    def report_monthly(self, request):
        queryset = self.get_queryset()
        data = (
            queryset
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(total=Sum('amount'), count=Count('id'))
            .order_by('-month')
        )
        formatted = [
            {
                'month': entry['month'].strftime('%Y-%m'),
                'total': entry['total'],
                'count': entry['count'],
            }
            for entry in data
        ]
        serializer = MonthlyReportSerializer(formatted, many=True)
        return Response(serializer.data)