// TetrisGame.jsx - L'ancien contenu de App.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";
import GameAera from "./GameAera";
import "../App.css";
import "../RoomStyles.css";

export default function TetrisGame() {
  const { roomId: urlRoomId, playerName: urlPlayerName } = useParams();
  const [players, setPlayers] = useState([]); // tous les joueurs
  const [myPlayerId, setMyPlayerId] = useState(null); // ID du joueur courant
  const [gameFull, setGameFull] = useState(false); // Si la partie est complète
  const [gameStatus, setGameStatus] = useState("waiting"); // État de la partie
  const [roomId, setRoomId] = useState(null); // ID de la room
  const [playerName, setPlayerName] = useState(""); // Nom du joueur
  const [joined, setJoined] = useState(false); // Si le joueur a rejoint la room
  const [hostId, setHostId] = useState(null); // ID du host (premier joueur)
  const [isHost, setIsHost] = useState(false); // Si le joueur courant est le host
  const [winnerId, setWinnerId] = useState(null); // ID du gagnant

  // Parser les paramètres URL
  useEffect(() => {
    if (urlRoomId && urlPlayerName) {
      setRoomId(decodeURIComponent(urlRoomId));
      setPlayerName(decodeURIComponent(urlPlayerName));
      console.log(`Room: ${urlRoomId}, Player: ${urlPlayerName}`);
    }
  }, [urlRoomId, urlPlayerName]);

  // Rejoindre la room une fois connecté
  useEffect(() => {
    if (!roomId || !playerName || joined) return;

    const handleConnect = () => {
      console.log("Connected to server, joining room...");
      socket.emit("joinRoom", { roomId, playerName });
      setJoined(true);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [roomId, playerName, joined]);

  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.code) {
        case "ArrowLeft":
          socket.emit("input", { action: "left" });
          break;
        case "ArrowRight":
          socket.emit("input", { action: "right" });
          break;
        case "ArrowUp":
          socket.emit("input", { action: "rotate" });
          break;
        case "ArrowDown":
          socket.emit("input", { action: "softDrop" });
          break;
        case "Space":
          event.preventDefault();
          socket.emit("input", { action: "down" });
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Réception des updates du serveur
  useEffect(() => {
    socket.on("disconnect", () => console.log("Disconnected from server"));

    // Réception de l'ID du joueur
    socket.on("playerId", (id) => {
      console.log("My player ID:", id);
      setMyPlayerId(id);
    });

    // Notification si le pseudo a été modifié
    socket.on("nameChanged", (data) => {
      console.log("Pseudo modifié:", data);
      alert(data.message);
      setPlayerName(data.newName); // Mettre à jour le pseudo affiché
    });

    // Confirmation de rejoindre la room
    socket.on("roomJoined", (data) => {
      console.log(`Room rejoint: ${data.roomId} en tant que ${data.playerName}`);
      setPlayerName(data.playerName); // S'assurer que le bon pseudo est affiché
    });

    // Si la partie est complète
    socket.on("gameFull", (data) => {
      console.log(data.message);
      setGameFull(true);
    });

    // Gestion des erreurs
    socket.on("error", (data) => {
      console.error("Erreur:", data.message);
      alert(data.message);
    });

    // Notification que la partie a démarré
    socket.on("gameStarted", () => {
      console.log("🚀 La partie a démarré !");
    });

    socket.on("update", (gameState) => {
      if (!gameState.players || gameState.players.length === 0) return;
      setPlayers(gameState.players);
      setGameStatus(gameState.status);

      // Mettre à jour le hostId
      if (gameState.hostId) {
        setHostId(gameState.hostId);
      }

      // Mettre à jour le winnerId
      if (gameState.winnerId) {
        setWinnerId(gameState.winnerId);
      }

      // Log pour debug
      if (gameState.status === "ended") {
        console.log("🏁 Partie terminée détectée côté client !");
        console.log("Joueurs:", gameState.players.map(p => ({ name: p.name, alive: p.alive })));
        console.log("Gagnant ID:", gameState.winnerId);
      }
    });

    return () => {
      socket.off("update");
      socket.off("disconnect");
      socket.off("playerId");
      socket.off("nameChanged");
      socket.off("roomJoined");
      socket.off("gameFull");
      socket.off("gameStarted");
      socket.off("error");
    };
  }, []);

  // Vérifier si le joueur est le host
  useEffect(() => {
    if (myPlayerId && hostId) {
      setIsHost(myPlayerId === hostId);
      console.log(`Je suis ${myPlayerId === hostId ? 'le HOST 👑' : 'un joueur'}`);
    }
  }, [myPlayerId, hostId]);

  // Fonction pour démarrer la partie
  const handleStartGame = () => {
    console.log("Demande de démarrage de la partie...");
    socket.emit("startGame");
  };

  // Fonction pour redémarrer la partie
  const handleRestartGame = () => {
    console.log("Demande de redémarrage de la partie...");
    socket.emit("restartGame");
  };

  // Vérifier que l'URL est valide
  if (!roomId || !playerName) {
    return (
      <div className="App">
        <h1>Tetris Game</h1>
        <div className="error-message">
          <h2>URL invalide</h2>
          <p>Format attendu: /game/&lt;room&gt;/&lt;playerName&gt;</p>
          <p>Exemple: /game/room1/Alice</p>
        </div>
      </div>
    );
  }

  // Si la partie est complète, afficher un message
  if (gameFull) {
    return (
      <div className="App">
        <h1>Tetris Game - Room: {roomId}</h1>
        <div className="game-full">
          <h2>La partie est complète (2 joueurs maximum)</h2>
          <p>Veuillez attendre qu'un joueur se déconnecte.</p>
        </div>
      </div>
    );
  }

  // Attendre que le joueur soit initialisé
  if (!myPlayerId) {
    return (
      <div className="App">
        <h1>Tetris Game - Room: {roomId}</h1>
        <p>Connexion en tant que {playerName}...</p>
      </div>
    );
  }

  // Trouver le joueur courant et l'adversaire
  const currentPlayer = players.find((p) => p.id === myPlayerId);
  const opponent = players.find((p) => p.id !== myPlayerId);

  if (!currentPlayer) {
    return (
      <div className="App">
        <h1>Tetris Game</h1>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Tetris Game - Room: {roomId}</h1>
      <h2>
        Joueur: {playerName} {isHost && <span className="host-badge">👑 HOST</span>}
      </h2>

      {/* Message d'attente d'adversaire */}
      {players.length < 2 && gameStatus === "waiting" && (
        <div className="waiting-message">
          <p>En attente d'un adversaire...</p>
          <p>Partagez ce lien: {window.location.origin}/game/{roomId}/&lt;nom_adversaire&gt;</p>
          {isHost && players.length === 1 && (
            <p style={{ color: '#ff9800', marginTop: '10px' }}>
              👑 Vous êtes le host - La partie se lancera automatiquement quand un adversaire rejoindra
            </p>
          )}
        </div>
      )}

      {/* Bouton Start pour le host quand 2 joueurs sont présents */}
      {isHost && players.length === 2 && gameStatus === "waiting" && (
        <div className="start-game-container">
          <p>✅ Les 2 joueurs sont connectés !</p>
          <button className="start-button" onClick={handleStartGame}>
            🚀 DÉMARRER LA PARTIE
          </button>
        </div>
      )}

      {/* Message pour le joueur non-host */}
      {!isHost && players.length === 2 && gameStatus === "waiting" && (
        <div className="waiting-message">
          <p>⏳ En attente que le host démarre la partie...</p>
        </div>
      )}

      {/* Game Over - affiché au-dessus de la grille */}
      {gameStatus === "ended" && (
        <div className="game-over">
          <h2>🏁 PARTIE TERMINÉE</h2>
          {players.length < 2 ? (
            <>
              <p>⚠️ L'adversaire s'est déconnecté</p>
              {isHost && (
                <button className="start-button" onClick={handleRestartGame} style={{ marginTop: '20px' }}>
                  🔄 ATTENDRE UN NOUVEAU JOUEUR
                </button>
              )}
            </>
          ) : opponent && currentPlayer ? (
            <>
              {currentPlayer.alive && !opponent.alive && (
                <>
                  <p style={{ fontSize: '2em', color: '#4caf50' }}>🎉 Vous avez gagné !</p>
                  <p style={{ fontSize: '1em', color: '#4caf50', marginTop: '10px' }}>
                    👑 Vous êtes le nouveau host !
                  </p>
                </>
              )}
              {!currentPlayer.alive && opponent.alive && (
                <p style={{ fontSize: '2em', color: '#f44336' }}>😢 Vous avez perdu</p>
              )}
              {!currentPlayer.alive && !opponent.alive && (
                <p style={{ fontSize: '2em', color: '#ff9800' }}>🤝 Match nul</p>
              )}
              <p style={{ fontSize: '1.2em', marginTop: '15px' }}>
                Score final: <strong>{currentPlayer.score}</strong>
              </p>
              {opponent && (
                <p style={{ fontSize: '1em', color: '#666' }}>
                  Score adversaire: <strong>{opponent.score}</strong>
                </p>
              )}
              
              {/* Bouton Relancer uniquement pour le gagnant (nouveau host) */}
              {winnerId === myPlayerId && (
                <button className="start-button" onClick={handleRestartGame} style={{ marginTop: '20px' }}>
                  🔄 RELANCER LA PARTIE
                </button>
              )}
              
              {/* Message pour le perdant */}
              {winnerId !== myPlayerId && winnerId && (
                <p style={{ fontSize: '1em', color: '#666', marginTop: '20px' }}>
                  ⏳ En attente que le gagnant relance la partie...
                </p>
              )}
            </>
          ) : (
            <p>Partie terminée</p>
          )}
        </div>
      )}

      {/* Grille de jeu */}
      <div className="player-container">
        <GameAera
          board={currentPlayer.board}
          currentPiece={currentPlayer.currentPiece}
          nextPiece={currentPlayer.nextPiece}
          score={currentPlayer.score}
          level={currentPlayer.level}
          opponentSpectrum={opponent ? opponent.spectrum : []}
          playerName={currentPlayer.name}
          opponentName={opponent ? opponent.name : ""}
        />
        {/* Debug info */}
        {opponent && (
          <div style={{ fontSize: '10px', color: '#666', marginTop: '10px' }}>
            Debug: Affichage du spectrum de {opponent.name} (ID: {opponent.id})
          </div>
        )}
      </div>
    </div>
  );
}