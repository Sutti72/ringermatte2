import { supabase } from "./supabaseClient.js";

async function testConnection() {
  console.log("🔍 Teste Verbindung zu Supabase...");

  const { data, error } = await supabase.from("reservations").select("*");

  if (error) {
    console.error("❌ Verbindung fehlgeschlagen:", error.message);
  } else {
    console.log("✅ Verbindung erfolgreich! Gefundene Einträge:", data.length);
    console.log(data);
  }
}

testConnection();
