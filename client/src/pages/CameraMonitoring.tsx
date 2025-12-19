import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Camera,
  Search,
  Grid3X3,
  Maximize2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
  RefreshCw,
  Download,
  Share2,
  Cpu,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockCameras, mockBuildings } from '@shared/mock-data';
import type { Camera as CameraType } from '@shared/eli-types';

export default function CameraMonitoring() {
  const [cameras, setCameras] = useState(mockCameras);
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');
  const [gridSize, setGridSize] = useState<4 | 9 | 16>(9);
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Filter cameras
  const filteredCameras = cameras.filter(camera => {
    if (buildingFilter !== 'all' && camera.buildingId !== parseInt(buildingFilter)) return false;
    if (statusFilter !== 'all' && camera.status !== statusFilter) return false;
    if (searchQuery && !camera.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredCameras.length / gridSize);
  const paginatedCameras = filteredCameras.slice(currentPage * gridSize, (currentPage + 1) * gridSize);

  // Stats
  const stats = {
    total: cameras.length,
    online: cameras.filter(c => c.status === 'online').length,
    offline: cameras.filter(c => c.status === 'offline').length,
    maintenance: cameras.filter(c => c.status === 'maintenance').length,
    aiEnabled: cameras.filter(c => c.hasAI).length,
  };

  const getStatusIcon = (status: CameraType['status']) => {
    switch (status) {
      case 'online': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'offline': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-yellow-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    }
  };

  const getStatusBadge = (status: CameraType['status']) => {
    const colors = {
      online: 'bg-green-500/20 text-green-400 border-green-500/30',
      offline: 'bg-red-500/20 text-red-400 border-red-500/30',
      maintenance: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      error: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    return colors[status];
  };

  const CameraFeed = ({ camera, onClick, size = 'normal' }: { camera: CameraType; onClick?: () => void; size?: 'normal' | 'large' }) => {
    const building = mockBuildings.find(b => b.id === camera.buildingId);
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`relative group cursor-pointer ${size === 'large' ? 'h-full' : ''}`}
        onClick={onClick}
      >
        <div className={`camera-feed ${size === 'large' ? 'h-full aspect-auto' : ''}`}>
          {/* Mock video feed - using placeholder image */}
          {camera.status === 'online' ? (
            <img
              src={camera.snapshotUrl || `https://picsum.photos/seed/${camera.id}/640/360`}
              alt={camera.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              {camera.status === 'offline' && <XCircle className="w-12 h-12 text-red-500/50" />}
              {camera.status === 'maintenance' && <Wrench className="w-12 h-12 text-yellow-500/50" />}
              {camera.status === 'error' && <AlertTriangle className="w-12 h-12 text-orange-500/50" />}
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Camera info */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white truncate">{camera.name}</p>
                <p className="text-xs text-gray-400">{building?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {camera.hasAI && (
                  <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                    <Cpu className="w-3 h-3 mr-1" />
                    AI
                  </Badge>
                )}
                <Badge className={`text-xs ${getStatusBadge(camera.status)}`}>
                  {camera.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <div className="absolute top-3 left-3">
            <div className={`w-3 h-3 rounded-full ${
              camera.status === 'online' ? 'bg-green-500 animate-pulse' : 
              camera.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
          </div>

          {/* Recording indicator */}
          {camera.status === 'online' && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500/80 rounded px-2 py-0.5">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs text-white font-medium">REC</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="sm" variant="secondary" className="h-8">
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button size="sm" variant="secondary" className="h-8">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Camera className="w-8 h-8 text-green-400" />
            Camera Monitoring
          </h1>
          <p className="text-muted-foreground">Live surveillance feeds across campus</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-500/50 text-green-400">
            {stats.online}/{stats.total} Online
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="command-panel">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Camera className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Cameras</p>
            </div>
          </CardContent>
        </Card>
        <Card className="command-panel">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.online}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </CardContent>
        </Card>
        <Card className="command-panel">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.offline}</p>
              <p className="text-xs text-muted-foreground">Offline</p>
            </div>
          </CardContent>
        </Card>
        <Card className="command-panel">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Wrench className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.maintenance}</p>
              <p className="text-xs text-muted-foreground">Maintenance</p>
            </div>
          </CardContent>
        </Card>
        <Card className="command-panel">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.aiEnabled}</p>
              <p className="text-xs text-muted-foreground">AI Enabled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="command-panel">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search cameras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Building Filter */}
            <Select value={buildingFilter} onValueChange={setBuildingFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Buildings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                {mockBuildings.map(b => (
                  <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            {/* Grid Size */}
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <span className="text-sm text-muted-foreground">Grid:</span>
              <div className="flex gap-1">
                {([4, 9, 16] as const).map(size => (
                  <Button
                    key={size}
                    variant={gridSize === size ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setGridSize(size)}
                  >
                    {Math.sqrt(size)}×{Math.sqrt(size)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Refresh */}
            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Camera Grid */}
      <Card className="command-panel">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Live Feeds</CardTitle>
            <CardDescription>
              Showing {paginatedCameras.length} of {filteredCameras.length} cameras
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {currentPage + 1} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${
            gridSize === 4 ? 'grid-cols-2' : 
            gridSize === 9 ? 'grid-cols-3' : 
            'grid-cols-4'
          }`}>
            <AnimatePresence mode="popLayout">
              {paginatedCameras.map(camera => (
                <CameraFeed
                  key={camera.id}
                  camera={camera}
                  onClick={() => {
                    setSelectedCamera(camera);
                    setShowFullscreen(true);
                  }}
                />
              ))}
            </AnimatePresence>
          </div>

          {filteredCameras.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No cameras match your filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen Camera Dialog */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-5xl h-[80vh] p-0">
          {selectedCamera && (
            <div className="h-full flex flex-col">
              <DialogHeader className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      {getStatusIcon(selectedCamera.status)}
                      {selectedCamera.name}
                    </DialogTitle>
                    <DialogDescription>
                      {mockBuildings.find(b => b.id === selectedCamera.buildingId)?.name}
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCamera.hasAI && (
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        <Cpu className="w-3 h-3 mr-1" />
                        AI Analytics Active
                      </Badge>
                    )}
                    <Badge className={getStatusBadge(selectedCamera.status)}>
                      {selectedCamera.status}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="flex-1 relative bg-black">
                <CameraFeed camera={selectedCamera} size="large" />
              </div>

              <div className="p-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
