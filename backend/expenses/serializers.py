from rest_framework import serializers
from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = [
            'id',
            'title',
            'amount',
            'category',
            'date',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class ExpenseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    class Meta:
        model = Expense
        fields = ['id', 'title', 'amount', 'category', 'date']


class CategorySummarySerializer(serializers.Serializer):
    """Serializer for category totals in reports."""
    category = serializers.CharField()
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    count = serializers.IntegerField()


class MonthlyReportSerializer(serializers.Serializer):
    """Serializer for monthly spending totals."""
    month = serializers.CharField()
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    count = serializers.IntegerField()