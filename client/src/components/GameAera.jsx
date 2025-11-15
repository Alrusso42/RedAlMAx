import GameBoard from "./GameBoard";
import NextPiece from "./NextPiece";
import SpectrumBoard from "./SpectrumBoard";

import "../styles/GameAera.css";


export default function GameAera({ board, currentPiece, nextPiece, score, level, opponentSpectrum, opponentName }) {
    return (
        <div className="game-aera">
            <div className="board-container">
                <GameBoard
                    board={board}
                    piece={
                        currentPiece || { shape: [], position: { x: 0, y: 0 }, color: "transparent" }
                    }
                />
            </div>
            <div className="column-info">

                <h2 className="score">Score : {score}</h2>
                <h2 className="level">Level : {level}</h2>

                <div className="next-piece-container">
                    <NextPiece piece={nextPiece} />
                </div>

                <div className="spectrum-container">
                    <h3>Adversaire {opponentName && `(${opponentName})`}</h3>
                    <div className="spectrum-bars">
                        {opponentSpectrum && opponentSpectrum.length > 0 ? (
                            <SpectrumBoard spectrum={opponentSpectrum} />
                        ) : (
                            <p>En attente...</p>
                        )}
                    </div>
                </div>

            </div>



        </div>

    )
}
