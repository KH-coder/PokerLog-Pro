// Player positions at a poker table
export enum Position {
  SB = 'SB', // Small Blind
  BB = 'BB', // Big Blind
  UTG = 'UTG', // Under the Gun
  MP = 'MP', // Middle Position
  HJ = 'HJ', // Hijack
  CO = 'CO', // Cut Off
  BTN = 'BTN', // Button
}

// Card suits
export enum Suit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades',
}

// Card ranks
export enum Rank {
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = 'T',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
  ACE = 'A',
}

// Card representation
export interface Card {
  suit: Suit;
  rank: Rank;
}

// Player actions
export enum Action {
  FOLD = 'fold',
  CHECK = 'check',
  CALL = 'call',
  BET = 'bet',
  RAISE = 'raise',
  ALL_IN = 'all_in',
}

// Poker hand stages
export enum Stage {
  PREFLOP = 'preflop',
  FLOP = 'flop',
  TURN = 'turn',
  RIVER = 'river',
}

// Action with bet amount
export interface PlayerAction {
  action: Action;
  amount?: number;
  stage: Stage;
}

// Hand record
export interface HandRecord {
  id?: string;
  date: string;
  position: Position;
  holeCards: Card[];
  communityCards?: Card[];
  actions: PlayerAction[];
  result: number;
  notes?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  token?: string;
}

// Auth state
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// API response
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
