"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LiveReservations() {
  const [reservations, setReservations] = useState([]);

  // Lade initiale Daten
  const fetchReservations = async () => {
    const res = await fetch("/api/reservations");
    const data = await res.json();
    setReservations(data);
  };

  useEffect(() => {
    fetchReservations();

    // Optional: Realtime Updates via Supabase
    const subscription = supabase
      .channel("reservations")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, payload => {
        fetchReservations(); // oder direkt payload.new hinzufügen
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  return (
    <div>
      <h3>Reservierungen</h3>
      {reservations.length === 0 ? (
        <p>Keine Reservierungen</p>
      ) : (
        <ul>
          {reservations.map((r, index) => (
            <li key={index}>
              {r.vorname} {r.name} - {r.adresse}, {r.ort} - {r.mail || "keine Mail"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
