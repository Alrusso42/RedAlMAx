// NextPiece.jsx
import React from "react";

export default function NextPiece({ piece }) {
  if (!piece) return null;

  return (
    <div className="next-piece">
        <h2 style={{
          color: 'white',
        }}>Next Piece</h2>
      {piece.shape.map((row, y) => (
        <div key={y} className="row" style={{
          display: "flex",
          justifyContent: "center",
        }}>
          {row.map((cell, x) => (
            <div
              key={x}
              className="cell"
              style={{
                width: 20,
                height: 20,
                backgroundColor: cell ? piece.color : "transparent",
                border: cell ? "1px solid #333" : "1px solid transparent",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}