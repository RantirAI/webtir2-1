import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./builder/styles/primitive-defaults.css";

createRoot(document.getElementById("root")!).render(<App />);
