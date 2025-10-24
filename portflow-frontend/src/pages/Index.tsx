import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, TrendingUp, Shield, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Commenté temporairement pour permettre l'accès direct aux dashboards
  // useEffect(() => {
  //   if (user) {
  //     // Rediriger vers le dashboard approprié selon le type d'utilisateur
  //     if (user.user_type === 'admin') {
  //       navigate('/admin/dashboard');
  //     } else if (user.user_type === 'merchant') {
  //       navigate('/merchant/dashboard');
  //     } else {
  //       navigate('/dashboard');
  //     }
  //   }
  // }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-wave">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-ocean">
              <Ship className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">PortFlow AI</span>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/login')}>
              Connexion
            </Button>
            <Button className="bg-gradient-ocean text-white hover:opacity-90" onClick={() => navigate('/register')}>
              S'inscrire
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-6 text-5xl font-bold leading-tight text-foreground md:text-6xl">
            Prédisez les retards maritimes
            <br />
            avec l'Intelligence Artificielle
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
            PortFlow AI combine Machine Learning et Blockchain pour optimiser vos expéditions
            maritimes et anticiper les retards avant qu'ils n'arrivent.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-ocean px-8 text-lg text-white hover:opacity-90"
              onClick={() => navigate('/register')}
            >
              Commencer gratuitement
            </Button>
            <Button size="lg" variant="outline" className="px-8 text-lg">
              En savoir plus
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Ship,
                title: 'Suivi en temps réel',
                description: 'Suivez vos navires et leurs positions via MarineTraffic API',
              },
              {
                icon: TrendingUp,
                title: 'Prédictions IA',
                description: 'Modèles ML avancés pour prévoir les retards avec précision',
              },
              {
                icon: Shield,
                title: 'Blockchain Hedera',
                description: 'Traçabilité et transparence grâce à la blockchain',
              },
              {
                icon: Waves,
                title: 'Météo maritime',
                description: 'Données météo en temps réel pour optimiser vos routes',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 shadow-lg transition-transform hover:scale-105"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-ocean">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground">Prêt à optimiser vos expéditions ?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Rejoignez la plateforme collaborative africaine pour le transport maritime
          </p>
          <Button
            size="lg"
            className="bg-gradient-ocean px-8 text-lg text-white hover:opacity-90"
            onClick={() => navigate('/register')}
          >
            Créer mon compte
          </Button>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 PortFlow AI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
