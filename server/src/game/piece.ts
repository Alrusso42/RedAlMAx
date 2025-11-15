// Liste des pièces
export const TETROMINOS: Record<
  string,
  { shape: number[][]; color: string }
> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "cyan",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "blue",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "violet",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "green",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "orange",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "darkblue",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "darkred",
  },
};

// Classe représentant une pièce
export class Piece {
  public type: string;
  public shape: number[][];
  public color: string;
  public position: { x: number; y: number };
  public rotationIndex: number;

  constructor(type: string) {
    this.type = type;
    this.shape = TETROMINOS[type].shape.map(row => [...row]); // copie pour éviter mutation globale
    this.color = TETROMINOS[type].color;
    this.position = { x: 0, y: 0 };
    this.rotationIndex = 0;
  }

  rotate(): void {
    const rotated = this.shape[0].map((_, i) =>
      this.shape.map(row => row[i]).reverse()
    );
    this.shape = rotated;
    this.rotationIndex = (this.rotationIndex + 1) % 4;
  }

  inverseRotate(): void {
    const rotated = this.shape[0].map((_, i) =>
      this.shape.map(row => row[row.length - 1 - i])
    );
    this.shape = rotated;
    this.rotationIndex = (this.rotationIndex + 3) % 4;
  }

  moveLeft(): void {
    this.position.x -= 1;
  }

  moveRight(): void {
    this.position.x += 1;
  }

  moveDown(): void {
    this.position.y += 1;
  }
}

// Classe de tirage avec système du sac
export class PieceBag {
  public bag: string[];

  constructor() {
    this.bag = [];
    this.refill();
  }

  refill(): void {
    const types = Object.keys(TETROMINOS);
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    this.bag = types;
  }

  getNextPiece(): Piece {
    if (this.bag.length === 0) {
      this.refill();
    }
    const type = this.bag.pop() as string;
    return new Piece(type);
  }
}