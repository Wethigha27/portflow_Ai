import { Ship, Anchor, TrendingUp, AlertTriangle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatCard } from '@/components/dashboard/StatCard';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold text-foreground">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Vue d'ensemble de vos expéditions et prédictions
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Navires suivis"
              value={24}
              icon={Ship}
              trend={{ value: 12, isPositive: true }}
              variant="default"
            />
            <StatCard
              title="Ports actifs"
              value={8}
              icon={Anchor}
              trend={{ value: 3, isPositive: true }}
              variant="success"
            />
            <StatCard
              title="Prédictions IA"
              value={156}
              icon={TrendingUp}
              trend={{ value: 8, isPositive: true }}
              variant="default"
            />
            <StatCard
              title="Alertes actives"
              value={5}
              icon={AlertTriangle}
              trend={{ value: 2, isPositive: false }}
              variant="warning"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-card-foreground">
                Dernières expéditions
              </h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-muted p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-ocean">
                        <Ship className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Navire MSC Oscar</p>
                        <p className="text-sm text-muted-foreground">Lagos → Abidjan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-success">En route</p>
                      <p className="text-sm text-muted-foreground">ETA: 2h 30min</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-card-foreground">
                Alertes récentes
              </h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 rounded-lg bg-muted p-4">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Risque de retard détecté</p>
                      <p className="text-sm text-muted-foreground">
                        Mauvaises conditions météo sur la route du Maersk Line
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
