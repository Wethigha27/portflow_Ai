import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Ship,
  MapPin,
  Navigation,
  Gauge,
  Clock,
  AlertTriangle,
  Cloud,
  TrendingUp,
} from 'lucide-react';

// Mock data
const mockShips = [
  {
    id: 1,
    name: 'MSC Gülsün',
    imo_number: 'IMO9811000',
    ship_type: 'Cargo',
    flag: '🇵🇦 Panama',
    current_position: {
      latitude: 36.8,
      longitude: 10.2,
      speed: 12.5,
      course: 245,
      timestamp: '2025-01-15T14:30:00Z',
    },
    history: [
      { date: '2025-01-15', port: 'Marseille', event: 'Départ' },
      { date: '2025-01-14', port: 'Marseille', event: 'Accostage' },
      { date: '2025-01-12', port: 'Barcelone', event: 'Départ' },
    ],
    alerts: [
      { type: 'warning', message: 'Conditions météo défavorables prévues', time: 'Il y a 2h' },
      { type: 'info', message: 'Passage prévu dans zone à trafic dense', time: 'Il y a 5h' },
    ],
    stats: {
      total_voyages: 156,
      avg_delays: 2.3,
      incidents: 3,
      on_time_rate: 94,
    },
  },
];

const ShipTracking = () => {
  const [searchParams] = useSearchParams();
  const shipIdParam = searchParams.get('ship');
  const [selectedShipId, setSelectedShipId] = useState(shipIdParam || '1');

  const ship = mockShips.find((s) => s.id.toString() === selectedShipId) || mockShips[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Suivi des Navires</h1>
              <p className="text-muted-foreground">
                Suivez en temps réel la position et l'état de vos navires
              </p>
            </div>
            <Select value={selectedShipId} onValueChange={setSelectedShipId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Sélectionner un navire" />
              </SelectTrigger>
              <SelectContent>
                {mockShips.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6">
            {/* Ship Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Ship className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-2xl">{ship.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {ship.imo_number} • {ship.ship_type} • {ship.flag}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    En transit
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                    <MapPin className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Position</p>
                      <p className="font-semibold">
                        {ship.current_position.latitude.toFixed(2)}°N,{' '}
                        {ship.current_position.longitude.toFixed(2)}°E
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                    <Gauge className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Vitesse</p>
                      <p className="font-semibold">{ship.current_position.speed} nœuds</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                    <Navigation className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cap</p>
                      <p className="font-semibold">{ship.current_position.course}°</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                    <Clock className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Dernière maj</p>
                      <p className="font-semibold">Il y a 5 min</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Section */}
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="map" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                    <TabsTrigger value="map">Carte</TabsTrigger>
                    <TabsTrigger value="history">Historique</TabsTrigger>
                    <TabsTrigger value="alerts">Alertes</TabsTrigger>
                    <TabsTrigger value="stats">Statistiques</TabsTrigger>
                  </TabsList>

                  <TabsContent value="map" className="mt-6">
                    <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                      <div className="text-center">
                        <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-foreground">Carte interactive</p>
                        <p className="text-muted-foreground">
                          Intégration de la carte en cours de développement
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-6">
                    <div className="space-y-4">
                      {ship.history.map((entry, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                        >
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Ship className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold">{entry.event}</p>
                              <p className="text-sm text-muted-foreground">{entry.date}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">Port: {entry.port}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="alerts" className="mt-6">
                    <div className="space-y-4">
                      {ship.alerts.map((alert, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                        >
                          <div className="flex-shrink-0">
                            {alert.type === 'warning' ? (
                              <AlertTriangle className="h-6 w-6 text-orange-500" />
                            ) : (
                              <Cloud className="h-6 w-6 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium mb-1">{alert.message}</p>
                            <p className="text-sm text-muted-foreground">{alert.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="stats" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Voyages
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <p className="text-2xl font-bold">{ship.stats.total_voyages}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Retard Moyen
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-500" />
                            <p className="text-2xl font-bold">{ship.stats.avg_delays}h</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Incidents
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <p className="text-2xl font-bold">{ship.stats.incidents}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Ponctualité
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <p className="text-2xl font-bold">{ship.stats.on_time_rate}%</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ShipTracking;
