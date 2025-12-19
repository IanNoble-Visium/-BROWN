import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  Search,
  Filter,
  AlertTriangle,
  MapPin,
  Clock,
  Eye,
  Shield,
  UserCheck,
  UserX,
  Activity,
  ChevronRight,
  History,
  Fingerprint,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockEntities, mockBuildings, mockFloors } from '@shared/mock-data';
import type { TrackedEntity, EntityRole } from '@shared/eli-types';

export default function EntitiesManagement() {
  const [entities, setEntities] = useState<TrackedEntity[]>(mockEntities);
  const [selectedEntity, setSelectedEntity] = useState<TrackedEntity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<EntityRole | 'all'>('all');
  const [watchlistFilter, setWatchlistFilter] = useState<'all' | 'watchlist' | 'normal'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'lastSeen' | 'riskScore'>('lastSeen');

  // Filter and sort entities
  const filteredEntities = entities
    .filter(entity => {
      if (roleFilter !== 'all' && entity.role !== roleFilter) return false;
      if (watchlistFilter === 'watchlist' && !entity.isWatchlist) return false;
      if (watchlistFilter === 'normal' && entity.isWatchlist) return false;
      if (searchQuery && !entity.displayName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.displayName || '').localeCompare(b.displayName || '');
        case 'lastSeen':
          return (b.lastSeenAt?.getTime() || 0) - (a.lastSeenAt?.getTime() || 0);
        case 'riskScore':
          return b.riskScore - a.riskScore;
        default:
          return 0;
      }
    });

  // Stats
  const stats = {
    total: entities.length,
    staff: entities.filter(e => e.role === 'staff').length,
    students: entities.filter(e => e.role === 'student').length,
    visitors: entities.filter(e => e.role === 'visitor').length,
    watchlist: entities.filter(e => e.isWatchlist).length,
    highRisk: entities.filter(e => e.riskScore > 50).length,
  };

  const getRoleColor = (role: EntityRole) => {
    switch (role) {
      case 'staff': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'student': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'visitor': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'contractor': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'unknown': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 50) return 'text-orange-400';
    if (score >= 30) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskBg = (score: number) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-500';
    if (score >= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLocationName = (entity: TrackedEntity) => {
    if (!entity.lastFloorId) return 'Unknown';
    const floor = mockFloors.find(f => f.id === entity.lastFloorId);
    if (!floor) return 'Unknown';
    const building = mockBuildings.find(b => b.id === floor.buildingId);
    return `${building?.name || 'Unknown'} - ${floor.name}`;
  };

  const toggleWatchlist = (entityId: number) => {
    setEntities(prev => prev.map(e => 
      e.id === entityId ? { ...e, isWatchlist: !e.isWatchlist } : e
    ));
    if (selectedEntity?.id === entityId) {
      setSelectedEntity(prev => prev ? { ...prev, isWatchlist: !prev.isWatchlist } : null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-cyan-400" />
            Entity Management
          </h1>
          <p className="text-muted-foreground">Track and manage all detected entities</p>
        </div>
        <div className="flex items-center gap-2">
          {stats.watchlist > 0 && (
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {stats.watchlist} Watchlist
            </Badge>
          )}
          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
            {stats.total} Total Entities
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="command-panel">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="command-panel">
          <CardContent className="p-4 text-center">
            <UserCheck className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold">{stats.staff}</p>
            <p className="text-xs text-muted-foreground">Staff</p>
          </CardContent>
        </Card>
        <Card className="command-panel">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold">{stats.students}</p>
            <p className="text-xs text-muted-foreground">Students</p>
          </CardContent>
        </Card>
        <Card className="command-panel">
          <CardContent className="p-4 text-center">
            <UserX className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <p className="text-2xl font-bold">{stats.visitors}</p>
            <p className="text-xs text-muted-foreground">Visitors</p>
          </CardContent>
        </Card>
        <Card className="command-panel">
          <CardContent className="p-4 text-center">
            <Shield className="w-6 h-6 mx-auto mb-2 text-red-400" />
            <p className="text-2xl font-bold">{stats.watchlist}</p>
            <p className="text-xs text-muted-foreground">Watchlist</p>
          </CardContent>
        </Card>
        <Card className="command-panel">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-orange-400" />
            <p className="text-2xl font-bold">{stats.highRisk}</p>
            <p className="text-xs text-muted-foreground">High Risk</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="command-panel">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as EntityRole | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Role" />
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
            <Select value={watchlistFilter} onValueChange={(v) => setWatchlistFilter(v as 'all' | 'watchlist' | 'normal')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="watchlist">Watchlist</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'name' | 'lastSeen' | 'riskScore')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastSeen">Last Seen</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="riskScore">Risk Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Entities Table */}
      <Card className="command-panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Tracked Entities</CardTitle>
          <CardDescription>
            Showing {filteredEntities.length} of {entities.length} entities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredEntities.map((entity) => (
                    <motion.tr
                      key={entity.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`cursor-pointer hover:bg-secondary/30 ${
                        selectedEntity?.id === entity.id ? 'bg-secondary/50' : ''
                      }`}
                      onClick={() => setSelectedEntity(entity)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entity.isWatchlist && (
                            <Shield className="w-4 h-4 text-red-400" />
                          )}
                          <div className={`w-2 h-2 rounded-full ${
                            entity.lastSeenAt && Date.now() - entity.lastSeenAt.getTime() < 300000
                              ? 'bg-green-500 animate-pulse'
                              : 'bg-gray-500'
                          }`} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            {entity.displayName?.charAt(0) || '?'}
                          </div>
                          <span className="font-medium">
                            {entity.displayName || 'Unknown Entity'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(entity.role)}>
                          {entity.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {getLocationName(entity)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={entity.riskScore} 
                            className="w-16 h-2"
                          />
                          <span className={`text-sm font-medium ${getRiskColor(entity.riskScore)}`}>
                            {entity.riskScore}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {entity.lastSeenAt 
                            ? new Date(entity.lastSeenAt).toLocaleTimeString()
                            : 'Never'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            {filteredEntities.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No entities match your filters</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Entity Detail Dialog */}
      <Dialog open={!!selectedEntity} onOpenChange={() => setSelectedEntity(null)}>
        <DialogContent className="max-w-2xl">
          {selectedEntity && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold">
                    {selectedEntity.displayName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      {selectedEntity.displayName || 'Unknown Entity'}
                      {selectedEntity.isWatchlist && (
                        <Badge variant="destructive">
                          <Shield className="w-3 h-3 mr-1" />
                          Watchlist
                        </Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      <Badge className={getRoleColor(selectedEntity.role)}>
                        {selectedEntity.role}
                      </Badge>
                      <span>ID: {selectedEntity.id}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Current Location</Label>
                    <p className="mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {getLocationName(selectedEntity)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Seen</Label>
                    <p className="mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {selectedEntity.lastSeenAt 
                        ? new Date(selectedEntity.lastSeenAt).toLocaleString()
                        : 'Never'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Entity Type</Label>
                    <p className="mt-1 capitalize">{selectedEntity.type}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Risk Score</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${getRiskColor(selectedEntity.riskScore)}`}>
                          {selectedEntity.riskScore}/100
                        </span>
                        <Badge className={`${getRiskBg(selectedEntity.riskScore)} text-white`}>
                          {selectedEntity.riskScore >= 70 ? 'High Risk' :
                           selectedEntity.riskScore >= 50 ? 'Medium Risk' :
                           selectedEntity.riskScore >= 30 ? 'Low Risk' : 'Normal'}
                        </Badge>
                      </div>
                      <Progress value={selectedEntity.riskScore} className="h-3" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Identifier Hash</Label>
                    <p className="mt-1 font-mono text-xs truncate">
                      {selectedEntity.identifierHash || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <Button
                  variant={selectedEntity.isWatchlist ? 'destructive' : 'outline'}
                  onClick={() => toggleWatchlist(selectedEntity.id)}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {selectedEntity.isWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <History className="w-4 h-4 mr-2" />
                    View History
                  </Button>
                  <Button variant="outline">
                    <Activity className="w-4 h-4 mr-2" />
                    Track Live
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
