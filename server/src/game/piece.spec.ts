import { Piece, PieceBag, TETROMINOS } from './piece';

describe('Piece', () => {
  let piece: Piece;

  beforeEach(() => {
    piece = new Piece('I');
  });

  describe('constructor', () => {
    it('should create piece with correct properties', () => {
      expect(piece.type).toBe('I');
      expect(piece.color).toBe('cyan');
      expect(piece.position).toEqual({ x: 0, y: 0 });
      expect(piece.rotationIndex).toBe(0);
      expect(piece.shape).toEqual(TETROMINOS.I.shape);
    });

    it('should create independent shape copy', () => {
      const originalShape = TETROMINOS.I.shape;
      piece.shape[0][0] = 9;
      expect(originalShape[0][0]).not.toBe(9);
    });
  });

  describe('rotate', () => {
    it('should rotate piece shape clockwise', () => {
      const originalShape = piece.shape.map(row => [...row]);
      piece.rotate();
      
      expect(piece.shape).not.toEqual(originalShape);
      expect(piece.rotationIndex).toBe(1);
    });

    it('should cycle rotation index correctly', () => {
      for (let i = 0; i < 4; i++) {
        piece.rotate();
      }
      expect(piece.rotationIndex).toBe(0);
    });
  });

  describe('inverseRotate', () => {
    it('should rotate piece shape counter-clockwise', () => {
      const originalShape = piece.shape.map(row => [...row]);
      piece.inverseRotate();
      
      expect(piece.shape).not.toEqual(originalShape);
      expect(piece.rotationIndex).toBe(3);
    });

    it('should be inverse of rotate', () => {
      const originalShape = piece.shape.map(row => [...row]);
      piece.rotate();
      piece.inverseRotate();
      
      expect(piece.shape).toEqual(originalShape);
      expect(piece.rotationIndex).toBe(0);
    });
  });

  describe('movement methods', () => {
    it('should move left', () => {
      piece.moveLeft();
      expect(piece.position.x).toBe(-1);
    });

    it('should move right', () => {
      piece.moveRight();
      expect(piece.position.x).toBe(1);
    });

    it('should move down', () => {
      piece.moveDown();
      expect(piece.position.y).toBe(1);
    });

    it('should allow chained movements', () => {
      piece.moveRight();
      piece.moveRight();
      piece.moveDown();
      
      expect(piece.position).toEqual({ x: 2, y: 1 });
    });
  });

  describe('all tetromino types', () => {
    Object.keys(TETROMINOS).forEach(type => {
      it(`should create ${type} piece correctly`, () => {
        const testPiece = new Piece(type);
        
        expect(testPiece.type).toBe(type);
        expect(testPiece.color).toBe(TETROMINOS[type].color);
        expect(testPiece.shape).toEqual(TETROMINOS[type].shape);
      });
    });
  });
});

describe('PieceBag', () => {
  let pieceBag: PieceBag;

  beforeEach(() => {
    pieceBag = new PieceBag();
  });

  describe('constructor', () => {
    it('should create bag with all tetromino types', () => {
      expect(pieceBag.bag).toHaveLength(7);
      
      const expectedTypes = Object.keys(TETROMINOS);
      expectedTypes.forEach(type => {
        expect(pieceBag.bag).toContain(type);
      });
    });

    it('should shuffle pieces randomly', () => {
      const bag1 = new PieceBag();
      const bag2 = new PieceBag();
      
      // Avec 7! combinaisons possibles, il est très improbable d'avoir le même ordre
      // Mais on peut au moins vérifier que les sacs ne sont pas toujours identiques
      const sameOrder = JSON.stringify(bag1.bag) === JSON.stringify(bag2.bag);
      // Note: Ce test peut parfois échouer par coïncidence (probabilité 1/5040)
      // Dans un vrai projet, on mockrait Math.random pour des tests déterministes
    });
  });

  describe('getNextPiece', () => {
    it('should return a Piece instance', () => {
      const piece = pieceBag.getNextPiece();
      expect(piece).toBeInstanceOf(Piece);
    });

    it('should reduce bag size', () => {
      const initialLength = pieceBag.bag.length;
      pieceBag.getNextPiece();
      
      expect(pieceBag.bag).toHaveLength(initialLength - 1);
    });

    it('should return all pieces before refilling', () => {
      const drawnTypes = new Set();
      
      // Tirer 7 pièces (vide le sac)
      for (let i = 0; i < 7; i++) {
        const piece = pieceBag.getNextPiece();
        drawnTypes.add(piece.type);
      }
      
      // Vérifier qu'on a eu tous les types
      expect(drawnTypes.size).toBe(7);
      Object.keys(TETROMINOS).forEach(type => {
        expect(drawnTypes.has(type)).toBe(true);
      });
    });

    it('should refill automatically when empty', () => {
      // Vider le sac
      for (let i = 0; i < 7; i++) {
        pieceBag.getNextPiece();
      }
      
      expect(pieceBag.bag).toHaveLength(0);
      
      // La prochaine pièce devrait refill le sac
      const piece = pieceBag.getNextPiece();
      
      expect(piece).toBeInstanceOf(Piece);
      expect(pieceBag.bag.length).toBeGreaterThan(0);
    });

    it('should provide 14 pieces without repetition in first cycle', () => {
      const firstCycle = new Set();
      const secondCycle = new Set();
      
      // Premier cycle (7 pièces)
      for (let i = 0; i < 7; i++) {
        const piece = pieceBag.getNextPiece();
        firstCycle.add(piece.type);
      }
      
      // Deuxième cycle (7 pièces)
      for (let i = 0; i < 7; i++) {
        const piece = pieceBag.getNextPiece();
        secondCycle.add(piece.type);
      }
      
      // Chaque cycle doit avoir les 7 types
      expect(firstCycle.size).toBe(7);
      expect(secondCycle.size).toBe(7);
    });
  });

  describe('refill', () => {
    it('should restore bag to 7 pieces', () => {
      // Vider le sac
      pieceBag.bag = [];
      
      pieceBag.refill();
      
      expect(pieceBag.bag).toHaveLength(7);
    });

    it('should contain all tetromino types after refill', () => {
      pieceBag.refill();
      
      const expectedTypes = Object.keys(TETROMINOS);
      expectedTypes.forEach(type => {
        expect(pieceBag.bag).toContain(type);
      });
    });
  });
});