import React from "react"           // React-Bibliothek importieren
import ReactDOM from "react-dom/client" // ReactDOM für das Rendern in den Browser
import App from "./App"              // Haupt-App-Komponente importieren

// Finde das HTML-Element mit id="root" und erstelle dort die React-App
// Das Element befindet sich in index.html
ReactDOM.createRoot(document.getElementById("root")).render(
    // StrictMode aktiviert zusätzliche Warnungen und Checks während der Entwicklung
    // Es rendert Komponenten zweimal um Seiteneffekte zu finden (nur im Dev-Modus)
    <React.StrictMode>
        <App /> {/* Rendere die Haupt-App-Komponente */}
    </React.StrictMode>
)
