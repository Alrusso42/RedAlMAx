// tetris.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Room } from './game/room';


@WebSocketGateway({ cors: true })
export class TetrisGateway {
  @WebSocketServer()
  server: Server;

  private rooms: Map<string, Room> = new Map();
  private clientRooms: Map<string, string> = new Map(); // clientId -> roomId

  constructor() {
    console.log("🚀 TetrisGateway initialisé avec système de rooms !");
  }

  afterInit(server: Server) {
    // Boucle du jeu - Met à jour toutes les rooms actives
    setInterval(() => {
      this.rooms.forEach((room) => {
        const wasPlaying = room.game.status === 'playing';
        
        if (wasPlaying) {
          room.game.update();
          
          // Si le jeu vient de se terminer, transférer le hostId au gagnant
          if (room.game.status === 'ended' && room.game.winner) {
            room.hostId = room.game.winner.id;
            console.log(`👑 Le gagnant ${room.game.winner.name} devient le nouveau host`);
          }
          
          // Envoie l'update uniquement aux joueurs de cette room
          server.to(room.id).emit('update', room.getGameState());
        }
      });
    }, 50);
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    // La connexion sera gérée via le message 'joinRoom'
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: string; playerName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, playerName } = data;
    console.log(`${playerName} (${client.id}) essaie de rejoindre la room ${roomId}`);

    // Vérifier si le client est déjà dans une room
    if (this.clientRooms.has(client.id)) {
      client.emit('error', { message: 'Vous êtes déjà dans une room' });
      return;
    }

    // Créer la room si elle n'existe pas
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Room(roomId));
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      client.emit('error', { message: 'Erreur lors de la création de la room' });
      return;
    }

    // Vérifier si la room est pleine
    if (room.isFull()) {
      client.emit('gameFull', { message: 'La partie est complète (2 joueurs maximum)' });
      return;
    }

    // Ajouter le joueur à la room
    const player = room.addPlayer(client.id, playerName);
    if (!player) {
      client.emit('error', { message: 'Impossible de rejoindre la room' });
      return;
    }

    // Associer le client à la room
    this.clientRooms.set(client.id, roomId);
    client.join(roomId); // Socket.io room

    // Envoyer les informations au client
    client.emit('playerId', client.id);
    client.emit('roomJoined', { roomId, playerName });

    // Envoyer l'état initial à tous les joueurs de la room
    this.server.to(roomId).emit('update', room.getGameState());
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const roomId = this.clientRooms.get(client.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    // Retirer le joueur de la room
    room.removePlayer(client.id);
    this.clientRooms.delete(client.id);

    // Notifier les autres joueurs
    this.server.to(roomId).emit('update', room.getGameState());

    // Supprimer la room si elle est vide
    if (room.isEmpty()) {
      this.rooms.delete(roomId);
      console.log(`🗑️  Room ${roomId} supprimée (vide)`);
    }
  }

  @SubscribeMessage('input')
  handleInput(
    @MessageBody() data: { action: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = this.clientRooms.get(client.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(client.id);
    if (!player || !player.alive) return;

    switch (data.action) {
      case 'left':
        room.game.movePiece(player, -1);
        break;
      case 'right':
        room.game.movePiece(player, 1);
        break;
      case 'rotate':
        room.game.rotatePiece(player);
        break;
      case 'down':
        room.game.dropPiece(player);
        break;
      case 'softDrop':
        room.game.softDropPiece(player);
        break;
      default:
        break;
    }

    // Broadcast uniquement aux joueurs de cette room
    this.server.to(roomId).emit('update', room.getGameState());
  }

  @SubscribeMessage('startGame')
  handleStartGame(@ConnectedSocket() client: Socket) {
    const roomId = this.clientRooms.get(client.id);
    if (!roomId) {
      client.emit('error', { message: 'Vous n\'êtes pas dans une room' });
      return;
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      client.emit('error', { message: 'Room introuvable' });
      return;
    }

    // Vérifier que c'est bien le host qui demande à démarrer
    if (room.hostId !== client.id) {
      client.emit('error', { message: 'Seul le host peut démarrer la partie' });
      return;
    }

    // Démarrer la partie
    const success = room.startGame();
    if (success) {
      // Notifier tous les joueurs que la partie démarre
      this.server.to(roomId).emit('gameStarted');
      this.server.to(roomId).emit('update', room.getGameState());
      console.log(`✅ Partie démarrée dans la room ${roomId}`);
    } else {
      client.emit('error', { message: 'Impossible de démarrer la partie (il faut 2 joueurs)' });
    }
  }

  @SubscribeMessage('restartGame')
  handleRestartGame(@ConnectedSocket() client: Socket) {
    const roomId = this.clientRooms.get(client.id);
    if (!roomId) {
      client.emit('error', { message: 'Vous n\'êtes pas dans une room' });
      return;
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      client.emit('error', { message: 'Room introuvable' });
      return;
    }

    // Vérifier que c'est bien le gagnant (nouveau host) qui demande à redémarrer
    if (room.hostId !== client.id) {
      client.emit('error', { message: 'Seul le gagnant peut redémarrer la partie' });
      return;
    }

    // Redémarrer la partie
    const success = room.restartGame();
    if (success) {
      // Notifier tous les joueurs que la partie redémarre
      this.server.to(roomId).emit('gameStarted');
      this.server.to(roomId).emit('update', room.getGameState());
      console.log(`🔄 Partie redémarrée dans la room ${roomId}`);
    } else {
      client.emit('error', { message: 'Impossible de redémarrer la partie' });
    }
  }
}







// @WebSocketGateway({ cors: true })
// export class TetrisGateway {
//   @WebSocketServer()
//   server: Server;

//   private game: Game;
//   private players: Map<string, Player> = new Map();

//   constructor() {
//     this.game = new Game('solo'); // mode solo

//     // Créer un joueur par défaut pour tester le solo
//     const defaultPlayer = new Player('1', 'Player1');
//     this.players.set(defaultPlayer.id, defaultPlayer);
//     this.game.addPlayer(defaultPlayer);

//     console.log("🚀 TetrisGateway initialisé !");
//     console.log("🎮 Joueurs enregistrés :", this.players.size);

//     // Initialiser les pièces du joueur par défaut
//     defaultPlayer.setCurrentPiece(this.game.pieceBag.getNextPiece());
//     defaultPlayer.setNextPiece(this.game.pieceBag.getNextPiece());

//     //commencer la partie
//     this.game.start();
//   }

//   afterInit(server: Server) {
//     // Démarre la boucle du jeu (gravité)
//     setInterval(() => {
//       this.game.update();
//       server.emit('update', this.getGameState());
//     }, 50); //50 ms apres chaque tick

//   }


//   handleConnection(client: Socket) {
//     console.log(`Client connected: ${client.id}`);

//     const player = this.players.get('1'); // solo = joueur par défaut
//     if (!player) {
//       console.error("Aucun joueur trouvé pour le client connecté.");
//       return;
//     }

//     //relance la partie si elle est terminee
//     if (this.game.status == 'ended' || !player.alive) {
//       player.resetBoard();
//       player.resetScore();
//       player.resetLevel();
//       player.resetGravity();
//       player.setCurrentPiece(this.game.pieceBag.getNextPiece());
//       player.setNextPiece(this.game.pieceBag.getNextPiece());
//       player.alive = true;
//       this.game.start();
//     }

//     // Pour le solo, chaque client peut utiliser le joueur par défaut
//     client.emit('update', this.getGameState());
//   }

//   handleDisconnect(client: Socket) {
//     console.log(`Client disconnected: ${client.id}`);
//     // Ici, on ne supprime pas le joueur solo par défaut
//   }

//   @SubscribeMessage('input')
//   handleInput(
//     @MessageBody() data: { action: string },
//     @ConnectedSocket() client: Socket,
//   ) {
//     console.log(`Input from ${client.id}: ${data.action}`);
//     const player = this.players.get('1'); // solo = joueur par défaut
//     if (!player) return;

//     switch (data.action) {
//       case 'left':
//         this.game.movePiece(player, -1);
//         break;
//       case 'right':
//         this.game.movePiece(player, 1);
//         break;
//       case 'rotate':
//         this.game.rotatePiece(player);
//         break;
//       case 'down':
//         this.game.dropPiece(player);
//         break;
//       case 'softDrop':
//         this.game.softDropPiece(player);
//         break;
//       default:
//         break;
//     }

//     // Renvoie l’état mis à jour
//     this.server.emit('update', this.getGameState());
//   }

//   private getGameState() {
//     const state = {
//       players: this.game.players.map(p => ({
//         id: p.id,
//         name: p.name,
//         board: p.board,
//         score: p.score,
//         level: p.level,
//         currentPiece: p.currentPiece,
//         spectrum: p.getSpectrum(),
//         nextPiece: p.nextPiece,
//         alive: p.alive,
//       })),
//       status: this.game.status,
//     };
//     return state;
//   }
// }
