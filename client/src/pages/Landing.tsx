import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  MapPin, 
  Camera, 
  Bell, 
  Activity, 
  Users, 
  Zap, 
  Lock,
  ChevronRight,
  Play,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Wifi,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const demoLoginMutation = trpc.auth.demoLogin.useMutation({
    onSuccess: (data) => {
      // Store demo session
      localStorage.setItem('eli_demo_session', JSON.stringify({
        user: data.user,
        token: data.token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      }));
      setTimeout(() => {
        setLocation('/dashboard');
      }, 500);
    },
    onError: (error) => {
      setLoginError(error.message || 'Invalid credentials. Use admin/admin for demo.');
      setIsLoggingIn(false);
    }
  });

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    demoLoginMutation.mutate({ username, password });
  };

  const features = [
    {
      icon: MapPin,
      title: 'Real-Time Location Tracking',
      description: 'Track personnel and assets across campus with sub-second latency using multi-modal data fusion from Wi-Fi, RFID, and facial recognition.',
      color: 'text-cyan-400'
    },
    {
      icon: Camera,
      title: 'Intelligent Camera Network',
      description: 'Monitor 800+ cameras with AI-powered analytics, automatic threat detection, and seamless PTZ control from a unified interface.',
      color: 'text-green-400'
    },
    {
      icon: Bell,
      title: 'Smart Alert System',
      description: 'Receive prioritized alerts with AI confidence scores, automatic correlation clustering, and one-click incident creation.',
      color: 'text-yellow-400'
    },
    {
      icon: Activity,
      title: 'Incident Management',
      description: 'Coordinate response teams with real-time incident tracking, timeline visualization, and integrated communication tools.',
      color: 'text-orange-400'
    },
    {
      icon: Users,
      title: 'Entity Tracking',
      description: 'Maintain comprehensive profiles with movement history, risk scoring, and watchlist integration for enhanced situational awareness.',
      color: 'text-purple-400'
    },
    {
      icon: Zap,
      title: 'Data Fusion Engine',
      description: 'Combine multiple sensor inputs for accurate positioning and behavioral analysis using advanced machine learning algorithms.',
      color: 'text-red-400'
    }
  ];

  const stats = [
    { value: '800+', label: 'Cameras', icon: Camera },
    { value: '<1s', label: 'Latency', icon: Zap },
    { value: '24/7', label: 'Monitoring', icon: Eye },
    { value: '99.9%', label: 'Uptime', icon: Activity }
  ];

  const integrations = [
    { name: 'IREX Smart Cameras', icon: Camera },
    { name: 'Cisco Catalyst Center', icon: Wifi },
    { name: 'Access Control (RFID)', icon: Lock },
    { name: 'Motion Sensors', icon: Radio },
    { name: 'Facial Recognition', icon: Users },
    { name: 'Phone Signatures', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 grid-pattern opacity-50" />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
        
        {/* Animated circles */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge variant="outline" className="border-primary/50 text-primary">
                  <Shield className="w-3 h-3 mr-1" />
                  Emergency Location Intelligence
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="gradient-text">Brown University</span>
                  <br />
                  <span className="text-foreground">ELI Platform</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl">
                  Next-generation campus security platform with real-time location tracking, 
                  intelligent surveillance, and AI-powered threat detection.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => document.getElementById('demo-login')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Try Demo
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-border hover:bg-secondary"
                >
                  Learn More
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 pt-8">
                {stats.map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="text-center"
                  >
                    <stat.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right side - Login card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              id="demo-login"
            >
              <Card className="command-panel glow-border">
                <CardHeader className="space-y-1 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Command Center Access</CardTitle>
                      <CardDescription>Enter credentials to access the platform</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDemoLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                    
                    {loginError && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="w-4 h-4" />
                        {loginError}
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                          />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Access Platform
                        </>
                      )}
                    </Button>

                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground text-center mb-3">
                        Demo Credentials
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-secondary/50 rounded px-3 py-2">
                          <span className="text-muted-foreground">Username:</span>
                          <span className="ml-2 font-mono text-foreground">admin</span>
                        </div>
                        <div className="bg-secondary/50 rounded px-3 py-2">
                          <span className="text-muted-foreground">Password:</span>
                          <span className="ml-2 font-mono text-foreground">admin</span>
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-transparent" />
        <div className="container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-4xl font-bold mb-4">Comprehensive Security Platform</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for modern campus security operations with advanced AI capabilities 
              and seamless integration across all security systems.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="command-panel h-full hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 ${feature.color}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24 relative">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">Integrations</Badge>
            <h2 className="text-4xl font-bold mb-4">Unified Data Fusion</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Seamlessly integrate with existing security infrastructure for comprehensive 
              situational awareness and accurate location tracking.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {integrations.map((integration, i) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="command-panel p-4 text-center hover:border-primary/50 transition-colors"
              >
                <integration.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                <p className="text-sm font-medium">{integration.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
        <div className="container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="command-panel glow-border p-12 text-center"
          >
            <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Campus Security?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Experience the future of emergency location intelligence with our comprehensive 
              demo. See real-time tracking, AI-powered alerts, and seamless incident management in action.
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => document.getElementById('demo-login')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Demo Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold">Brown University ELI Platform</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Visium Technologies. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
