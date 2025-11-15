import React from "react";

import "../styles/SpectrumBoard.css";

// SpectrumBoard.jsx
// Le spectrum affiche maintenant la vraie grille du plateau adverse (avec les trous)
export default function SpectrumBoard({ spectrum = [] }) {
    if (!spectrum || spectrum.length === 0) {
        return <p>En attente...</p>;
    }

    // Vérifier que le spectrum est bien un tableau 2D avec 10 colonnes
    const validSpectrum = spectrum.filter(row => Array.isArray(row) && row.length === 10);

    return (
        <div className="spectrum-board">
            {validSpectrum.map((row, y) => (
                <div key={y} className="spectrum-row">
                    {row.map((cell, x) => (
                        <div
                            key={x}
                            className={`spectrum-cell ${cell === 9 ? 'penalty' : cell !== 0 ? 'filled' : 'empty'}`}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
