import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Lock, 
  Users, 
  FileText, 
  Key, 
  Smartphone,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';


// UPDATED FEATURES LIST (accurate for your project)
const features = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'AES-256-GCM encryption ensures your files are secured before they leave your device.',
  },
  {
    icon: FileText,
    title: 'Encrypted Notes',
    description: 'Store personal or work notes securely with full client-side encryption.',
  },
  {
    icon: Key,
    title: 'Password Vault',
    description: 'Manage your passwords in a zero-knowledge encrypted vault.',
  },
  {
    icon: Smartphone,
    title: 'Session Management',
    description: 'Monitor active logins and remotely revoke sessions anytime.',
  },
  {
    icon: Shield,
    title: 'Two-Factor Authentication',
    description: 'Add an additional security layer to protect your account.',
  },
  {
    icon: Users,
    title: 'Secure File Sharing',
    description: 'Share encrypted files with expiry timers, max opens, and password protection.',
  },
];


// SECURITY FEATURES LIST
const securityFeatures = [
  'Zero-knowledge architecture',
  'Client-side encryption',
  'Password-protected share links',
  'Activity logging',
  'Self-destruct share links',
  'AES-256-GCM security',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Lock className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">SecureVault</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-primary hover:bg-primary/90">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto max-w-5xl relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Military-Grade Security</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Digital Fortress
              <br />
              <span className="gradient-text">Encrypted & Private</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Secure encrypted file storage, password management, and encrypted notes —
              all protected with true zero-knowledge encryption.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="btn-gradient px-8 py-6 text-lg">
                  Start Secure Storage
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link to="/login">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Security Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
              {securityFeatures.slice(0, 4).map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for  
              <span className="gradient-text"> Secure Storage</span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to protect your data and privacy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="p-6 rounded-xl glass-card hover-lift">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Security at Every Layer
              </h2>

              <p className="text-lg text-muted-foreground mb-8">
                SecureVault uses true zero-knowledge architecture.
                Only you can decrypt your files.
              </p>

              <div className="space-y-4">
                {securityFeatures.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

            </div>

            <div className="relative">
              <div className="glass-card p-8 rounded-2xl">

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Lock className="h-6 w-6 text-primary-foreground" />
                  </div>

                  <div>
                    <h4 className="font-semibold">AES-256-GCM Encryption</h4>
                    <p className="text-sm text-muted-foreground">Military-grade protection</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-mono text-muted-foreground">Encryption</span>
                    <span className="text-sm font-medium text-success">Enabled</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-mono text-muted-foreground">Key Strength</span>
                    <span className="text-sm font-medium">256-bit</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-mono text-muted-foreground">Zero-Knowledge</span>
                    <span className="text-sm font-medium text-success">Active</span>
                  </div>
                </div>

              </div>

              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
            </div>

          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card rounded-2xl p-12 text-center relative overflow-hidden">
            
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Protect Your Data?
              </h2>

              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of users who trust SecureVault with their sensitive files and passwords.
              </p>

              <Link to="/signup">
                <Button size="lg" className="btn-gradient px-10 py-6 text-lg">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <span className="font-semibold">SecureVault</span>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2024 SecureVault. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
