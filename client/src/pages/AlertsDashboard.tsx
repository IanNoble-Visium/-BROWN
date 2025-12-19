import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Bell,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Eye,
  MessageSquare,
  Link2,
  ChevronRight,
  Shield,
  Siren,
  UserX,
  Users,
  Flame,
  Radio,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockAlerts, mockBuildings, mockIncidents } from '@shared/mock-data';
import type { Alert, AlertSeverity, AlertStatus, AlertType } from '@shared/eli-types';

export default function AlertsDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [selectedAlerts, setSelectedAlerts] = useState<number[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showCreateIncident, setShowCreateIncident] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AlertType | 'all'>('all');
  const [activeTab, setActiveTab] = useState('all');

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    if (typeFilter !== 'all' && alert.type !== typeFilter) return false;
    if (searchQuery && !alert.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (activeTab === 'active' && alert.status !== 'active') return false;
    if (activeTab === 'acknowledged' && alert.status !== 'acknowledged') return false;
    if (activeTab === 'resolved' && !['resolved', 'false_alarm'].includes(alert.status)) return false;
    return true;
  });

  // Stats
  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
    high: alerts.filter(a => a.severity === 'high' && a.status === 'active').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'active': return 'bg-red-500';
      case 'acknowledged': return 'bg-yellow-500';
      case 'investigating': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      case 'false_alarm': return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: AlertType) => {
    switch (type) {
      case 'weapon': return <Shield className="w-4 h-4" />;
      case 'intrusion': return <UserX className="w-4 h-4" />;
      case 'anomaly': return <AlertTriangle className="w-4 h-4" />;
      case 'crowd': return <Users className="w-4 h-4" />;
      case 'access_violation': return <XCircle className="w-4 h-4" />;
      case 'system': return <Radio className="w-4 h-4" />;
      case 'person_down': return <User className="w-4 h-4" />;
      case 'fire': return <Flame className="w-4 h-4" />;
    }
  };

  const handleAcknowledge = (alertId: number) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: 'acknowledged' as AlertStatus, acknowledgedAt: new Date() } : a
    ));
  };

  const handleResolve = (alertId: number) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: 'resolved' as AlertStatus, resolvedAt: new Date() } : a
    ));
  };

  const handleBulkAcknowledge = () => {
    setAlerts(prev => prev.map(a => 
      selectedAlerts.includes(a.id) ? { ...a, status: 'acknowledged' as AlertStatus, acknowledgedAt: new Date() } : a
    ));
    setSelectedAlerts([]);
  };

  const toggleAlertSelection = (alertId: number) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) ? prev.filter(id => id !== alertId) : [...prev, alertId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="w-8 h-8 text-red-400" />
            Alert Center
          </h1>
          <p className="text-muted-foreground">Real-time security alerts and notifications</p>
        </div>
        <div className="flex items-center gap-2">
          {stats.critical > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <Siren className="w-3 h-3 mr-1" />
              {stats.critical} Critical
            </Badge>
          )}
          <Badge variant="outline" className="border-red-500/50 text-red-400">
            {stats.active} Active Alerts
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="command-panel border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-3xl font-bold text-red-400">{stats.critical}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="command-panel border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-3xl font-bold text-orange-400">{stats.high}</p>
              </div>
              <Bell className="w-8 h-8 text-orange-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="command-panel border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acknowledged</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.acknowledged}</p>
              </div>
              <Eye className="w-8 h-8 text-yellow-400/50" />
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
      </div>

      {/* Filters & Actions */}
      <Card className="command-panel">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Severity Filter */}
            <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as AlertSeverity | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AlertType | 'all')}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="weapon">Weapon</SelectItem>
                <SelectItem value="intrusion">Intrusion</SelectItem>
                <SelectItem value="anomaly">Anomaly</SelectItem>
                <SelectItem value="crowd">Crowd</SelectItem>
                <SelectItem value="access_violation">Access Violation</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="person_down">Person Down</SelectItem>
              </SelectContent>
            </Select>

            {/* Bulk Actions */}
            {selectedAlerts.length > 0 && (
              <div className="flex items-center gap-2 border-l border-border pl-4">
                <span className="text-sm text-muted-foreground">{selectedAlerts.length} selected</span>
                <Button size="sm" variant="outline" onClick={handleBulkAcknowledge}>
                  Acknowledge
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowCreateIncident(true)}>
                  <Link2 className="w-4 h-4 mr-1" />
                  Create Incident
                </Button>
              </div>
            )}

            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card className="command-panel">
        <CardHeader className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                All ({alerts.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-red-400">
                Active ({stats.active})
              </TabsTrigger>
              <TabsTrigger value="acknowledged">
                Acknowledged ({stats.acknowledged})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolved ({stats.resolved})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredAlerts.map((alert, i) => (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.02 }}
                    className={`flex items-start gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer ${
                      selectedAlerts.includes(alert.id) ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    {/* Checkbox */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedAlerts.includes(alert.id)}
                        onCheckedChange={() => toggleAlertSelection(alert.id)}
                      />
                    </div>

                    {/* Status Indicator */}
                    <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(alert.status)}`} />

                    {/* Type Icon */}
                    <div className={`p-2 rounded-lg ${
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {getTypeIcon(alert.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{alert.title}</span>
                        <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {alert.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {mockBuildings.find(b => b.id === alert.buildingId)?.name || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                        {alert.aiConfidence && (
                          <span className="flex items-center gap-1">
                            AI: {(alert.aiConfidence * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {alert.status === 'active' && (
                        <Button size="sm" variant="outline" onClick={() => handleAcknowledge(alert.id)}>
                          Acknowledge
                        </Button>
                      )}
                      {alert.status === 'acknowledged' && (
                        <Button size="sm" variant="outline" onClick={() => handleResolve(alert.id)}>
                          Resolve
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredAlerts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No alerts match your filters</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-2xl">
          {selectedAlert && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedAlert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    selectedAlert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    selectedAlert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {getTypeIcon(selectedAlert.type)}
                  </div>
                  <div>
                    <DialogTitle>{selectedAlert.title}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      <Badge className={getSeverityColor(selectedAlert.severity)}>
                        {selectedAlert.severity}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {selectedAlert.status.replace('_', ' ')}
                      </Badge>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1">{selectedAlert.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Location</Label>
                    <p className="mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {mockBuildings.find(b => b.id === selectedAlert.buildingId)?.name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(selectedAlert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedAlert.aiConfidence && (
                    <div>
                      <Label className="text-muted-foreground">AI Confidence</Label>
                      <p className="mt-1">{(selectedAlert.aiConfidence * 100).toFixed(1)}%</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Alert ID</Label>
                    <p className="mt-1 font-mono text-sm">#{selectedAlert.id}</p>
                  </div>
                </div>

                {selectedAlert.acknowledgedAt && (
                  <div>
                    <Label className="text-muted-foreground">Acknowledged</Label>
                    <p className="mt-1">{new Date(selectedAlert.acknowledgedAt).toLocaleString()}</p>
                  </div>
                )}

                {selectedAlert.resolvedAt && (
                  <div>
                    <Label className="text-muted-foreground">Resolved</Label>
                    <p className="mt-1">{new Date(selectedAlert.resolvedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                {selectedAlert.status === 'active' && (
                  <Button onClick={() => {
                    handleAcknowledge(selectedAlert.id);
                    setSelectedAlert(null);
                  }}>
                    Acknowledge Alert
                  </Button>
                )}
                {selectedAlert.status === 'acknowledged' && (
                  <Button onClick={() => {
                    handleResolve(selectedAlert.id);
                    setSelectedAlert(null);
                  }}>
                    Mark as Resolved
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Incident Dialog */}
      <Dialog open={showCreateIncident} onOpenChange={setShowCreateIncident}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Incident from Alerts</DialogTitle>
            <DialogDescription>
              Link {selectedAlerts.length} selected alerts to a new incident
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Incident Title</Label>
              <Input placeholder="Enter incident title..." />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the incident..." />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select defaultValue="high">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateIncident(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowCreateIncident(false);
              setSelectedAlerts([]);
            }}>
              Create Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
