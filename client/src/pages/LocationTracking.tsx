import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Clock,
  Users,
  Search,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  History,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockBuildings, mockFloors, mockEntities, simulateEntityMovement } from '@shared/mock-data';
import type { TrackedEntity, EntityRole } from '@shared/eli-types';

interface EntityWithPosition extends TrackedEntity {
  currentX: number;
  currentY: number;
  trail: { x: number; y: number; timestamp: number }[];
}

export default function LocationTracking() {
  const [selectedBuilding, setSelectedBuilding] = useState(mockBuildings[0]);
  const [selectedFloor, setSelectedFloor] = useState(mockFloors[0]);
  const [entities, setEntities] = useState<EntityWithPosition[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<EntityWithPosition | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showTrails, setShowTrails] = useState(true);
  const [trailDuration, setTrailDuration] = useState(30); // minutes
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<EntityRole | 'all'>('all');
  const [showLayers, setShowLayers] = useState({
    entities: true,
    cameras: true,
    sensors: false,
    zones: false,
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef(Date.now());

  // Initialize entities with positions
  useEffect(() => {
    const floorEntities = mockEntities
      .filter(e => e.lastFloorId === selectedFloor.id)
      .slice(0, 50)
      .map(e => ({
        ...e,
        currentX: e.lastX || Math.random() * 1000 + 100,
        currentY: e.lastY || Math.random() * 600 + 100,
        trail: [] as { x: number; y: number; timestamp: number }[],
      }));
    setEntities(floorEntities);
    setSelectedEntity(null);
  }, [selectedFloor]);

  // Simulate entity movement
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      setEntities(prev => prev.map(entity => {
        const newPos = simulateEntityMovement(
          { ...entity, lastX: entity.currentX, lastY: entity.currentY },
          delta
        );
        
        // Add to trail
        const newTrail = [
          ...entity.trail,
          { x: entity.currentX, y: entity.currentY, timestamp: now }
        ].filter(t => now - t.timestamp < trailDuration * 60 * 1000);

        return {
          ...entity,
          currentX: newPos.x,
          currentY: newPos.y,
          trail: newTrail,
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [trailDuration]);

  // Handle floor change when building changes
  useEffect(() => {
    const buildingFloors = mockFloors.filter(f => f.buildingId === selectedBuilding.id);
    if (buildingFloors.length > 0) {
      setSelectedFloor(buildingFloors[0]);
    }
  }, [selectedBuilding]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getRoleColor = (role: EntityRole) => {
    switch (role) {
      case 'staff': return 'bg-blue-500 border-blue-400';
      case 'student': return 'bg-green-500 border-green-400';
      case 'visitor': return 'bg-yellow-500 border-yellow-400';
      case 'contractor': return 'bg-purple-500 border-purple-400';
      case 'unknown': return 'bg-gray-500 border-gray-400';
    }
  };

  const filteredEntities = entities.filter(e => {
    if (roleFilter !== 'all' && e.role !== roleFilter) return false;
    if (searchQuery && !e.displayName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const buildingFloors = mockFloors.filter(f => f.buildingId === selectedBuilding.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="w-8 h-8 text-cyan-400" />
            Location Tracking
          </h1>
          <p className="text-muted-foreground">Real-time entity positions across campus</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
            <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2 animate-pulse" />
            {filteredEntities.length} entities tracked
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Controls Panel */}
        <Card className="command-panel lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Building & Floor Selection */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Building</Label>
                <Select 
                  value={selectedBuilding.id.toString()} 
                  onValueChange={(v) => setSelectedBuilding(mockBuildings.find(b => b.id === parseInt(v)) || mockBuildings[0])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBuildings.map(b => (
                      <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Floor</Label>
                <Select 
                  value={selectedFloor.id.toString()} 
                  onValueChange={(v) => setSelectedFloor(mockFloors.find(f => f.id === parseInt(v)) || mockFloors[0])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {buildingFloors.map(f => (
                      <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Search Entity</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Filter by Role</Label>
                <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as EntityRole | 'all')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="visitor">Visitors</SelectItem>
                    <SelectItem value="contractor">Contractors</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Trail Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Show Trails
                </Label>
                <Switch checked={showTrails} onCheckedChange={setShowTrails} />
              </div>
              {showTrails && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Trail Duration</span>
                    <span>{trailDuration} min</span>
                  </div>
                  <Slider
                    value={[trailDuration]}
                    onValueChange={([v]) => setTrailDuration(v)}
                    min={5}
                    max={120}
                    step={5}
                  />
                </div>
              )}
            </div>

            {/* Layer Toggles */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Layers
              </Label>
              <div className="space-y-2">
                {Object.entries(showLayers).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{key}</span>
                    <Switch 
                      checked={value} 
                      onCheckedChange={(v) => setShowLayers(prev => ({ ...prev, [key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2">
              <Label>Legend</Label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Staff</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Student</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Visitor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Contractor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                  <span>Unknown</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span>Alert</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floor Plan Viewer */}
        <Card className="command-panel lg:col-span-3">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{selectedBuilding.name} - {selectedFloor.name}</CardTitle>
              <CardDescription>Interactive floor plan with live entity positions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(3, z + 0.2))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={resetView}>
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              ref={containerRef}
              className="relative w-full h-[600px] bg-[#0a1628] rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Floor Plan Image */}
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
                className="absolute inset-0 transition-transform duration-75"
              >
                <img
                  src={selectedFloor.floorplanUrl}
                  alt={`${selectedBuilding.name} - ${selectedFloor.name}`}
                  className="w-full h-full object-contain"
                  draggable={false}
                />

                {/* Entity Markers */}
                {showLayers.entities && filteredEntities.map((entity) => (
                  <motion.div
                    key={entity.id}
                    className="absolute"
                    style={{
                      left: `${(entity.currentX / 1200) * 100}%`,
                      top: `${(entity.currentY / 800) * 100}%`,
                    }}
                    initial={false}
                    animate={{
                      left: `${(entity.currentX / 1200) * 100}%`,
                      top: `${(entity.currentY / 800) * 100}%`,
                    }}
                    transition={{ duration: 0.5, ease: 'linear' }}
                  >
                    {/* Trail */}
                    {showTrails && entity.trail.length > 1 && (
                      <svg
                        className="absolute pointer-events-none"
                        style={{
                          left: '-100px',
                          top: '-100px',
                          width: '200px',
                          height: '200px',
                          overflow: 'visible',
                        }}
                      >
                        <polyline
                          points={entity.trail.map((t, i) => 
                            `${((t.x - entity.currentX) / 1200) * 100 + 100},${((t.y - entity.currentY) / 800) * 100 + 100}`
                          ).join(' ')}
                          fill="none"
                          stroke={entity.role === 'staff' ? '#3b82f6' : 
                                  entity.role === 'student' ? '#22c55e' : 
                                  entity.role === 'visitor' ? '#eab308' : '#6b7280'}
                          strokeWidth="2"
                          strokeOpacity="0.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    
                    {/* Entity Dot */}
                    <motion.div
                      className={`w-4 h-4 rounded-full border-2 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${getRoleColor(entity.role)} ${
                        entity.isWatchlist ? 'animate-pulse ring-2 ring-red-500 ring-offset-2 ring-offset-transparent' : ''
                      } ${selectedEntity?.id === entity.id ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''}`}
                      whileHover={{ scale: 1.5 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntity(entity);
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Zoom indicator */}
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded px-3 py-1 text-sm">
                Zoom: {(zoom * 100).toFixed(0)}%
              </div>

              {/* Entity count */}
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded px-3 py-1 text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                {filteredEntities.length} entities
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Entity Details */}
      <AnimatePresence>
        {selectedEntity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="command-panel">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRoleColor(selectedEntity.role)}`}>
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>{selectedEntity.displayName || 'Unknown Entity'}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{selectedEntity.role}</Badge>
                      {selectedEntity.isWatchlist && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Watchlist
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedEntity(null)}>
                  <EyeOff className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Entity ID</p>
                    <p className="font-mono text-sm">{selectedEntity.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Current Position</p>
                    <p className="font-mono text-sm">
                      ({selectedEntity.currentX.toFixed(1)}, {selectedEntity.currentY.toFixed(1)})
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Risk Score</p>
                    <p className={`font-semibold ${selectedEntity.riskScore > 50 ? 'text-red-400' : selectedEntity.riskScore > 25 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {selectedEntity.riskScore}/100
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Last Seen</p>
                    <p className="text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedEntity.lastSeenAt ? new Date(selectedEntity.lastSeenAt).toLocaleTimeString() : 'Now'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
