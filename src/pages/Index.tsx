import { Button } from "@/components/ui/button";
import webtirLogo from "@/assets/webtir-logo.svg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[720px] mx-auto px-6 py-4 flex items-center justify-between">
          <img src={webtirLogo} alt="Webtir" className="h-6" />
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
            <Button variant="outline" size="sm" className="rounded-full px-4">
              Sign in
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[720px] mx-auto px-6 pt-16 pb-12">
        <div className="text-center space-y-6">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
            Now in Beta
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Create your own visual editor in minutes
          </h1>
          <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
            Turbocharge your product experience by embedding customizable drag-n-drop editors
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="ghost" size="sm" className="text-sm">
              Request invite
            </Button>
            <Button size="sm" className="text-sm">
              Schedule a demo
            </Button>
          </div>
        </div>

        {/* Hero Video */}
        <div className="mt-12 rounded-xl overflow-hidden shadow-2xl border border-border/50">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <video
              className="absolute top-0 left-0 w-full h-full object-cover"
              src="/webtir-promo.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-[720px] mx-auto px-6 py-12">
        <div className="grid grid-cols-2 gap-4">
          {/* Card 1 */}
          <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/20 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Make your product interactive</h3>
            <p className="text-sm text-muted-foreground">
              Don't waste months building your positive drag-n-drop interface. Embed Webtir and let your users build, configure, and preview instantly.
            </p>
            <div className="rounded-lg bg-white dark:bg-background border border-border p-4 aspect-[4/3] flex items-center justify-center text-xs text-muted-foreground">
              Editor Interface Preview
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-green-50 dark:bg-green-950/20 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Lightweight & full-featured</h3>
            <p className="text-sm text-muted-foreground">
              Make the editor as simple or as complete as you need with support for variables, class-based styling, AI, and real-time collaboration. AI and more.
            </p>
            <div className="rounded-lg bg-white dark:bg-background border border-border p-4 aspect-[4/3] flex items-center justify-center text-xs text-muted-foreground">
              AI-Powered Features
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-orange-50 dark:bg-orange-950/20 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Integrate your UI and logic</h3>
            <p className="text-sm text-muted-foreground">
              Connect Webtir to your React components and business logic. No need to rip out your current framework. Drop it on top of what you have.
            </p>
            <div className="rounded-lg bg-white dark:bg-background border border-border p-4 aspect-[4/3] flex items-center justify-center text-xs text-muted-foreground">
              Component Integration
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl bg-purple-50 dark:bg-purple-950/20 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Matches with your brand</h3>
            <p className="text-sm text-muted-foreground">
              Fully theme the editor with your design system. Control colors, fonts, and behaviors, allowing for a seamless integration with your brand identity.
            </p>
            <div className="rounded-lg bg-white dark:bg-background border border-border p-4 aspect-[4/3] flex items-center justify-center text-xs text-muted-foreground">
              Brand Customization
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-[720px] mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          All the features you'd expect & then some
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {/* AI Assistant */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
              AI
            </div>
            <h4 className="font-semibold text-sm text-foreground">AI Assistant</h4>
            <p className="text-xs text-muted-foreground">
              Generate layouts, components, and class styles with prompts
            </p>
          </div>

          {/* Variables */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
              {'{ }'}
            </div>
            <h4 className="font-semibold text-sm text-foreground">Variables</h4>
            <p className="text-xs text-muted-foreground">
              Bind editor settings to your own data, environment variables, and feature flags
            </p>
          </div>

          {/* Realtime Collaboration */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
              👥
            </div>
            <h4 className="font-semibold text-sm text-foreground">Realtime Collaboration</h4>
            <p className="text-xs text-muted-foreground">
              Multiple users editing the same canvas at once
            </p>
          </div>

          {/* Styling */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
              🎨
            </div>
            <h4 className="font-semibold text-sm text-foreground">Styling</h4>
            <p className="text-xs text-muted-foreground">
              Webflow-style class system with reusable tokens, responsive controls, and pseudo-states
            </p>
          </div>

          {/* Components */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
              🧩
            </div>
            <h4 className="font-semibold text-sm text-foreground">Components</h4>
            <p className="text-xs text-muted-foreground">
              Drop in your own React components and map their props to visual controls
            </p>
          </div>

          {/* Publishing */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
              🚀
            </div>
            <h4 className="font-semibold text-sm text-foreground">Publishing</h4>
            <p className="text-xs text-muted-foreground">
              Sync changes back to your codebase, export config, or ship changes behind feature flags
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-[720px] mx-auto px-6 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">
              Webtir is <span className="font-semibold text-foreground">fully open source under the MIT license</span>. 
              Fork it, run it anywhere, and build on top of it for free.
            </p>
            <div className="pt-4 space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">$999</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="text-sm text-muted-foreground">
                White-label, commercial support, and integration help with platforms like Lovable, v0, and Cursor.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Priority support & SLAs
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Private onboarding sessions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Custom implementation support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Remove Webtir branding
                </li>
              </ul>
            </div>
            <a href="#" className="inline-flex text-sm text-primary hover:underline">
              View pricing details →
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-[720px] mx-auto px-6 py-16">
        <div className="rounded-2xl bg-muted/30 p-12 text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Let's get in touch</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We'd love to help your product embed Webtir, the next-level visual editor that can be embedded directly inside your own app or platform.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg">
              Schedule a demo
            </Button>
            <Button variant="outline" size="lg">
              Test-drive the Webtir demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-16">
        <div className="max-w-[720px] mx-auto px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <img src={webtirLogo} alt="Webtir" className="h-5 opacity-60" />
          <p>© 2025 Webtir. MIT Licensed.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
