import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Map, Filter, Layers, Download, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  const initializeMap = async () => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      const mapboxgl = await import('mapbox-gl');
      
      // @ts-ignore
      mapboxgl.default.accessToken = mapboxToken;
      
      map.current = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-98.5795, 39.8283], // Center of USA
        zoom: 4,
        pitch: 45,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.default.NavigationControl(),
        'top-right'
      );

      // Sample data points
      const sampleData = [
        { coordinates: [-74.006, 40.7128] as [number, number], title: "New York", value: "156 μg/m³" },
        { coordinates: [-118.2437, 34.0522] as [number, number], title: "Los Angeles", value: "89 μg/m³" },
        { coordinates: [-87.6298, 41.8781] as [number, number], title: "Chicago", value: "67 μg/m³" },
        { coordinates: [-95.3698, 29.7604] as [number, number], title: "Houston", value: "78 μg/m³" },
        { coordinates: [-75.1652, 39.9526] as [number, number], title: "Philadelphia", value: "45 μg/m³" },
      ];

      // Add markers for sample data
      sampleData.forEach((point) => {
        const popup = new mapboxgl.default.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <h3 class="font-semibold text-sm">${point.title}</h3>
            <p class="text-xs text-gray-600">Air Quality: ${point.value}</p>
          </div>`
        );

        const marker = new mapboxgl.default.Marker({
          color: '#2563eb',
          scale: 0.8
        })
          .setLngLat(point.coordinates)
          .setPopup(popup)
          .addTo(map.current);
      });

      setShowTokenInput(false);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      initializeMap();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Geospatial Data Map</h1>
          <p className="text-muted-foreground">Interactive map view of research data points</p>
        </div>

        {showTokenInput && (
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle>Mapbox Configuration</CardTitle>
              <CardDescription>
                Enter your Mapbox public token to enable the interactive map. 
                Get your token at <a href="https://mapbox.com" target="_blank" className="text-primary hover:underline">mapbox.com</a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwi..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="flex-1 transition-smooth"
                />
                <Button 
                  onClick={handleTokenSubmit}
                  className="bg-gradient-primary hover:bg-primary-hover transition-smooth shadow-government"
                >
                  Load Map
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Controls */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2 text-primary" />
                Map Controls
              </CardTitle>
              <CardDescription>
                Filter and customize map display
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dataset</label>
                <Select>
                  <SelectTrigger className="transition-smooth">
                    <SelectValue placeholder="Select dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="air-quality">Air Quality Data</SelectItem>
                    <SelectItem value="water-quality">Water Quality</SelectItem>
                    <SelectItem value="soil-samples">Soil Samples</SelectItem>
                    <SelectItem value="weather-stations">Weather Stations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period</label>
                <Select>
                  <SelectTrigger className="transition-smooth">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-week">Last Week</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-quarter">Last Quarter</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search Location</label>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="City, State" 
                    className="flex-1 transition-smooth"
                  />
                  <Button size="sm" variant="outline" className="transition-smooth">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start transition-smooth hover:bg-accent hover:text-accent-foreground"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Toggle Layers
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start transition-smooth hover:bg-muted"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Map Container */}
          <Card className="lg:col-span-3 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="h-5 w-5 mr-2 text-primary" />
                Interactive Map
              </CardTitle>
              <CardDescription>
                Geographic visualization of research data points
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative">
                <div 
                  ref={mapContainer} 
                  className="w-full h-[600px] rounded-b-lg"
                  style={{ 
                    background: showTokenInput 
                      ? 'linear-gradient(135deg, hsl(215 20% 95%), hsl(215 20% 90%))'
                      : 'transparent'
                  }}
                >
                  {showTokenInput && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Enter Mapbox token above to load map</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Legend */}
        <Card className="mt-6 shadow-card">
          <CardHeader>
            <CardTitle>Legend</CardTitle>
            <CardDescription>Data point indicators and value ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-success rounded-full"></div>
                <span className="text-sm">Good (0-50)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-warning rounded-full"></div>
                <span className="text-sm">Moderate (51-100)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-destructive rounded-full"></div>
                <span className="text-sm">Poor (101-150)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-secondary rounded-full"></div>
                <span className="text-sm">Very Poor (150+)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MapView;