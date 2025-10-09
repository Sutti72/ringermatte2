import { supabase } from "../../../lib/supabaseClient";

// GET: Alle Reservierungen abrufen
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("GET Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// POST: Neue Reservierung speichern
export async function POST(request) {
  try {
    const reservation = await request.json();

    const { data, error } = await supabase
      .from("reservations")
      .insert([reservation]);

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("POST Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
