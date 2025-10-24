import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-wave flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <Shield className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Accès Non Autorisé
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
        
        <div className="space-x-4">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Retour
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-ocean text-white hover:opacity-90"
          >
            Accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
