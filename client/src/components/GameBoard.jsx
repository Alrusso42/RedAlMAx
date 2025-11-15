import "../styles/GameBoard.css";

export default function GameBoard({ board, piece}) {
  const pos = piece?.position || { x: 0, y: 0 };


  return (
    <div className="board">
      {board.map((row, y) => (
        <div key={y} className="row">
          {row.map((cell, x) => {
            const isPieceCell =
              piece?.shape[y - pos.y]?.[x - pos.x] === 1;

            // Déterminer la couleur selon le type de cellule
            let color;
            if (isPieceCell) {
              color = piece.color;
            } else if (cell === 9) {
              // Ligne de pénalité indestructible - gris foncé avec bordure rouge
              color = "#444";
            } else if (cell === 8) {
              // Couleur spéciale pour les flashs en mode invisible
              color = "orange";
            } else if (cell) {
              color = "gray";
            } else {
              color = "black";
            }

            return (
              <div
                key={x}
                className="cell"
                style={{ 
                  backgroundColor: color,
                  boxShadow: cell === 9 ? 'inset 0 0 3px rgba(255, 0, 0, 0.8)' : 'none'
                }}
              ></div>
            );
          })}
        </div>
      ))}
    </div>
  );
}