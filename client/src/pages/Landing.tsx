import { useState, useEffect, useRef } from 'react';
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
  Eye,
  Video,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const bRollVideos = [
  { id: 1, path: '/videos/Aerial_drone_shot_202512190257_k2dt8.mp4', description: "Aerial drone shot circling Brown University's Main Green at golden hour." },
  { id: 2, path: '/videos/Smooth_tracking_shot_202512190257_ix12a.mp4', description: "Tracking shot through Barus & Holley engineering building." },
  { id: 3, path: '/videos/Timelapse_of_sciences_202512190257_02tnf.mp4', description: "Time-lapse of Sciences Library (SciLi) from dawn to dusk." },
  { id: 4, path: '/videos/Establishing_shot_of_202512190257_j2z4n.mp4', description: "Keeney Quad residential area at night with security lighting." },
  { id: 11, path: '/videos/Extreme_closeup_of_202512190257_3u2qj.mp4', description: "Extreme close-up of a modern dome security camera rotating." },
  { id: 13, path: '/videos/Closeup_of_an_202512190257_8e7cb.mp4', description: "RFID card being tapped against a modern access control reader." },
  { id: 21, path: '/videos/Wide_shot_of_202512190258_c01cv.mp4', description: "Modern security operations center with curved video wall." },
  { id: 22, path: '/videos/Overtheshoulder_shot_of_202512190258_mphfb.mp4', description: "Security operator analyzing real-time location tracking." },
  { id: 31, path: '/videos/Students_walking_safely_202512190258_robs5.mp4', description: "Students walking safely across campus at night." },
  { id: 45, path: '/videos/Ai_facial_recognition_202512190300_zgzuc.mp4', description: "AI facial recognition visualization with confidence scores." },
];

function BRollSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionType, setTransitionType] = useState('fade');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bRollVideos.length);
      const types = ['fade', 'slide', 'dissolve'];
      setTransitionType(types[Math.floor(Math.random() * types.length)]);
    }, 10000); // Change video every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
    },
    dissolve: {
      initial: { opacity: 0, scale: 1.1 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    },
  };

  const activeVariant = variants[transitionType as keyof typeof variants];

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-2xl border border-border glow-border group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={activeVariant.initial}
          animate={activeVariant.animate}
          exit={activeVariant.exit}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <video
            ref={videoRef}
            src={bRollVideos[currentIndex].path}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <Badge variant="outline" className="mb-2 bg-primary/20 text-primary border-primary/50">
              <Video className="w-3 h-3 mr-1" />
              Live Demonstration Feed
            </Badge>
            <p className="text-white text-lg font-medium">
              {bRollVideos[currentIndex].description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation dots */}
      <div className="absolute bottom-6 right-6 flex gap-2">
        {bRollVideos.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? 'bg-primary w-6' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const demoLoginMutation = trpc.auth.demoLogin.useMutation({
    onSuccess: (data) => {
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
                  onClick={() => document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Resources
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

            {/* Right side - Login card or B-Roll */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <BRollSection />
              <Card className="command-panel glow-border" id="demo-login">
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

      {/* Resources & CEO Content Section */}
      <section className="py-24 relative bg-secondary/20" id="resources">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/50">Resources</Badge>
              <h2 className="text-4xl font-bold">Executive Overview & Materials</h2>
              <p className="text-muted-foreground text-lg">
                Access the official Brown University ELI initiative presentation and hear directly from our leadership 
                about the mission to transform campus safety through advanced technology.
              </p>
              
              <div className="space-y-4 pt-4">
                <Card className="command-panel border-primary/20 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500">
                        <FileDown className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold">ELI Presentation Deck</h3>
                        <p className="text-sm text-muted-foreground">PowerPoint Presentation (Final)</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href="/docs/Brown_ELI_Presentation_Final.pptx" download>
                        <FileDown className="w-5 h-5" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="command-panel border-primary/20 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold">Security Initiative PR</h3>
                        <p className="text-sm text-muted-foreground">v1 Documentation</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href="/docs/Campus Safety Initiative PR v1.docx" download>
                        <FileDown className="w-5 h-5" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="command-panel glow-border overflow-hidden">
                <div className="aspect-video relative bg-black group">
                  <video 
                    src="/docs/Campus Safety Initiative_1080p.mp4" 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    controls
                    poster="/images/ceo-video-poster.jpg" // Note: This might not exist, but good practice
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        ML
                      </div>
                      <div>
                        <p className="text-white font-bold">Mark Lucky</p>
                        <p className="text-white/70 text-sm font-medium">CEO, Visium Technologies</p>
                      </div>
                    </div>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Vision for Campus Safety</CardTitle>
                  <CardDescription>
                    Mark Lucky discusses the Emergency Location Intelligence (ELI) platform and its impact on modernizing security.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
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
