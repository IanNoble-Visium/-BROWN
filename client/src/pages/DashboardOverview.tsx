import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Camera,
  MapPin,
  Bell,
  AlertTriangle,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronRight,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc';

export default function DashboardOverview() {
  // Fetch real data from the database
  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchStats } = trpc.dashboard.overview.useQuery(undefined, {
    refetchInterval: 10000, // Refresh every 10 seconds
  });
  const { data: recentAlerts, isLoading: alertsLoading } = trpc.alerts.list.useQuery({ limit: 5, status: 'active' }, {
    refetchInterval: 5000,
  });
  const { data: entityStats } = trpc.entities.stats.useQuery(undefined, {
    refetchInterval: 10000,
  });
  const { data: buildings } = trpc.buildings.list.useQuery();
  const { data: incidents } = trpc.incidents.list.useQuery({ limit: 5 });

  const stats = dashboardStats || {
    totalCameras: 0,
    camerasOnline: 0,
    activeAlerts: 0,
    criticalAlerts: 0,
    openIncidents: 0,
    trackedEntities: 0,
    recentEvents: 0,
  };

  const entities = entityStats || {
    total: 0,
    staff: 0,
    students: 0,
    visitors: 0,
    unknown: 0,
    watchlist: 0,
  };

  const statCards = [
    {
      title: 'Active Entities',
      value: stats.trackedEntities,
      change: '+12',
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10',
    },
    {
      title: 'Active Alerts',
      value: stats.activeAlerts,
      change: stats.criticalAlerts > 0 ? `${stats.criticalAlerts} critical` : 'None critical',
      changeType: stats.criticalAlerts > 0 ? 'negative' as const : 'positive' as const,
      icon: Bell,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
    },
    {
      title: 'Cameras Online',
      value: `${stats.camerasOnline}/${stats.totalCameras}`,
      change: stats.totalCameras > 0 ? `${((stats.camerasOnline / stats.totalCameras) * 100).toFixed(1)}%` : '0%',
      changeType: 'neutral' as const,
      icon: Camera,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      title: 'Open Incidents',
      value: stats.openIncidents,
      change: stats.openIncidents > 0 ? 'Needs attention' : 'All clear',
      changeType: stats.openIncidents > 0 ? 'negative' as const : 'positive' as const,
      icon: AlertTriangle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
    },
  ];

  const entityBreakdown = [
    { role: 'Students', count: entities.students, color: 'bg-green-500' },
    { role: 'Staff', count: entities.staff, color: 'bg-blue-500' },
    { role: 'Visitors', count: entities.visitors, color: 'bg-yellow-500' },
    { role: 'Unknown', count: entities.unknown, color: 'bg-gray-500' },
  ];

  const totalEntities = entities.total || 1;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500';
      case 'acknowledged': return 'bg-yellow-500';
      case 'investigating': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getBuildingName = (buildingId: number | null) => {
    if (!buildingId || !buildings) return 'Unknown';
    const building = buildings.find(b => b.id === buildingId);
    return building?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Command Center</h1>
          <p className="text-muted-foreground">Real-time campus security overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchStats()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Badge variant="outline" className="border-green-500/50 text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            All Systems Operational
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6">
                <Skeleton className="h-10 w-10 rounded-lg mb-4" />
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.changeType === 'positive' ? 'text-green-400' : 
                      stat.changeType === 'negative' ? 'text-red-400' : 'text-muted-foreground'
                    }`}>
                      {stat.changeType === 'positive' && <TrendingUp className="w-4 h-4" />}
                      {stat.changeType === 'negative' && <TrendingDown className="w-4 h-4" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-400" />
                Recent Alerts
              </CardTitle>
              <CardDescription>Latest security alerts across campus</CardDescription>
            </div>
            <Link href="/dashboard/alerts">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px]">
              {alertsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-3 rounded-lg bg-secondary/30">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : recentAlerts && recentAlerts.length > 0 ? (
                <div className="space-y-3">
                  {recentAlerts.map((alert, i) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(alert.status || 'active')}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{alert.title}</span>
                          <Badge className={`text-xs ${getSeverityColor(alert.severity || 'medium')}`}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {alert.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {getBuildingName(alert.buildingId)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Shield className="w-12 h-12 mb-4 opacity-50" />
                  <p>No active alerts</p>
                  <p className="text-sm">All systems operating normally</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Entity Breakdown */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Entity Breakdown
            </CardTitle>
            <CardDescription>Current campus population by role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {entityBreakdown.map((item) => (
                <div key={item.role} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.role}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} transition-all duration-500`}
                      style={{ width: `${(item.count / totalEntities) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Tracked</span>
                <span className="text-2xl font-bold">{entities.total}</span>
              </div>
              {entities.watchlist > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-red-400">On Watchlist</span>
                  <span className="text-lg font-bold text-red-400">{entities.watchlist}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Building Status */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/tracking">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <MapPin className="w-6 h-6 text-cyan-400" />
                  <span>Track Location</span>
                </Button>
              </Link>
              <Link href="/dashboard/cameras">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Camera className="w-6 h-6 text-green-400" />
                  <span>View Cameras</span>
                </Button>
              </Link>
              <Link href="/dashboard/incidents">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                  <span>New Incident</span>
                </Button>
              </Link>
              <Link href="/dashboard/alerts">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Bell className="w-6 h-6 text-red-400" />
                  <span>View Alerts</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Recent Incidents
              </CardTitle>
              <CardDescription>Active incident reports</CardDescription>
            </div>
            <Link href="/dashboard/incidents">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              {incidents && incidents.length > 0 ? (
                <div className="space-y-3">
                  {incidents.map((incident) => (
                    <div
                      key={incident.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        incident.status === 'open' ? 'bg-red-500' :
                        incident.status === 'in_progress' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{incident.title}</span>
                          <Badge variant="outline" className={`text-xs ${
                            incident.priority === 'critical' ? 'border-red-500 text-red-400' :
                            incident.priority === 'high' ? 'border-orange-500 text-orange-400' :
                            'border-yellow-500 text-yellow-400'
                          }`}>
                            {incident.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getBuildingName(incident.buildingId)} • {new Date(incident.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Shield className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">No active incidents</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
