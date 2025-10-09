"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LiveReservations() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    // 1️⃣ Channel für Echtzeit-Updates
    const channel = supabase
      .channel('public:reservations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        payload => {
          setReservations(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    // 2️⃣ Initial laden
    supabase.from('reservations').select('*').then(({ data }) => {
      if (data) setReservations(data);
    });

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div>
      <h3>Live Reservierungen</h3>
      {reservations.length === 0 ? (
        <p>Keine Reservierungen</p>
      ) : (
        <ul>
          {reservations.map((r, idx) => (
            <li key={idx}>
              {r.vorname} {r.name} – Reihe {r.reihe}, Spalte {r.spalte}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
