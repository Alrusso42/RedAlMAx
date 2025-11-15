import { Piece } from './piece';

export class Player {
  public id: string;
  public name: string;
  public width: number;
  public height: number;
  public board: number[][];
  public score: number;
  public level: number;
  public gravity: number;
  public currentPiece: Piece | null;
  public nextPiece: Piece | null;
  public alive: boolean;
  public lastFallTime: number;
  public pieceIndex: number; // Index de la pièce actuelle dans la séquence partagée

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.width = 10;
    this.height = 20;
    this.board = this.createEmptyBoard(this.width, this.height);
    this.score = 0;
    this.level = 1;
    this.gravity = 800; // ms per cell
    this.currentPiece = null;
    this.nextPiece = null;
    this.alive = true;
    this.lastFallTime = Date.now();
    this.pieceIndex = 0; // Commence à l'index 0
  }

  private createEmptyBoard(width: number, height: number): number[][] {
    return Array.from({ length: height }, () => Array(width).fill(0));
  }

  public setCurrentPiece(piece: Piece | null): void {
    this.currentPiece = piece;
  }

  public setNextPiece(piece: Piece): void {
    this.nextPiece = piece;
  }

  public addScore(score: number): void {
    this.score += score;
  }

  public resetScore(): void {
    this.score = 0;
  }

  public resetLevel(): void {
    this.level = 1;
  }

  public levelUp(): void {
    this.level += 1;
  }

  public resetGravity(): void {
    this.gravity = 800;
    this.lastFallTime = Date.now();
  }

  //augmente la gravité en fonction du niveau
  public increaseGravity(level: number): void {
    this.gravity = Math.max(100, 800 - (level - 1) * 70);
  }

  //verifie si le joueur doit faire tomber la piece en fonction de la gravité
  public shouldFall(): boolean {
    return Date.now() - this.lastFallTime >= this.gravity;
  }

  //reinitialise le timer de chute
  public updateLastFallTime(): void {
    this.lastFallTime = Date.now();
  }

  public resetBoard(): void {
    this.board = this.createEmptyBoard(this.width, this.height);
  }

  public mergePiece(): void {
    if (!this.currentPiece) return;
    const { shape, position } = this.currentPiece;

    shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        const boardY = y + position.y;
        const boardX = x + position.x;

        if (
          cell &&
          this.board[boardY] &&
          this.board[boardY][boardX] === 0
        ) {
          this.board[boardY][boardX] = 1;
        }
      });
    });
  }

  // Efface les lignes complètes et retourne le nombre de lignes effacées
  // Les cellules avec valeur 9 sont indestructibles (lignes de pénalité)
  public clearLines(): number {
    // Filtrer les lignes à garder:
    // 1. Les lignes qui ont au moins une cellule vide (cell === 0)
    // 2. OU les lignes complètes mais composées de cellules de pénalité (cell === 9)
    const newBoard = this.board.filter((row) => {
      const hasEmptyCell = row.some((cell) => cell === 0);
      const isPenaltyLine = row.every((cell) => cell === 9);
      return hasEmptyCell || isPenaltyLine;
    });
    
    const cleared = this.height - newBoard.length;

    // Ajouter des lignes vides en haut
    while (newBoard.length < this.height) {
      newBoard.unshift(Array(this.width).fill(0));
    }

    this.board = newBoard;
    return cleared;
  }

  // Ajoute des lignes de pénalité indestructibles (valeur 9) à la base du plateau
  public addPenaltyLines(lines: number): void {
    for (let i = 0; i < lines; i++) {
      // Retirer la ligne du haut
      this.board.shift();
      
      // Créer une ligne de pénalité COMPLÈTE (sans trou) - indestructible
      const penaltyLine = Array(this.width).fill(9);
      
      // Ajouter la ligne de pénalité en bas
      this.board.push(penaltyLine);
    }
    console.log(`⚡ ${this.name} a reçu ${lines} ligne(s) de pénalité indestructible(s) !`);
  }

  public getSpectrum(): number[][] {
    // Retourne une copie du plateau pour afficher le vrai état avec les trous
    return this.board.map(row => [...row]);
  }
}
