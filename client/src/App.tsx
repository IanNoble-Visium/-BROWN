import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "./pages/Landing";
import DashboardOverview from "./pages/DashboardOverview";
import LocationTracking from "./pages/LocationTracking";
import CameraMonitoring from "./pages/CameraMonitoring";
import AlertsDashboard from "./pages/AlertsDashboard";
import IncidentManagement from "./pages/IncidentManagement";
import EntitiesManagement from "./pages/EntitiesManagement";
import ELIDashboardLayout from "./components/ELIDashboardLayout";

function Router() {
  return (
    <Switch>
      {/* Public landing page */}
      <Route path="/" component={Landing} />
      
      {/* Dashboard routes - wrapped in layout */}
      <Route path="/dashboard">
        <ELIDashboardLayout>
          <DashboardOverview />
        </ELIDashboardLayout>
      </Route>
      <Route path="/dashboard/tracking">
        <ELIDashboardLayout>
          <LocationTracking />
        </ELIDashboardLayout>
      </Route>
      <Route path="/dashboard/cameras">
        <ELIDashboardLayout>
          <CameraMonitoring />
        </ELIDashboardLayout>
      </Route>
      <Route path="/dashboard/alerts">
        <ELIDashboardLayout>
          <AlertsDashboard />
        </ELIDashboardLayout>
      </Route>
      <Route path="/dashboard/incidents">
        <ELIDashboardLayout>
          <IncidentManagement />
        </ELIDashboardLayout>
      </Route>
      <Route path="/dashboard/entities">
        <ELIDashboardLayout>
          <EntitiesManagement />
        </ELIDashboardLayout>
      </Route>
      <Route path="/dashboard/sensors">
        <ELIDashboardLayout>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-2xl font-bold mb-2">Sensors Dashboard</p>
            <p>Coming soon - sensor monitoring and management</p>
          </div>
        </ELIDashboardLayout>
      </Route>
      <Route path="/dashboard/activity">
        <ELIDashboardLayout>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-2xl font-bold mb-2">Activity Log</p>
            <p>Coming soon - comprehensive activity logging</p>
          </div>
        </ELIDashboardLayout>
      </Route>
      <Route path="/dashboard/reports">
        <ELIDashboardLayout>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-2xl font-bold mb-2">Reports</p>
            <p>Coming soon - analytics and reporting</p>
          </div>
        </ELIDashboardLayout>
      </Route>
      <Route path="/dashboard/settings">
        <ELIDashboardLayout>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-2xl font-bold mb-2">Settings</p>
            <p>Coming soon - system configuration</p>
          </div>
        </ELIDashboardLayout>
      </Route>
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
