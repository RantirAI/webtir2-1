import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutDashboard, ShieldCheck, Braces, Palette, Grid3x3, Database, Sparkles, Code, Share2 } from "lucide-react";
import webtirLogo from "@/assets/webtir-logo.svg";
import rantirLogo from "@/assets/rantir-studio-logo.svg";
import pricingBadge from "@/assets/pricing-license-badge.svg";
import featureBlue from "@/assets/feature-blue.png";
import featureGreen from "@/assets/feature-green.png";
import featureOrange from "@/assets/feature-orange.png";
import featurePurple from "@/assets/feature-purple.png";
import cursorBlue from "@/assets/cursor-blue.svg";
import cursorPurple from "@/assets/cursor-purple.svg";
import cursorBlueAlt from "@/assets/cursor-blue-alt.svg";
import { useState } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const [licenseOpen, setLicenseOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[720px] mx-auto px-6 py-4 flex items-center justify-between">
          <img src={webtirLogo} alt="Webtir" className="h-6" style={{ maxWidth: '64px' }} />
          <div className="flex items-center gap-6">
            <Dialog open={licenseOpen} onOpenChange={setLicenseOpen}>
            <DialogTrigger asChild>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Fork the Repo for Free
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="text-xl">Webtir is under a Fair-Use license below</DialogTitle>
                <DialogDescription className="text-base pt-2">
                  For MIT for embedding the editor, white-labeling it, or changing the source code, you need an MIT-version of this license
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[50vh] pr-4">
                <div className="text-xs space-y-4 leading-relaxed">
                  <p className="font-semibold">Webtir by Rantir (or Rantir Studio) Fair-Use License</p>
                  <p>Version 1.0 — Effective 2025<br/>Copyright © 2025–present<br/>Rantir, Inc. (DBA HexigonAI, Inc.)</p>
                  
                  <div>
                    <p className="font-semibold">0. OVERVIEW</p>
                    <p>This document governs all licensing and data-handling terms for Rantir Cloud, Rantir Studio, Webtir, Drawtir SDK, or other TIR Templates, community templates, and all other components collectively referred to as the Software.</p>
                    <p>This document contains three combined sections:</p>
                    <ul className="list-disc pl-5">
                      <li>Rantir Fair-Use License (RFUL) — the default license for open-source usage</li>
                      <li>Rantir Enterprise License (REL) — applies to enterprise-designated components</li>
                      <li>Rantir Data Policy — applies to all deployments</li>
                    </ul>
                    <p>Where any conflict exists, the Enterprise License controls enterprise components, and the Data Policy controls all data-handling.</p>
                  </div>

                  <div>
                    <p className="font-semibold">1. LICENSED CONTENT & EXCLUSIONS</p>
                    <p>All files and directories containing .enterprise. in the filename or /enterprise/ in the path are not licensed under the Rantir Fair-Use License and require a valid Rantir Enterprise License to use in production.</p>
                    <p>All other files, except for third-party dependencies licensed under their original terms, are licensed under the Rantir Fair-Use License (RFUL) described below.</p>
                    <p>Content from branches other than the default branch is not licensed.</p>
                  </div>

                  <div>
                    <p className="font-semibold">2. RANTIR FAIR-USE LICENSE (RFUL)</p>
                    <p className="italic">Umbrella for all Webtir Uses and Github forks as it appears in the Github Library directly for this repo or any additional libraries under the Rantir Brand name or /Rantir or /RantirAI</p>
                    
                    <p className="font-semibold mt-2">2.1 Acceptance</p>
                    <p>By using the Software, you agree to all terms below.</p>

                    <p className="font-semibold mt-2">2.2 Copyright License</p>
                    <p>Rantir, Inc. grants you a non-exclusive, worldwide, non-transferable, royalty-free license to use, copy, modify, self-host, and prepare derivative works of the Software for:</p>
                    <ul className="list-disc pl-5">
                      <li>personal use</li>
                      <li>internal business use</li>
                      <li>development and testing</li>
                      <li>client services</li>
                      <li>research</li>
                      <li>plugin creation</li>
                      <li>template creation</li>
                      <li>private or internal commercial workflows</li>
                    </ul>
                    <p>This license does not permit resale, rebranding, commercial embedding, or SaaS integration and you will need an enterprise license for this work.</p>

                    <p className="font-semibold mt-2">2.3 Open-Source Use</p>
                    <p>The Software is free and open-source for personal and internal use, however the license is not open-source. You may run it on your own servers or desktop environments. You may modify the Software for your own purposes without requiring an enterprise subscription until it is for commercial or monetary gain in which you will need an enterprise or MIT-based license.</p>

                    <p className="font-semibold mt-2">2.4 Limitations</p>
                    <p>Under the RFUL, you may not:</p>
                    <ul className="list-disc pl-5">
                      <li>resell or rebrand the Software</li>
                      <li>embed the Software into a paid or public SaaS</li>
                      <li>create a competing platform, builder, template marketplace, or SDK</li>
                      <li>distribute modified or original versions for a fee</li>
                      <li>republish templates or components outside the Rantir ecosystem</li>
                      <li>remove or alter copyright or license notices</li>
                      <li>use Software content to train public or commercial AI models</li>
                      <li>incorporate the Software into another commercial product without enterprise rights</li>
                    </ul>
                    <p>Any such use requires an Enterprise License.</p>

                    <p className="font-semibold mt-2">2.5 Community Templates</p>
                    <p>Community templates must remain under the RFUL. They may be used, modified, and shared within the Rantir ecosystem. Creators retain ownership but grant Rantir a perpetual right to distribute.</p>
                  </div>

                  <div>
                    <p className="font-semibold">3. RANTIR ENTERPRISE LICENSE (REL)</p>
                    <p className="font-semibold mt-2">3.1 Enterprise Components</p>
                    <p>Files located in any path containing .enterprise. or /enterprise/ are governed by the Rantir Enterprise License.</p>

                    <p className="font-semibold mt-2">3.2 Production Use</p>
                    <p>Enterprise components may only be used in production if you hold a valid Enterprise License. You may modify these components and publish patches, but all modifications remain the property of Rantir.</p>

                    <p className="font-semibold mt-2">3.3 Commercial Rights</p>
                    <p>An Enterprise License grants the ability to:</p>
                    <ul className="list-disc pl-5">
                      <li>rebrand or white-label Rantir components</li>
                      <li>embed Rantir into paid SaaS products</li>
                      <li>resell Rantir-based products</li>
                      <li>create commercial template marketplaces</li>
                      <li>distribute derivative works externally</li>
                      <li>operate modified versions in production</li>
                    </ul>
                    <p>No commercial rights are granted under RFUL.</p>

                    <p className="font-semibold mt-2">3.4 Development & Testing</p>
                    <p>You may copy and modify enterprise components for development and testing without a subscription, but not use them in production.</p>

                    <p className="font-semibold mt-2">3.5 No Other Rights</p>
                    <p>No rights beyond those explicitly stated are granted.</p>
                  </div>

                  <div>
                    <p className="font-semibold">4. DATA POLICY (APPLICABLE TO RFUL & ENTERPRISE)</p>
                    <p className="font-semibold mt-2">4.1 General Data Handling</p>
                    <p>Rantir, Inc. does not use, store, analyze, sell, or repurpose any user data, project data, TIR templates, metadata, or content for model training, dataset generation, analytics-driven optimization, or commercial reuse. The Software never uses customer data to train, fine-tune, or improve any AI model.</p>

                    <p className="font-semibold mt-2">4.2 Ownership of Data</p>
                    <p>All data submitted, processed, or stored in the Software remains the sole property of the user or their organization.</p>

                    <p className="font-semibold mt-2">4.3 Environment Keys</p>
                    <p>Rantir Cloud allows users to store API keys for external AI providers such as OpenAI, Google Gemini, Anthropic, or AWS Bedrock. These keys are securely encrypted, never logged in plaintext, never analyzed, never repurposed, and never transmitted except to execute the specific API calls initiated by the user.</p>
                    <p>Rantir does not use these keys for background processing, analytics, dataset creation, or service optimization.</p>

                    <p className="font-semibold mt-2">4.4 Bring Your Own Key (BYOK)</p>
                    <p>When users provide their own third-party AI provider keys:</p>
                    <ul className="list-disc pl-5">
                      <li>data transmitted to those providers is governed solely by the providers' terms</li>
                      <li>Rantir does not access, reuse, or retain this data</li>
                      <li>Rantir does not create logs or datasets from transmitted content</li>
                      <li>Users are responsible for ensuring compliance with their chosen provider's data-handling requirements.</li>
                    </ul>

                    <p className="font-semibold mt-2">4.5 Model Training Prohibition</p>
                    <p>Rantir does not:</p>
                    <ul className="list-disc pl-5">
                      <li>use any customer data to train machine learning or generative AI models</li>
                      <li>create internal datasets from customer content</li>
                      <li>build derivative products from customer workflows, templates, or TIR structures</li>
                    </ul>

                    <p className="font-semibold mt-2">4.6 Data Retention</p>
                    <p>Rantir does not create persistent datasets from user interactions beyond what is required for operational correctness. No training corpora, fine-tuning datasets, or derivative models are produced from user data.</p>
                  </div>

                  <div>
                    <p className="font-semibold">5. PATENTS</p>
                    <p>Rantir grants a patent license only to the extent required to use the Software under the terms above. This patent license terminates immediately if you claim that the Software infringes any patent.</p>
                  </div>

                  <div>
                    <p className="font-semibold">6. NOTICES</p>
                    <p>You must ensure that anyone receiving the Software from you also receives a copy of this complete license. Modified versions must include prominent notices stating that you modified the original.</p>
                  </div>

                  <div>
                    <p className="font-semibold">7. TERMINATION</p>
                    <p>Any violation of these terms terminates your rights automatically. If you cure the violation within 30 days of notice, your rights may be reinstated once. A second violation results in permanent termination.</p>
                  </div>

                  <div>
                    <p className="font-semibold">8. NO WARRANTY</p>
                    <p>The Software is provided "as is," without any warranty of any kind. Rantir is not liable for any damages arising from the use of the Software.</p>
                  </div>

                  <div>
                    <p className="font-semibold">9. DEFINITIONS</p>
                    <ul className="list-disc pl-5">
                      <li>"Licensor" means Rantir, Inc. DBA (HexigonAI, Inc.)</li>
                      <li>"Software" includes all Rantir Cloud, Studio, TIR templates, Drawtir, Webtir, SDKs, and components.</li>
                      <li>"Enterprise Components" refers to files with .enterprise. or /enterprise/.</li>
                      <li>"Fair-Use License" refers to the RFUL terms above.</li>
                      <li>"Enterprise License" refers to the REL terms above.</li>
                      <li>"Commercial Use" includes SaaS integration, resale, redistribution, paid hosting, or rebranding.</li>
                      <li>"User Data" includes any files, workflows, templates, content, metadata, or information processed through the Software.</li>
                    </ul>
                  </div>
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between pt-4 border-t">
                <a 
                  href="https://github.com/RantirAI/webtir2-1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View on GitHub →
                </a>
                <Button onClick={() => setLicenseOpen(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>
          <a 
            href="https://calendly.com/rantir/30min" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
            </a>
            <Button variant="outline" size="sm" className="rounded-full px-4" asChild>
              <Link to="/builder">View demo</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[720px] mx-auto px-6 pt-20 pb-12 text-center space-y-6 relative">
        {/* Subtle dot pattern background */}
        <div className="absolute inset-0 -z-10 opacity-20 dark:opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}></div>
        
        {/* Animated cursors */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <img 
            src={cursorBlue} 
            alt="" 
            className="absolute w-16 animate-float-slow"
            style={{
              top: '20%',
              left: '10%',
              animation: 'float-1 15s ease-in-out infinite'
            }}
          />
          <img 
            src={cursorPurple} 
            alt="" 
            className="absolute w-16"
            style={{
              top: '60%',
              right: '15%',
              animation: 'float-2 18s ease-in-out infinite'
            }}
          />
          <img 
            src={cursorBlueAlt} 
            alt="" 
            className="absolute w-16"
            style={{
              bottom: '20%',
              left: '20%',
              animation: 'float-3 20s ease-in-out infinite'
            }}
          />
        </div>

        <style>{`
          @keyframes float-1 {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(30px, -20px); }
            50% { transform: translate(-20px, -40px); }
            75% { transform: translate(-30px, 10px); }
          }
          @keyframes float-2 {
            0%, 100% { transform: translate(0, 0); }
            33% { transform: translate(-40px, 30px); }
            66% { transform: translate(20px, -25px); }
          }
          @keyframes float-3 {
            0%, 100% { transform: translate(0, 0); }
            30% { transform: translate(40px, 20px); }
            60% { transform: translate(-30px, -30px); }
          }
        `}</style>

        <div className="flex justify-center mb-6">
          <img src={rantirLogo} alt="Rantir Studio" className="h-8" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">
          Own your own web visual editor
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Webtir makes it possible to embedded and customize your own drag-n-drop editors for anything your working on. Now with AI
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="rounded-full" asChild>
            <a href="https://calendly.com/rantir/30min" target="_blank" rel="noopener noreferrer">
              Request MIT License
            </a>
          </Button>
          <Button variant="outline" size="lg" className="rounded-full" asChild>
            <Link to="/builder">View demo</Link>
          </Button>
        </div>
      </section>

      {/* Video Section */}
      <section className="max-w-[720px] mx-auto px-6 py-8">
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-auto"
          >
            <source src="/webtir-promo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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
            <div className="rounded-lg overflow-hidden h-64">
              <img src={featureBlue} alt="Editor Interface Preview" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-green-50 dark:bg-green-950/20 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Lightweight & full-featured</h3>
            <p className="text-sm text-muted-foreground">
              Make the editor as simple or as complete as you need with support for variables, class-based styling, AI, and real-time collaboration. AI and more.
            </p>
            <div className="rounded-lg overflow-hidden h-64">
              <img src={featureGreen} alt="AI-Powered Features" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-orange-50 dark:bg-orange-950/20 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Integrate your UI and logic</h3>
            <p className="text-sm text-muted-foreground">
              Connect Webtir to your React components and business logic. No need to rip out your current framework. Drop it on top of what you have.
            </p>
            <div className="rounded-lg overflow-hidden h-64">
              <img src={featureOrange} alt="Component Integration" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl bg-purple-50 dark:bg-purple-950/20 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Matches with your brand</h3>
            <p className="text-sm text-muted-foreground">
              Fully theme the editor with your design system. Control colors, fonts, and behaviors, allowing for a seamless integration with your brand identity.
            </p>
            <div className="rounded-lg overflow-hidden h-64">
              <img src={featurePurple} alt="Brand Customization" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid 3x3 */}
      <section className="max-w-[720px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Row 1 */}
          <div className="space-y-3 p-6 rounded-lg border border-border bg-card">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Visual editor you can embed anywhere</h4>
            <p className="text-sm text-muted-foreground">
              Drop the Webtir canvas into your own app—from admin dashboards to partner portals—using a simple embeddable component and a small SDK.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-lg border border-border bg-card">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">MIT-licensed & white-label ready</h4>
            <p className="text-sm text-muted-foreground">
              Webtir is fully open source (MIT), so you can self-host, fork, and re-skin it as your own without legal gymnastics—plus optional $999/yr white-label and support.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-lg border border-border bg-card">
            <Braces className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Schema-driven configuration</h4>
            <p className="text-sm text-muted-foreground">
              Define components, props, and validation rules in a structured schema so the editor always knows what's allowed—and your product logic stays safe.
            </p>
          </div>

          {/* Row 2 */}
          <div className="space-y-3 p-6 rounded-lg border border-border bg-card">
            <Palette className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Class & token based styling</h4>
            <p className="text-sm text-muted-foreground">
              A full style system with classes, tokens, and breakpoints so teams can create consistent layouts instead of one-off inline styles.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-lg border border-border bg-card">
            <Grid3x3 className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Component drawer & prop controls</h4>
            <p className="text-sm text-muted-foreground">
              A searchable component drawer with per-component controls, toggles, sliders, and select inputs mapped directly to your prop types.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-lg border border-border bg-card">
            <Database className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Data bindings & actions</h4>
            <p className="text-sm text-muted-foreground">
              Point-and-click bindings to queries, collections, and actions—connect buttons to API calls, lists to data sources, and forms to submissions with guardrails.
            </p>
          </div>

          {/* Row 3 */}
          <div className="space-y-3 p-6 rounded-lg border border-border bg-card">
            <Sparkles className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">AI-assisted layouts & refactors</h4>
            <p className="text-sm text-muted-foreground">
              Let users ask "Make this a three-column pricing section" or "Tighten the spacing for mobile" and have AI update the layout through your own models.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-lg border border-border bg-card">
            <Code className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Code-first escape hatch</h4>
            <p className="text-sm text-muted-foreground">
              Designers get drag-and-drop; engineers keep code. Every change can be inspected as code, committed to git, and reviewed like any other PR.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-lg border border-border bg-card">
            <Share2 className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Plays nice with Lovable, v0, Cursor & friends</h4>
            <p className="text-sm text-muted-foreground">
              Use Webtir as the builder layer across AI dev tools—generate components in Lovable, refine flows in v0, or hand off to Cursor without locking into any single platform.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-[720px] mx-auto px-6 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
          <div className="mb-6 text-left">
            <img src={pricingBadge} alt="Pricing License" style={{ maxWidth: '100px' }} />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Free for forking, with an Extended MIT-License available</h2>
            <p className="text-muted-foreground">
              Webtir is fully open source under the MIT license. Fork it, run it anywhere, and build on top of it for free.
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
            <div className="flex items-center gap-4">
              <a 
                href="https://calendly.com/rantir/30min" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-sm text-primary hover:underline"
              >
                View pricing details →
              </a>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLicenseOpen(true)}
              >
                See license
              </Button>
            </div>
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
            <Button size="lg" asChild>
              <a href="https://calendly.com/rantir/30min" target="_blank" rel="noopener noreferrer">
                Schedule a demo
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/builder">Test-drive the Webtir demo</Link>
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
