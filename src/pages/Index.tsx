import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import webtirSdkLogo from "@/assets/webtir-sdk-logo.png";
import { PageFooter } from "@/builder/components/PageFooter";
import { Layers, Type, Layout, Image, Video, Code } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="h-10 bg-[#1a1a1a] flex items-center justify-center text-white text-sm">
        GET ACCESS TO OUR EMBED YEARLY LICENSE FOR 50% OFF FOR BETA RELEASE USING CODE: DRAWTIR50
      </div>

      {/* Main Content with Dotted Background */}
      <div className="min-h-[calc(100vh-40px)] relative">
        {/* Dotted Background Pattern - More Visible */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'radial-gradient(circle, #9ca3af 1.5px, transparent 1.5px)',
            backgroundSize: '20px 20px'
          }}
        />

        {/* Logo and Test Demo Button */}
        <div className="relative z-10 flex justify-between items-center px-12 pt-8">
          <img src={webtirSdkLogo} alt="Webtir SDK" className="h-12" />
          <Button 
            onClick={() => navigate('/builder')} 
            className="bg-primary hover:bg-primary/90"
          >
            Test the Demo
          </Button>
        </div>

        {/* Builder Interface Mockup */}
        <div className="relative z-10 px-8 py-8 flex gap-4 max-w-[1600px] mx-auto">
          {/* Left Sidebar - Elements Panel */}
          <div className="w-64 bg-white border border-border rounded-xl shadow-lg p-4 space-y-4 h-[600px] overflow-y-auto cursor-move hover:shadow-xl transition-shadow">
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Layout className="w-4 h-4" />
                LAYOUTS
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <Layout className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs text-center">Section</p>
                </div>
                <div className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <Layout className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs text-center">Container</p>
                </div>
                <div className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <Layout className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs text-center">Box</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Type className="w-4 h-4" />
                TYPOGRAPHY
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <Type className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs text-center">Heading</p>
                </div>
                <div className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <Type className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs text-center">Text</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Image className="w-4 h-4" />
                MEDIA
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <Image className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs text-center">Image</p>
                </div>
                <div className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <Video className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs text-center">Video</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center Canvas */}
          <div className="flex-1 bg-white border-2 border-primary rounded-xl shadow-2xl p-8 min-h-[600px] relative">
            {/* Section Badge */}
            <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-medium flex items-center gap-1">
              Section
              <div className="flex gap-0.5">
                <button className="hover:bg-primary-foreground/20 p-0.5 rounded">↑</button>
                <button className="hover:bg-primary-foreground/20 p-0.5 rounded">↓</button>
              </div>
            </div>

            {/* Canvas with selected section */}
            <div className="border-2 border-primary rounded-lg p-8 bg-muted/10 relative">
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold">Build Beautiful Websites</h2>
                <p className="text-lg text-muted-foreground">
                  Visual website builder with drag and drop
                </p>
              </div>

              {/* Bento Grid Layout */}
              <div className="grid grid-cols-3 gap-4 mt-12">
                {/* Top Row - 3 equal cards */}
                <div className="bg-background border border-border rounded-xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
                    <Layout className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Visual Design</h3>
                  <p className="text-sm text-muted-foreground">
                    Design visually with intuitive tools
                  </p>
                </div>

                <div className="bg-background border border-border rounded-xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
                    <Code className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Edit Visually</h3>
                  <p className="text-sm text-muted-foreground">
                    Adjust colors and layouts easily
                  </p>
                </div>

                <div className="bg-background border border-border rounded-xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
                    <Layers className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Brand Guide</h3>
                  <p className="text-sm text-muted-foreground">
                    Bring your design systems
                  </p>
                </div>
              </div>

              {/* Bottom Row - 2 wider cards */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-background border border-border rounded-xl p-8 space-y-3">
                  <h3 className="font-semibold text-lg">Open source</h3>
                  <p className="text-sm text-muted-foreground">
                    Work together and build seamlessly
                  </p>
                </div>

                <div className="bg-background border border-border rounded-xl p-8 space-y-3">
                  <h3 className="font-semibold text-lg">Export & Embed</h3>
                  <p className="text-sm text-muted-foreground">
                    Get production-ready code
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Layers Panel */}
          <div className="w-64 bg-white border border-border rounded-xl shadow-lg p-4 space-y-3 h-[600px] overflow-y-auto cursor-move hover:shadow-xl transition-shadow">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Layers
            </h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md border border-primary">
                <Layout className="w-4 h-4" />
                <span className="text-sm">Section</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-md ml-4">
                <Type className="w-4 h-4" />
                <span className="text-sm">Heading</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-md ml-4">
                <Type className="w-4 h-4" />
                <span className="text-sm">Text</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <PageFooter />
    </div>
  );
};

export default Index;
