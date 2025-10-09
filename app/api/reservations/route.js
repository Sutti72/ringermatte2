import { supabase } from "../../../lib/supabaseClient";

export async function POST(request) {
  try {
    const { name, date, persons } = await request.json();

    const { data, error } = await supabase
      .from("reservations")
      .insert([{ name, date, persons }]);

    if (error) throw error;

    return new Response(JSON.stringify({ message: "Reservierung gespeichert", data }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase.from("reservations").select("*");
    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
