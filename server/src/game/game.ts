import { PieceBag, Piece } from "./piece";
import { Player } from "./player"; // important : à ajouter (même si tu l'importeras plus tard)

export class Game {
  public id: string;
  public mode: "solo" | "multi";
  public players: Player[];
  public pieceBag: PieceBag;
  public status: "waiting" | "playing" | "ended";
  public winner: Player | null;
  private pieceSequence: string[] = []; // Séquence de pièces partagée par tous les joueurs

  constructor(mode: "solo" | "multi" = "solo") {
    this.id = mode;
    this.mode = mode;
    this.players = [];
    this.pieceBag = new PieceBag();
    this.status = "waiting";
    this.winner = null;
  }

  // Récupère une pièce à un index donné (génère si nécessaire)
  private getPieceAtIndex(index: number): string {
    // Générer des pièces en avance si nécessaire
    while (this.pieceSequence.length <= index) {
      const piece = this.pieceBag.getNextPiece();
      this.pieceSequence.push(piece.type);
      console.log(`   📦 Séquence[${this.pieceSequence.length - 1}] = ${piece.type}`);
    }
    return this.pieceSequence[index];
  }

  addPlayer(player: Player): void {
    this.players.push(player);
  }

  removePlayer(id: string): void {
    this.players = this.players.filter((player) => player.id !== id);
  }

  start(): void {
    if (this.players.length > 0) {
      this.status = "playing";
      console.log(`🎮 Démarrage de la partie en mode ${this.mode}...`);

      // Réinitialiser le sac de pièces et la séquence pour une nouvelle partie
      this.pieceBag = new PieceBag();
      this.pieceSequence = [];
      console.log("🎲 Nouveau sac de pièces créé (séquence partagée)");

      // Pré-générer les 2 premières pièces de la séquence
      const firstPieceType = this.getPieceAtIndex(0);
      const secondPieceType = this.getPieceAtIndex(1);

      console.log(`🎲 Séquence initiale: [0]=${firstPieceType}, [1]=${secondPieceType}`);

      this.players.forEach((player) => {
        player.resetScore();
        player.resetBoard();
        player.resetLevel();
        player.resetGravity();
        player.alive = true;
        player.pieceIndex = 0; // Tous commencent à l'index 0

        // Donner les mêmes pièces à tous (index 0 et 1)
        player.setCurrentPiece(new Piece(firstPieceType));
        player.setNextPiece(new Piece(secondPieceType));

        console.log(`   ✅ ${player.name}: index=0, current=${firstPieceType}, next=${secondPieceType}`);
      });

      console.log(`✅ Partie démarrée avec ${this.players.length} joueur(s)`);
    }
  }

  update(): void {
    if (this.status !== "playing") return;
    console.log("update game");
    console.log("Gravity : " + this.players[0].gravity + "ms");
    this.players.forEach((player) => {
      const piece = player.currentPiece;
      if (!piece) return;
      console.log('y:', piece.position.y, 'canMoveDown:', this.canMoveDown(player, piece));
      if (!piece || !player.alive) return;

      if (player.shouldFall()) {
        if (this.canMoveDown(player, piece)) {
        piece.position.y += 1;
        player.updateLastFallTime(); // Met à jour le timer de chute
      } else {
        player.mergePiece();

        const clearedLines = player.clearLines();
        if (clearedLines > 0) {
          console.log(`${player.name} a effacé ${clearedLines} ligne(s)`);
          player.addScore(clearedLines * 750); // Exemple : 750 points par ligne

          // En mode multijoueur, chaque ligne complétée envoie une ligne de pénalité à l'adversaire
          if (this.mode === "multi") {
            const opponents = this.players.filter((p) => p.id !== player.id && p.alive);
            opponents.forEach((opponent) => {
              opponent.addPenaltyLines(clearedLines);
              console.log(`💥 ${opponent.name} reçoit ${clearedLines} ligne(s) de pénalité de ${player.name}`);
            });
          }
        } else {
          player.addScore(75); // Exemple : 75 points pour avoir placé une pièce
        }

        player.updateLastFallTime(); // Met à jour le timer de chute

        // Avancer l'index du joueur
        player.pieceIndex++;

        // La pièce suivante devient la pièce courante
        player.setCurrentPiece(player.nextPiece);

        // Récupérer la prochaine pièce selon l'index du joueur (indépendant des autres)
        const nextPieceType = this.getPieceAtIndex(player.pieceIndex + 1);
        player.setNextPiece(new Piece(nextPieceType));

        console.log(`🎲 ${player.name}: index=${player.pieceIndex}, next=${nextPieceType}`);

        //augmente le level tous les 10 000 points
        if (player.score >= player.level * 10000) {
          player.levelUp();
          player.increaseGravity(player.level);
          console.log(`${player.name} est passé au niveau ${player.level}, gravité: ${player.gravity}ms`);
        }

        // Vérifier si le joueur a une pièce actuelle
        if (player.currentPiece) {
          player.currentPiece.position = { x: Math.floor(player.width / 2) - 1, y: 0 };

          // Vérifier si la nouvelle pièce peut être placée (sinon = game over)
          if (!this.canPlacePiece(player, player.currentPiece)) {
            player.alive = false;
            console.log(`💀 ${player.name} est éliminé (Game Over !)`);
          }
        }
      }

      }

    });
    this.checkGameOver();
  }

  // Retourne les spectres de tous les joueurs
  getSpectrums() {
    return this.players.map((player) => ({
      name: player.name,
      spectrum: player.getSpectrum(),
    }));
  }


  checkGameOver(): void {
    const alivePlayers = this.players.filter((p) => p.alive);
    const deadPlayers = this.players.filter((p) => !p.alive);

    console.log(`🔍 checkGameOver: mode=${this.mode}, vivants=${alivePlayers.length}, morts=${deadPlayers.length}`);

    if (this.mode === "solo" && alivePlayers.length === 0) {
      this.status = "ended";
      this.winner = null;
    } else if (this.mode === "multi" && deadPlayers.length >= 1) {
      // En mode multijoueur, dès qu'UN joueur meurt, la partie s'arrête pour TOUS
      if (this.status === "ended") {
        console.log(`⚠️ Partie déjà terminée, ignorer`);
        return; // Éviter de re-traiter
      }

      this.status = "ended";
      this.winner = alivePlayers[0] || null;

      console.log(`🏁 GAME OVER ! Partie terminée !`);
      console.log(`   - Raison: ${deadPlayers[0].name} a perdu`);
      console.log(`   - Gagnant: ${this.winner ? this.winner.name : 'Aucun (match nul)'}`);
      console.log(`   - Joueurs vivants: ${alivePlayers.length}`);
      console.log(`   - Joueurs morts: ${deadPlayers.length}`);
      console.log(`   - Status: ${this.status}`);

      // Afficher l'état de chaque joueur
      this.players.forEach(p => {
        console.log(`   - ${p.name}: ${p.alive ? '✅ Vivant' : '💀 Mort'} (Score: ${p.score})`);
      });
    }
  }

  movePiece(player: Player, direction: number): void {
    if (!player.alive || !player.currentPiece) return;
    const piece = player.currentPiece;
    const newPos = { ...piece.position, x: piece.position.x + direction };
    if (this.canMove(player, piece.shape, newPos)) {
      piece.position = newPos;
    }
  }

  rotatePiece(player: Player): void {
    if (!player.alive || !player.currentPiece) return;
    const piece = player.currentPiece;
    const rotatedShape = this.rotateMatrix(piece.shape);
    if (this.canMove(player, rotatedShape, piece.position)) {
      piece.shape = rotatedShape;
    }
  }

  rotateMatrix(matrix: number[][]): number[][] {
    return matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
  }

  //Drop la piece immediatement en bas
  dropPiece(player: Player): void {
    if (!player.alive || !player.currentPiece) return;
    const piece = player.currentPiece;
    while (this.canMoveDown(player, piece)) {
      piece.position.y += 1;
    }
  }

  //Accelere la chute de la piece
  softDropPiece(player: Player): void {
    if (!player.alive || !player.currentPiece) return;
    const piece = player.currentPiece;
    if  (this.canMoveDown(player, piece)) {
      piece.position.y += 1;
    }
  }


  canMove(player: Player, shape: number[][], pos: { x: number; y: number }): boolean {
    const board = player.board;
    const height = board.length;
    const width = board[0].length;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (
            newX < 0 ||
            newX >= width ||
            newY >= height ||
            (newY >= 0 && board[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  canMoveDown(player: Player, piece: any): boolean {
    return this.canPlacePiece(player, piece, {
      x: piece.position.x,
      y: piece.position.y + 1,
    });
  }

  canPlacePiece(
    player: Player,
    piece: any,
    pos: { x: number; y: number } = piece.position
  ): boolean {
    const { shape } = piece;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const boardX = pos.x + x;
          const boardY = pos.y + y;

          if (boardY >= player.height) return false;
          if (boardX < 0 || boardX >= player.width) return false;
          if (player.board[boardY][boardX] !== 0) return false;
        }
      }
    }
    return true;
  }
}
