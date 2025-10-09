// src/testSupabaseConnection.js

// dotenv laden, damit Node die .env.local Variablen erkennt
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Variablen aus .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Prüfen, ob die Variablen vorhanden sind
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Fehlende Supabase Umgebungsvariablen!");
  process.exit(1);
}

// Supabase-Client erstellen
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(async () => {
  console.log("🔍 Teste Verbindung zu Supabase...");

  try {
    const { data, error } = await supabase.from('reservations').select('*');
    if (error) {
      console.error("❌ Fehler beim Abrufen der Daten:", error.message);
    } else {
      console.log(`✅ Verbindung erfolgreich! Gefundene Einträge: ${data.length}`);
      console.log(data);
    }
  } catch (err) {
    console.error("❌ Unerwarteter Fehler:", err.message);
  }
})();
