import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from expenses.models import Expense
from datetime import date


@pytest.fixture
def user():
    return User.objects.create_user(
        username='testuser',
        password='testpass123'
    )


@pytest.fixture
def client(user):
    api_client = APIClient()
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def expense(user):
    return Expense.objects.create(
        owner=user,
        title='Groceries',
        amount='85.50',
        category='food',
        date=date(2026, 4, 1),
    )


@pytest.mark.django_db
def test_create_expense(client):
    response = client.post('/api/expenses/', {
        'title': 'Bus pass',
        'amount': '45.00',
        'category': 'transport',
        'date': '2026-04-05',
    }, format='json')

    assert response.status_code == 201
    assert response.data['title'] == 'Bus pass'
    assert response.data['category'] == 'transport'


@pytest.mark.django_db
def test_retrieve_expense(client, expense):
    response = client.get(f'/api/expenses/{expense.id}/')

    assert response.status_code == 200
    assert response.data['title'] == 'Groceries'
    assert response.data['amount'] == '85.50'


@pytest.mark.django_db
def test_update_expense(client, expense):
    response = client.patch(f'/api/expenses/{expense.id}/', {
        'title': 'Weekly groceries',
    }, format='json')

    assert response.status_code == 200
    assert response.data['title'] == 'Weekly groceries'


@pytest.mark.django_db
def test_delete_expense(client, expense):
    response = client.delete(f'/api/expenses/{expense.id}/')

    assert response.status_code == 204
    assert Expense.objects.filter(id=expense.id).count() == 0


@pytest.mark.django_db
def test_cannot_access_other_users_expense(user):
    other_user = User.objects.create_user(
        username='otheruser',
        password='otherpass123'
    )
    other_expense = Expense.objects.create(
        owner=other_user,
        title='Private expense',
        amount='100.00',
        category='other',
        date=date(2026, 4, 1),
    )

    other_client = APIClient()
    other_client.force_authenticate(user=user)

    response = other_client.get(f'/api/expenses/{other_expense.id}/')

    assert response.status_code == 404


@pytest.mark.django_db
def test_unauthenticated_user_cannot_access_expenses():
    unauthenticated_client = APIClient()
    response = unauthenticated_client.get('/api/expenses/')
    assert response.status_code == 401


@pytest.mark.django_db
def test_category_report(client, expense):
    response = client.get('/api/expenses/report/by-category/')

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]['category'] == 'food'
    assert response.data[0]['count'] == 1


@pytest.mark.django_db
def test_monthly_report(client, expense):
    response = client.get('/api/expenses/report/monthly/')

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]['month'] == '2026-04'
    assert response.data[0]['count'] == 1