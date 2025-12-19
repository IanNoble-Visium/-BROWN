import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Plus,
  Search,
  Clock,
  MapPin,
  User,
  Users,
  MessageSquare,
  Link2,
  ChevronRight,
  CheckCircle2,
  Circle,
  PlayCircle,
  XCircle,
  Tag,
  Calendar,
  FileText,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockIncidents, mockBuildings, mockAlerts } from '@shared/mock-data';
import type { Incident, IncidentStatus, IncidentPriority } from '@shared/eli-types';

export default function IncidentManagement() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<IncidentPriority | 'all'>('all');
  const [activeTab, setActiveTab] = useState('all');

  // New incident form state
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    priority: 'medium' as IncidentPriority,
    buildingId: '',
  });

  // Filter incidents
  const filteredIncidents = incidents.filter(incident => {
    if (statusFilter !== 'all' && incident.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && incident.priority !== priorityFilter) return false;
    if (searchQuery && !incident.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (activeTab === 'open' && !['open', 'in_progress'].includes(incident.status)) return false;
    if (activeTab === 'resolved' && !['resolved', 'closed'].includes(incident.status)) return false;
    return true;
  });

  // Stats
  const stats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open').length,
    inProgress: incidents.filter(i => i.status === 'in_progress').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
    closed: incidents.filter(i => i.status === 'closed').length,
  };

  const getPriorityColor = (priority: IncidentPriority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getStatusIcon = (status: IncidentStatus) => {
    switch (status) {
      case 'open': return <Circle className="w-4 h-4 text-red-400" />;
      case 'in_progress': return <PlayCircle className="w-4 h-4 text-yellow-400" />;
      case 'resolved': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'closed': return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'open': return 'bg-red-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
    }
  };

  const handleCreateIncident = () => {
    const incident: Incident = {
      id: incidents.length + 1,
      status: 'open',
      priority: newIncident.priority,
      title: newIncident.title,
      description: newIncident.description,
      buildingId: newIncident.buildingId ? parseInt(newIncident.buildingId) : undefined,
      tags: [],
      createdAt: new Date(),
    };
    setIncidents(prev => [incident, ...prev]);
    setShowCreateDialog(false);
    setNewIncident({ title: '', description: '', priority: 'medium', buildingId: '' });
  };

  const handleUpdateStatus = (incidentId: number, newStatus: IncidentStatus) => {
    setIncidents(prev => prev.map(i => {
      if (i.id === incidentId) {
        return {
          ...i,
          status: newStatus,
          resolvedAt: newStatus === 'resolved' ? new Date() : i.resolvedAt,
          closedAt: newStatus === 'closed' ? new Date() : i.closedAt,
        };
      }
      return i;
    }));
    if (selectedIncident?.id === incidentId) {
      setSelectedIncident(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-orange-400" />
            Incident Management
          </h1>
          <p className="text-muted-foreground">Track and manage security incidents</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Incident
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Incident</DialogTitle>
              <DialogDescription>
                Create a new incident to track and coordinate response
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Enter incident title..."
                  value={newIncident.title}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the incident..."
                  value={newIncident.description}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newIncident.priority}
                    onValueChange={(v) => setNewIncident(prev => ({ ...prev, priority: v as IncidentPriority }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Building</Label>
                  <Select
                    value={newIncident.buildingId}
                    onValueChange={(v) => setNewIncident(prev => ({ ...prev, buildingId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select building" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBuildings.map(b => (
                        <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateIncident} disabled={!newIncident.title}>
                Create Incident
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="command-panel border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-3xl font-bold text-red-400">{stats.open}</p>
              </div>
              <Circle className="w-8 h-8 text-red-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="command-panel border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.inProgress}</p>
              </div>
              <PlayCircle className="w-8 h-8 text-yellow-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="command-panel border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-3xl font-bold text-green-400">{stats.resolved}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="command-panel border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Closed</p>
                <p className="text-3xl font-bold text-gray-400">{stats.closed}</p>
              </div>
              <XCircle className="w-8 h-8 text-gray-400/50" />
            </div>
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
                placeholder="Search incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as IncidentPriority | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as IncidentStatus | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Incidents List */}
        <Card className="command-panel lg:col-span-2">
          <CardHeader className="pb-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All ({incidents.length})</TabsTrigger>
                <TabsTrigger value="open">Active ({stats.open + stats.inProgress})</TabsTrigger>
                <TabsTrigger value="resolved">Resolved ({stats.resolved + stats.closed})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredIncidents.map((incident, i) => (
                    <motion.div
                      key={incident.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: i * 0.02 }}
                      className={`p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer ${
                        selectedIncident?.id === incident.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1">{getStatusIcon(incident.status)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">{incident.title}</span>
                            <Badge className={getPriorityColor(incident.priority)}>
                              {incident.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mb-2">
                            {incident.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {incident.buildingId && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {mockBuildings.find(b => b.id === incident.buildingId)?.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(incident.createdAt).toLocaleDateString()}
                            </span>
                            {incident.linkedAlertIds && incident.linkedAlertIds.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Link2 className="w-3 h-3" />
                                {incident.linkedAlertIds.length} alerts
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredIncidents.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No incidents match your filters</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Incident Detail Panel */}
        <Card className="command-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Incident Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedIncident ? (
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(selectedIncident.status)}
                    <Badge className={getPriorityColor(selectedIncident.priority)}>
                      {selectedIncident.priority}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold">{selectedIncident.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedIncident.description}
                  </p>
                </div>

                {/* Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(selectedIncident.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedIncident.buildingId && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Location:</span>
                      <span>{mockBuildings.find(b => b.id === selectedIncident.buildingId)?.name}</span>
                    </div>
                  )}
                  {selectedIncident.tags && selectedIncident.tags.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {selectedIncident.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Linked Alerts */}
                {selectedIncident.linkedAlertIds && selectedIncident.linkedAlertIds.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground mb-2 block">Linked Alerts</Label>
                    <div className="space-y-2">
                      {selectedIncident.linkedAlertIds.map(alertId => {
                        const alert = mockAlerts.find(a => a.id === alertId);
                        if (!alert) return null;
                        return (
                          <div key={alertId} className="p-2 rounded bg-secondary/50 text-sm">
                            <div className="flex items-center gap-2">
                              <Link2 className="w-3 h-3" />
                              {alert.title}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <Label className="text-muted-foreground">Update Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedIncident.status === 'open' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(selectedIncident.id, 'in_progress')}
                      >
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Start Work
                      </Button>
                    )}
                    {selectedIncident.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(selectedIncident.id, 'resolved')}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                    {selectedIncident.status === 'resolved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(selectedIncident.id, 'closed')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Close
                      </Button>
                    )}
                    {['open', 'in_progress'].includes(selectedIncident.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(selectedIncident.id, 'open')}
                      >
                        <Circle className="w-4 h-4 mr-1" />
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select an incident to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
