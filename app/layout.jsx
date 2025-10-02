"use client";

import Image from "next/image";

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <head>
        <title>Ringermatte Reservierung</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ fontFamily: "Arial, sans-serif", margin: 0, padding: 0, backgroundColor: "#f5f5f5" }}>
        {/* Kopfzeile */}
        <header style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "#1e3a8a",
          color: "#fff",
          padding: "12px 16px",
          flexWrap: "wrap",       // Logo + Titel umbrechen bei schmalen Bildschirmen
        }}>
          {/* Logo responsive */}
          <div style={{ flexShrink: 0 }}>
            <Image
              src="/rs-sense-logo.png"
              alt="RS Sense Logo"
              width={200}       // max Breite
              height={60}       // max Höhe
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>

          {/* Titel */}
          <h1 style={{
            fontSize: "1.5rem",
            margin: 0,
            flexGrow: 1,      // Titel nimmt den restlichen Platz
            minWidth: 150,    // verhindert zu kleines Logo
          }}>
            Ringermatte Reservierung
          </h1>
        </header>

        {/* Hauptinhalt */}
        <main style={{ padding: 24 }}>
          {children}
        </main>

        {/* Fusszeile */}
        <footer style={{
          textAlign: "center",
          padding: 12,
          background: "#e5e7eb",
          marginTop: 24
        }}>
          © 2025 Ringermatte App
        </footer>
      </body>
    </html>
  );
}
