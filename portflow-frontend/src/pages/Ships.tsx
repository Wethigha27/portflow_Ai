import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Ship, Eye, EyeOff, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data - à remplacer par les vraies données de l'API
const mockShips = [
  {
    id: 1,
    name: 'MSC Gülsün',
    imo_number: 'IMO9811000',
    ship_type: 'Cargo',
    flag: '🇵🇦 Panama',
    current_position: { latitude: 36.8, longitude: 10.2, speed: 12.5 },
    is_tracked: true,
  },
  {
    id: 2,
    name: 'Ever Given',
    imo_number: 'IMO9811001',
    ship_type: 'Container',
    flag: '🇵🇦 Panama',
    current_position: { latitude: 31.2, longitude: 32.3, speed: 18.3 },
    is_tracked: false,
  },
  {
    id: 3,
    name: 'CMA CGM Antoine',
    imo_number: 'IMO9811002',
    ship_type: 'Container',
    flag: '🇫🇷 France',
    current_position: { latitude: 43.3, longitude: 5.4, speed: 15.7 },
    is_tracked: true,
  },
];

const Ships = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [shipType, setShipType] = useState('all');
  const [trackedShips, setTrackedShips] = useState<number[]>(
    mockShips.filter((s) => s.is_tracked).map((s) => s.id)
  );

  const toggleTracking = (shipId: number) => {
    setTrackedShips((prev) =>
      prev.includes(shipId) ? prev.filter((id) => id !== shipId) : [...prev, shipId]
    );
  };

  const filteredShips = mockShips.filter((ship) => {
    const matchesSearch =
      ship.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ship.imo_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = shipType === 'all' || ship.ship_type === shipType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Navires</h1>
            <p className="text-muted-foreground">
              Gérez et suivez vos navires en temps réel
            </p>
          </div>

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou IMO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={shipType} onValueChange={setShipType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type de navire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="Cargo">Cargo</SelectItem>
                <SelectItem value="Container">Container</SelectItem>
                <SelectItem value="Tanker">Tanker</SelectItem>
                <SelectItem value="Passenger">Passager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredShips.map((ship) => (
              <Card key={ship.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Ship className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{ship.name}</CardTitle>
                    </div>
                    {trackedShips.includes(ship.id) && (
                      <Badge variant="secondary">Suivi</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IMO:</span>
                      <span className="font-medium">{ship.imo_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{ship.ship_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pavillon:</span>
                      <span className="font-medium">{ship.flag}</span>
                    </div>
                    {ship.current_position && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vitesse:</span>
                        <span className="font-medium">
                          {ship.current_position.speed} nœuds
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={trackedShips.includes(ship.id) ? 'destructive' : 'default'}
                      size="sm"
                      className="flex-1"
                      onClick={() => toggleTracking(ship.id)}
                    >
                      {trackedShips.includes(ship.id) ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Arrêter le suivi
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Suivre
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/tracking?ship=${ship.id}`}>
                        <MapPin className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredShips.length === 0 && (
            <div className="text-center py-12">
              <Ship className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-1">
                Aucun navire trouvé
              </p>
              <p className="text-muted-foreground">
                Essayez de modifier vos filtres de recherche
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Ships;
