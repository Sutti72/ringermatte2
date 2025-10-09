"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ReservationForm() {
  const [formData, setFormData] = useState({
    vormane: "",
    name: "",
    adresse: "",
    ort: "",
    mail: "",
    reihe: "",
    spalte: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateEmail(formData.mail)) {
      setMessage("Bitte eine gültige E-Mail-Adresse eingeben.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("reservations").insert([{
      vormane: formData.vormane,
      name: formData.name,
      adresse: formData.adresse,
      ort: formData.ort,
      mail: formData.mail,
      reihe: parseInt(formData.reihe),
      spalte: parseInt(formData.spalte)
    }]);

    if (error) setMessage("Fehler beim Speichern: " + error.message);
    else {
      setMessage("Reservation erfolgreich gespeichert ✅");
      setFormData({
        vormane: "",
        name: "",
        adresse: "",
        ort: "",
        mail: "",
        reihe: "",
        spalte: ""
      });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-md w-full max-w-md">
      <h2 className="text-lg font-bold mb-3">Neue Reservation</h2>

      {["vormane","name","adresse","ort","mail"].map((field) => (
        <div key={field} className="mb-2">
          <label className="block text-sm font-medium capitalize">{field}</label>
          <input
            type="text"
            name={field}
            value={formData[field]}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            required
          />
        </div>
      ))}

      {["reihe","spalte"].map((field) => (
        <div key={field} className="mb-2">
          <label className="block text-sm font-medium capitalize">{field}</label>
          <input
            type="number"
            name={field}
            value={formData[field]}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            required
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Speichern..." : "Reservation speichern"}
      </button>

      {message && <p className="mt-2 text-sm">{message}</p>}
    </form>
  );
}
