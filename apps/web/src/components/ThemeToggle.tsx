"use client";
import { useEffect, useState } from "react";
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);
  return (
    <button
      onClick={() => setDark(v=>!v)}
      style={{ padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
      aria-label="Toggle dark mode"
    >
      {dark ? "Light mode" : "Dark mode"}
    </button>
  );
}
