import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Anchor, MapPin, Cloud, Thermometer, Wind, Waves } from 'lucide-react';

// Mock data - à remplacer par les vraies données de l'API
const mockPorts = [
  {
    id: 1,
    name: 'Port de Marseille',
    code: 'FRMRS',
    country: '🇫🇷 France',
    latitude: 43.3,
    longitude: 5.37,
    capacity: 1500000,
    weather: {
      temperature: 18,
      weather_condition: 'Ensoleillé',
      wind_speed: 15,
      wave_height: 1.2,
      visibility: 10,
    },
  },
  {
    id: 2,
    name: 'Port de Dakar',
    code: 'SNDKR',
    country: '🇸🇳 Sénégal',
    latitude: 14.67,
    longitude: -17.43,
    capacity: 800000,
    weather: {
      temperature: 28,
      weather_condition: 'Partiellement nuageux',
      wind_speed: 22,
      wave_height: 2.1,
      visibility: 8,
    },
  },
  {
    id: 3,
    name: 'Port de Tanger Med',
    code: 'MATNG',
    country: '🇲🇦 Maroc',
    latitude: 35.87,
    longitude: -5.57,
    capacity: 3500000,
    weather: {
      temperature: 22,
      weather_condition: 'Nuageux',
      wind_speed: 18,
      wave_height: 1.5,
      visibility: 9,
    },
  },
];

const Ports = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPorts = mockPorts.filter(
    (port) =>
      port.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      port.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      port.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Ports</h1>
            <p className="text-muted-foreground">
              Consultez les informations et la météo des ports maritimes
            </p>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un port..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-6">
            {filteredPorts.map((port) => (
              <Card key={port.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Anchor className="h-6 w-6 text-primary" />
                        <CardTitle className="text-2xl">{port.name}</CardTitle>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {port.country}
                        </span>
                        <span>•</span>
                        <span>Code: {port.code}</span>
                        <span>•</span>
                        <span>
                          Capacité: {(port.capacity / 1000000).toFixed(1)}M TEU
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="weather" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                      <TabsTrigger value="weather">Météo actuelle</TabsTrigger>
                      <TabsTrigger value="history">Historique</TabsTrigger>
                    </TabsList>
                    <TabsContent value="weather" className="mt-4">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                          <Cloud className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Condition</p>
                            <p className="font-semibold">
                              {port.weather.weather_condition}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                          <Thermometer className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Température</p>
                            <p className="font-semibold">
                              {port.weather.temperature}°C
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                          <Wind className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Vent</p>
                            <p className="font-semibold">
                              {port.weather.wind_speed} km/h
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                          <Waves className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Vagues</p>
                            <p className="font-semibold">
                              {port.weather.wave_height}m
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                          <MapPin className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Visibilité</p>
                            <p className="font-semibold">
                              {port.weather.visibility} km
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="history" className="mt-4">
                      <div className="text-center py-12 border rounded-lg bg-muted/20">
                        <Cloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-foreground mb-1">
                          Historique météo
                        </p>
                        <p className="text-muted-foreground">
                          Les données historiques seront bientôt disponibles
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPorts.length === 0 && (
            <div className="text-center py-12">
              <Anchor className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-1">
                Aucun port trouvé
              </p>
              <p className="text-muted-foreground">
                Essayez de modifier votre recherche
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Ports;
