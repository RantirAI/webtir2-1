import { useTheme } from "next-themes";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const WebtirLogo = ({ isDark }: { isDark: boolean }) => (
  <svg width="133" height="25" viewBox="0 0 133 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto">
    <path d="M0.0113748 2.38393L2.67562 22.9629C2.7527 23.5582 3.20916 24 3.74726 24H11.0827C11.4882 24 11.8597 23.7468 12.0453 23.3438L15.5789 16.6338C15.8193 16.112 16.5168 16.24 16.5954 16.8204L17.5589 22.9708C17.6391 23.5626 18.0941 24 18.6294 24H25.9543C26.3685 24 26.7465 23.7358 26.9278 23.3193L35.8894 2.7404C36.2396 1.93633 35.7158 1 34.9158 1H28.4646C28.0132 1 27.6092 1.31301 27.4507 1.78548L25.5522 7.44537C25.4195 7.84106 25.6812 8.26316 26.0592 8.26316H28.7027C29.1652 8.26316 29.4148 8.8697 29.1138 9.26232L23.1071 16.1384C22.7443 16.6116 22.0558 16.237 22.1651 15.6258L23.2535 10.5003C23.3205 10.1257 23.0643 9.77631 22.7226 9.77631H19.516C19.1512 9.77631 18.8908 9.38116 18.999 8.99165L20.7818 2.56933C20.9981 1.7903 20.4773 1 19.7477 1H14.3769C13.9312 1 13.531 1.30536 13.3686 1.76941L11.4906 7.13471C11.3517 7.53166 11.6135 7.96053 11.9948 7.96053H14.3769C14.8359 7.96053 15.0866 8.55905 14.7928 8.95327L8.85096 15.9662C8.48691 16.4546 7.78169 16.0655 7.90694 15.4454L9.1575 10.2123C9.23395 9.83373 8.97651 9.47368 8.6294 9.47368H5.71819C5.3511 9.47368 5.09043 9.07391 5.20276 8.6832L6.95724 2.58096C7.1819 1.79955 6.66056 1 5.92638 1H1.08301C0.423267 1 -0.083129 1.65397 0.0113748 2.38393Z" fill={isDark ? "#FFFFFF" : "#141526"}/>
    <path d="M122.784 24.0072V8.02433H127.39V11.785H127.484V24.0072H122.784ZM127.484 15.671L127.077 11.879C127.453 10.521 128.069 9.48681 128.926 8.77646C129.783 8.06611 130.848 7.71094 132.123 7.71094C132.519 7.71094 132.812 7.75272 133 7.83629V12.2238C132.896 12.182 132.749 12.1611 132.561 12.1611C132.373 12.1402 132.143 12.1297 131.872 12.1297C130.368 12.1297 129.26 12.4013 128.55 12.9445C127.84 13.4669 127.484 14.3757 127.484 15.671Z" fill={isDark ? "#FFFFFF" : "#141526"}/>
    <path d="M115.904 24.0072V8.02437H120.604V24.0072H115.904ZM115.747 5.89332V0.816406H120.761V5.89332H115.747Z" fill={isDark ? "#FFFFFF" : "#141526"}/>
    <path d="M112.017 24.352C109.97 24.352 108.444 23.861 107.442 22.8791C106.46 21.8762 105.969 20.3615 105.969 18.3349V4.45176L110.67 2.69678V18.4916C110.67 19.202 110.868 19.7347 111.265 20.0899C111.662 20.4451 112.278 20.6227 113.114 20.6227C113.427 20.6227 113.72 20.5913 113.991 20.5287C114.263 20.466 114.535 20.3929 114.806 20.3093V23.8819C114.535 24.0282 114.148 24.1431 113.647 24.2267C113.166 24.3102 112.623 24.352 112.017 24.352ZM102.992 11.597V8.0244H114.806V11.597H102.992Z" fill={isDark ? "#FFFFFF" : "#141526"}/>
    <path d="M96.4962 24.3207C94.9711 24.3207 93.728 23.9655 92.7669 23.2552C91.8267 22.5448 91.2731 21.5733 91.1059 20.3406L91.3566 20.3093V24.0073H86.7498V1.44324H91.4507V11.5657L91.1686 11.503C91.3984 10.3331 92.0043 9.41378 92.9863 8.74522C93.9891 8.05576 95.2427 7.71103 96.747 7.71103C98.1885 7.71103 99.4317 8.05576 100.476 8.74522C101.542 9.41378 102.357 10.3644 102.921 11.5971C103.506 12.8297 103.798 14.2818 103.798 15.9532C103.798 17.6455 103.495 19.1184 102.889 20.372C102.283 21.6255 101.437 22.597 100.351 23.2865C99.2645 23.976 97.9796 24.3207 96.4962 24.3207ZM95.18 20.56C96.2873 20.56 97.1857 20.1631 97.8752 19.3691C98.5646 18.5752 98.9093 17.447 98.9093 15.9845C98.9093 14.522 98.5542 13.4043 97.8438 12.6313C97.1544 11.8582 96.2455 11.4717 95.1173 11.4717C94.0309 11.4717 93.1325 11.8687 92.4222 12.6626C91.7327 13.4356 91.388 14.5534 91.388 16.0159C91.388 17.4783 91.7327 18.6066 92.4222 19.4005C93.1325 20.1735 94.0518 20.56 95.18 20.56Z" fill={isDark ? "#FFFFFF" : "#141526"}/>
    <path d="M77.8427 24.3206C76.0668 24.3206 74.5207 23.9759 73.2045 23.2864C71.8883 22.5761 70.8645 21.5941 70.1333 20.3405C69.4229 19.087 69.0677 17.6454 69.0677 16.0158C69.0677 14.3652 69.4229 12.9237 70.1333 11.691C70.8645 10.4374 71.8778 9.46592 73.1732 8.77646C74.4685 8.06611 75.9728 7.71094 77.686 7.71094C79.3365 7.71094 80.7676 8.04522 81.9794 8.71378C83.1912 9.38235 84.1314 10.3121 84.7999 11.503C85.4685 12.6938 85.8028 14.0936 85.8028 15.7024C85.8028 16.0367 85.7923 16.35 85.7714 16.6425C85.7505 16.9142 85.7192 17.1753 85.6774 17.426H71.8256V14.3235H81.8854L81.0706 14.8876C81.0706 13.5922 80.7572 12.6416 80.1304 12.0357C79.5245 11.4089 78.6888 11.0955 77.6233 11.0955C76.3906 11.0955 75.4296 11.5134 74.7401 12.3491C74.0715 13.1848 73.7373 14.4384 73.7373 16.1098C73.7373 17.7394 74.0715 18.9512 74.7401 19.7451C75.4296 20.539 76.4533 20.936 77.8113 20.936C78.5635 20.936 79.2111 20.8106 79.7543 20.5599C80.2975 20.3092 80.705 19.9018 80.9766 19.3377H85.3954C84.873 20.8838 83.9747 22.106 82.7002 23.0044C81.4466 23.8818 79.8275 24.3206 77.8427 24.3206Z" fill={isDark ? "#FFFFFF" : "#141526"}/>
    <path d="M45.3618 24.0073L39 1.44324H43.8889L49.1538 22.0956H47.6182L52.3191 1.44324H57.8034L62.4416 22.0956H60.9373L66.2336 1.44324H70.9031L64.5413 24.0073H59.151L54.3561 3.76232H55.6097L50.7521 24.0073H45.3618Z" fill={isDark ? "#FFFFFF" : "#141526"}/>
  </svg>
);

const footerLinks = [
  { label: "Documentation", href: "https://www.rantir.com/documentation" },
  { label: "Embed", href: "https://github.com/RantirAI/webtir2-1" },
];

export const PageFooter = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [licenseOpen, setLicenseOpen] = useState(false);
  const [roadmapOpen, setRoadmapOpen] = useState(false);

  return (
    <footer className="fixed bottom-4 right-4 z-50 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg px-4 py-2">
      <div className="flex items-center gap-4">
        <WebtirLogo isDark={isDark} />
        <div className="h-4 w-px bg-border" />
        
        {/* License Dialog */}
        <Dialog open={licenseOpen} onOpenChange={setLicenseOpen}>
          <DialogTrigger asChild>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              License
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-xl">Webtir is under a Fair-Use license below</DialogTitle>
              <DialogDescription className="text-base pt-2">
                Purchase an Extended License for Commercial Use
              </DialogDescription>
            </DialogHeader>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3 text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              <span className="font-semibold">⚠️ Important:</span> While our source code is open our license is not. Forking and using Webtir's builder is free and available only for educational, personal and small business usages as a single installation per company. For reseller, SaaS-integration or installing it for multiple end users or clients you will need an extended license.
            </div>
            <ScrollArea className="h-[45vh] pr-4">
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
            <div className="flex flex-col gap-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <a 
                  href="https://github.com/RantirAI/webtir2-1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View on GitHub →
                </a>
                <Button onClick={() => setLicenseOpen(false)}>Get an Extended License</Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Rantir reserves the right to deny an Extended Usage license at any time to any company.
              </p>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Roadmap Dialog */}
        <Dialog open={roadmapOpen} onOpenChange={setRoadmapOpen}>
          <DialogTrigger asChild>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Roadmap
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-xl">Webtir Roadmap & Changelog</DialogTitle>
              <DialogDescription className="text-base pt-2">
                What's coming to Webtir in the next few months
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[50vh] pr-4">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">📅 November 2024</h3>
                  <h4 className="font-semibold text-foreground">AI Builder Interface (Foundational Release)</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Introduces a first version of Webtir's AI interaction layer. Users can now generate layouts, modify sections, and request styling changes directly through natural language prompts. Designed for bring-your-own-model setups and fully compatible with OpenAI, Gemini, and local inference.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The component and style selector is foundationally in beta version with code export & code change (or insert)
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">📅 December 2024</h3>
                  <h4 className="font-semibold text-foreground">Dynamic Variables & State System</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Adds a fully integrated variable framework that allows content, styles, bindings, and component props to be driven by user-defined values. Enables dynamic text, responsive layouts, custom tokens, feature flags, and multi-state components.
                  </p>
                  <h4 className="font-semibold text-foreground mt-3">Live Multi-User Editing</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Real-time collaboration arrives with synchronized cursors, conflict-free editing, and presence indicators. Multiple editors can work on the same canvas without overwrites, merges, or locking.
                  </p>
                  <h4 className="font-semibold text-foreground mt-3">Webflow & HTML Copy or Paste</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Adding the ability to upload and convert or edit Webflow, HTML for Figma based elements.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">📅 January 2025</h3>
                  <h4 className="font-semibold text-foreground">Advanced Styling Workspace</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Releases a comprehensive CSS-driven styling suite: class creation, reusable tokens, spacing rules, effects, borders, grids, and responsive breakpoints. Designed to mirror professional tools like Webflow but with export-clean, class-only output that fits directly into your design system.
                  </p>
                  <h4 className="font-semibold text-foreground mt-3">Component Authoring & Local Reuse</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ships a new system allowing users to author their own reusable components inside Webtir. Each component can expose props, variants, and internal structure, enabling true modular page-level editing.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">📅 February 2025</h3>
                  <h4 className="font-semibold text-foreground">Versioned Publishing Pipeline</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Launches live publishing workflows: version history, restore points, preview environments, and production pushes. All changes are stored, diffable, and deployable as code or as JSON schemas.
                  </p>
                  <h4 className="font-semibold text-foreground mt-3">Custom Components — Editable & Extensible</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Upgrades component support to allow full custom authoring with code overrides, editable slots, and schema-driven inputs. Gives teams the ability to create design-system-ready building blocks that non-technical users can safely edit, remix, and reuse.
                  </p>
                </div>
              </div>
            </ScrollArea>
            <div className="flex items-center justify-end pt-4 border-t">
              <Button onClick={() => setRoadmapOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {footerLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
};