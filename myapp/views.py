# myapp/views.py
from django.http import JsonResponse

def home(request):
    return JsonResponse({"message": "MyApp is working!"})
