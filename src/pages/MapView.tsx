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
  const markers = useRef<any[]>([]);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState<string>('all');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('all');
  const [searchLocation, setSearchLocation] = useState<string>('');

  // Sample data points with different types and value ranges
  const sampleData = [
    // Air Quality Data
    { coordinates: [-74.006, 40.7128] as [number, number], title: "New York", value: "156 μg/m³", type: "Air Quality", numericValue: 156 },
    { coordinates: [-118.2437, 34.0522] as [number, number], title: "Los Angeles", value: "89 μg/m³", type: "Air Quality", numericValue: 89 },
    { coordinates: [-87.6298, 41.8781] as [number, number], title: "Chicago", value: "67 μg/m³", type: "Air Quality", numericValue: 67 },
    { coordinates: [-95.3698, 29.7604] as [number, number], title: "Houston", value: "78 μg/m³", type: "Air Quality", numericValue: 78 },
    { coordinates: [-75.1652, 39.9526] as [number, number], title: "Philadelphia", value: "45 μg/m³", type: "Air Quality", numericValue: 45 },
    
    // Water Quality Data
    { coordinates: [-122.4194, 37.7749] as [number, number], title: "San Francisco Bay", value: "7.2 pH", type: "Water Quality", numericValue: 72 },
    { coordinates: [-80.1918, 25.7617] as [number, number], title: "Miami Beach", value: "6.8 pH", type: "Water Quality", numericValue: 68 },
    { coordinates: [-71.0589, 42.3601] as [number, number], title: "Boston Harbor", value: "7.5 pH", type: "Water Quality", numericValue: 35 },
    
    // Soil Samples
    { coordinates: [-93.2650, 44.9778] as [number, number], title: "Minneapolis", value: "6.1 pH", type: "Soil Sample", numericValue: 61 },
    { coordinates: [-122.6750, 45.5152] as [number, number], title: "Portland", value: "5.8 pH", type: "Soil Sample", numericValue: 28 },
    { coordinates: [-104.9903, 39.7392] as [number, number], title: "Denver", value: "7.0 pH", type: "Soil Sample", numericValue: 42 },
    
    // Weather Stations
    { coordinates: [-84.3880, 33.7490] as [number, number], title: "Atlanta", value: "24°C", type: "Weather Station", numericValue: 24 },
    { coordinates: [-121.4944, 38.5816] as [number, number], title: "Sacramento", value: "28°C", type: "Weather Station", numericValue: 28 },
    { coordinates: [-90.0715, 29.9511] as [number, number], title: "New Orleans", value: "31°C", type: "Weather Station", numericValue: 31 },
    
    // Additional varied data points
    { coordinates: [-112.0740, 33.4484] as [number, number], title: "Phoenix", value: "142 μg/m³", type: "Air Quality", numericValue: 142 },
    { coordinates: [-117.1611, 32.7157] as [number, number], title: "San Diego", value: "38 μg/m³", type: "Air Quality", numericValue: 38 },
    { coordinates: [-82.4584, 27.9506] as [number, number], title: "Tampa", value: "52 μg/m³", type: "Air Quality", numericValue: 52 },
    { coordinates: [-115.1398, 36.1699] as [number, number], title: "Las Vegas", value: "98 μg/m³", type: "Air Quality", numericValue: 98 },
    { coordinates: [-97.7431, 30.2672] as [number, number], title: "Austin", value: "67 μg/m³", type: "Air Quality", numericValue: 67 },
    { coordinates: [-86.7816, 36.1627] as [number, number], title: "Nashville", value: "55 μg/m³", type: "Air Quality", numericValue: 55 },
  ];

  // Function to get marker color based on value
  const getMarkerColor = (numericValue: number) => {
    if (numericValue <= 50) return '#10b981'; // Good - green
    if (numericValue <= 100) return '#f59e0b'; // Moderate - yellow/orange
    if (numericValue <= 150) return '#ef4444'; // Poor - red
    return '#6b7280'; // Very Poor - gray
  };

  const clearMarkers = () => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
  };

  const addMarkersToMap = (data: any[]) => {
    clearMarkers();
    
    data.forEach((point) => {
      const popup = new (window as any).mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="p-3 min-w-[200px]">
          <h3 class="font-semibold text-sm text-gray-900">${point.title}</h3>
          <p class="text-xs text-gray-600 mb-1">Type: ${point.type}</p>
          <p class="text-xs font-medium ${
            point.numericValue <= 50 ? 'text-green-600' :
            point.numericValue <= 100 ? 'text-orange-600' :
            point.numericValue <= 150 ? 'text-red-600' : 'text-gray-600'
          }">Value: ${point.value}</p>
          <div class="mt-2 text-xs text-gray-500">
            Quality: ${
              point.numericValue <= 50 ? 'Good' :
              point.numericValue <= 100 ? 'Moderate' :
              point.numericValue <= 150 ? 'Poor' : 'Very Poor'
            }
          </div>
        </div>`
      );

      const marker = new (window as any).mapboxgl.Marker({
        color: getMarkerColor(point.numericValue),
        scale: 0.8
      })
        .setLngLat(point.coordinates)
        .setPopup(popup)
        .addTo(map.current);
      
      markers.current.push(marker);
    });
  };

  const filterData = () => {
    let filteredData = sampleData;
    
    if (selectedDataset !== 'all') {
      const datasetMap: { [key: string]: string } = {
        'air-quality': 'Air Quality',
        'water-quality': 'Water Quality',
        'soil-samples': 'Soil Sample',
        'weather-stations': 'Weather Station'
      };
      filteredData = filteredData.filter(point => point.type === datasetMap[selectedDataset]);
    }
    
    return filteredData;
  };

  const handleSearch = async () => {
    if (!searchLocation.trim() || !map.current) return;
    
    try {
      // Simple geocoding simulation - in real app, use Mapbox Geocoding API
      const locationMap: { [key: string]: [number, number] } = {
        'new york': [-74.006, 40.7128],
        'los angeles': [-118.2437, 34.0522],
        'chicago': [-87.6298, 41.8781],
        'houston': [-95.3698, 29.7604],
        'phoenix': [-112.0740, 33.4484],
        'philadelphia': [-75.1652, 39.9526],
        'san francisco': [-122.4194, 37.7749],
        'miami': [-80.1918, 25.7617],
        'boston': [-71.0589, 42.3601],
        'atlanta': [-84.3880, 33.7490],
        'denver': [-104.9903, 39.7392]
      };
      
      const coords = locationMap[searchLocation.toLowerCase()];
      if (coords) {
        map.current.flyTo({
          center: coords,
          zoom: 10,
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

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

      // Add initial markers
      const filteredData = filterData();
      addMarkersToMap(filteredData);

      setShowTokenInput(false);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  useEffect(() => {
    if (map.current && !showTokenInput) {
      const filteredData = filterData();
      addMarkersToMap(filteredData);
    }
  }, [selectedDataset, selectedTimePeriod]);

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
                <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                  <SelectTrigger className="transition-smooth">
                    <SelectValue placeholder="Select dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Datasets</SelectItem>
                    <SelectItem value="air-quality">Air Quality Data</SelectItem>
                    <SelectItem value="water-quality">Water Quality</SelectItem>
                    <SelectItem value="soil-samples">Soil Samples</SelectItem>
                    <SelectItem value="weather-stations">Weather Stations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period</label>
                <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
                  <SelectTrigger className="transition-smooth">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
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
                    placeholder="e.g., New York, Chicago, Houston" 
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 transition-smooth"
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleSearch}
                    className="transition-smooth"
                  >
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