import React, { useEffect } from "react";

// In the Vite build, all styles from cssText are included in index.css.
// This component only injects the Google Fonts link that was dynamically added.
export default function GS() {
  useEffect(function () {
    if (!document.getElementById('locqar-fonts')) {
      var l = document.createElement('link'); l.id = 'locqar-fonts'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800;900&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&family=DM+Sans:wght@700;800;900&display=swap';
      document.head.appendChild(l);
    }
  }, []);
  return null;
}
