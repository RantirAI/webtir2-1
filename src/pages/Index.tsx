import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Visual Website Builder</h1>
        <p className="text-xl text-muted-foreground">Build beautiful websites with drag and drop</p>
        <Button onClick={() => navigate('/builder')} size="lg">
          Open Builder
        </Button>
      </div>
    </div>
  );
};

export default Index;
