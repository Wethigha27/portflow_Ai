from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class TransactionListView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            "message": "Hedera Blockchain integration will be implemented soon",
            "status": "development"
        })