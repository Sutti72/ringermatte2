import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const data = await req.json(); // Array von Reservierungen [{ vorname, name, adresse, ort, mail, reihe, spalte }]
    
    if (!Array.isArray(data) || data.length === 0) {
      return new Response(JSON.stringify({ error: "Keine Reservierungen gesendet" }), { status: 400 });
    }

    // Optional: Hier könntest du Validierungen einbauen
    for (const r of data) {
      if (!r.vorname || !r.name || !r.adresse || !r.ort || r.reihe === undefined || r.spalte === undefined) {
        return new Response(JSON.stringify({ error: "Fehlende Pflichtfelder" }), { status: 400 });
      }
    }

    const { error } = await supabase.from("reservations").insert(data);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "Reservierungen erfolgreich gespeichert" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

