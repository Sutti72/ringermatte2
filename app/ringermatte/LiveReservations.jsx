"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LiveReservations() {
  const [reservations, setReservations] = useState([]);
  const [newIds, setNewIds] = useState([]);

  useEffect(() => {
    // Initiale Daten laden (neuste oben)
    const loadReservations = async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("vreated_at", { ascending: false }); // neuste zuerst

      if (!error && data) setReservations(data);
    };
    loadReservations();

    // Realtime abonnieren
    const channel = supabase
      .channel("realtime:reservations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reservations" },
        (payload) => {
          console.log("Neue Reservation:", payload.new);
          setReservations((curr) => [payload.new, ...curr]);
          setNewIds((curr) => [...curr, payload.new.id]);

          // Hervorhebung nach 5 Sekunden entfernen
          setTimeout(() => {
            setNewIds((curr) => curr.filter((id) => id !== payload.new.id));
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Aktuelle Reservationen</h2>
      <table className="table-auto border-collapse border border-gray-300 w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Vorname</th>
            <th className="border px-2">Name</th>
            <th className="border px-2">Adresse</th>
            <th className="border px-2">Ort</th>
            <th className="border px-2">Mail</th>
            <th className="border px-2">Reihe</th>
            <th className="border px-2">Spalte</th>
            <th className="border px-2">Erstellt am</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr
              key={r.id}
              className={newIds.includes(r.id) ? "bg-yellow-100 transition-colors" : ""}
            >
              <td className="border px-2">{r.vormane}</td>
              <td className="border px-2">{r.name}</td>
              <td className="border px-2">{r.adresse}</td>
              <td className="border px-2">{r.ort}</td>
              <td className="border px-2">{r.mail}</td>
              <td className="border px-2">{r.reihe}</td>
              <td className="border px-2">{r.spalte}</td>
              <td className="border px-2">{new Date(r.vreated_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
