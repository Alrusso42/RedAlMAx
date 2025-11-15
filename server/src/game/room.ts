import { Game } from './game';
import { Player } from './player';

export class Room {
  public id: string;
  public game: Game;
  public players: Map<string, Player>;
  public maxPlayers: number = 2;
  public hostId: string | null = null; // ID du premier joueur (host)

  constructor(roomId: string) {
    this.id = roomId;
    this.game = new Game('multi');
    this.players = new Map();
    console.log(`🎮 Room créée: ${roomId}`);
  }

  // Ajoute un joueur à la room
  addPlayer(clientId: string, playerName: string): Player | null {
    if (this.players.size >= this.maxPlayers) {
      console.log(`❌ Room ${this.id} est pleine`);
      return null;
    }

    const player = new Player(clientId, playerName);
    this.players.set(clientId, player);
    this.game.addPlayer(player);

    // Si c'est le premier joueur, il devient le host
    if (this.players.size === 1) {
      this.hostId = clientId;
      console.log(`👑 ${playerName} est le host de la room ${this.id}`);
    }

    console.log(`✅ ${playerName} a rejoint la room ${this.id} (${this.players.size}/${this.maxPlayers})`);

    // Ne plus démarrer automatiquement, attendre que le host clique sur "Start"

    return player;
  }

  // Démarre la partie (appelé par le host)
  startGame(): boolean {
    if (this.game.status !== 'waiting') {
      console.log(`⚠️ La partie est déjà démarrée ou terminée`);
      return false;
    }

    if (this.players.size < 2) {
      console.log(`⚠️ Impossible de démarrer : il faut 2 joueurs (actuellement ${this.players.size})`);
      return false;
    }

    console.log(`🚀 Démarrage de la partie dans la room ${this.id}`);
    this.game.start();
    return true;
  }

  // Retire un joueur de la room
  removePlayer(clientId: string): void {
    const player = this.players.get(clientId);
    if (player) {
      console.log(`👋 ${player.name} a quitté la room ${this.id}`);
      this.game.removePlayer(player.id);
      this.players.delete(clientId);

      // Arrêter la partie si un joueur se déconnecte pendant le jeu
      if (this.game.status === 'playing') {
        this.game.status = 'ended';
        this.game.winner = null;
        console.log(`⛔ Partie terminée dans la room ${this.id} : déconnexion`);
      }
    }
  }

  // Vérifie si la room est vide
  isEmpty(): boolean {
    return this.players.size === 0;
  }

  // Vérifie si la room est pleine
  isFull(): boolean {
    return this.players.size >= this.maxPlayers;
  }

  // Redémarre la partie (le gagnant est déjà le host depuis le game over)
  restartGame(): boolean {
    if (this.game.status !== 'ended') {
      console.log(`⚠️ Impossible de redémarrer : la partie n'est pas terminée`);
      return false;
    }

    if (this.players.size < 2) {
      console.log(`⚠️ Impossible de redémarrer : il faut 2 joueurs (actuellement ${this.players.size})`);
      return false;
    }

    // Créer une nouvelle partie
    const oldPlayers = Array.from(this.players.values());
    this.game = new Game('multi');
    
    // Réajouter les joueurs avec leurs noms
    oldPlayers.forEach(oldPlayer => {
      const newPlayer = new Player(oldPlayer.id, oldPlayer.name);
      this.game.addPlayer(newPlayer);
      this.players.set(oldPlayer.id, newPlayer);
    });

    console.log(`🔄 Partie redémarrée dans la room ${this.id} par le host ${this.hostId}`);
    this.game.start();
    return true;
  }

  // Récupère l'état du jeu
  getGameState() {
    return {
      roomId: this.id,
      hostId: this.hostId,
      winnerId: this.game.winner?.id || null,
      players: this.game.players.map(p => ({
        id: p.id,
        name: p.name,
        board: p.board,
        score: p.score,
        level: p.level,
        currentPiece: p.currentPiece,
        nextPiece: p.nextPiece,
        spectrum: p.getSpectrum(),
        alive: p.alive,
      })),
      status: this.game.status,
    };
  }
}
