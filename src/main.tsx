import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";

import { TonConnectUIProvider } from "@tonconnect/ui-react";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <TonConnectUIProvider manifestUrl="https://mvp-quicky.vercel.app/tonconnect-manifest.json">
    <App />
  </TonConnectUIProvider>
);
