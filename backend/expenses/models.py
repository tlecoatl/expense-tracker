from django.db import models
from django.contrib.auth.models import User


class Category(models.TextChoices):
    FOOD = 'food', 'Food'
    TRANSPORT = 'transport', 'Transport'
    HOUSING = 'housing', 'Housing'
    ENTERTAINMENT = 'entertainment', 'Entertainment'
    HEALTHCARE = 'healthcare', 'Healthcare'
    SHOPPING = 'shopping', 'Shopping'
    UTILITIES = 'utilities', 'Utilities'
    OTHER = 'other', 'Other'


class Expense(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=Category.choices, default=Category.OTHER)
    date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.title} - ${self.amount}"