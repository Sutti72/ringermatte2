import { supabase } from '../../../lib/supabaseClient';

export async function POST(req) {
  try {
    const reservation = await req.json();

    const { error } = await supabase
      .from('reservations')
      .insert([reservation]);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

