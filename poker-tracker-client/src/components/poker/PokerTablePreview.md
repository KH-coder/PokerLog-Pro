# PokerTable Component Preview

The updated PokerTable component now includes the following features:

## Features

1. **Position vs Position Display**
   - Shows the hero and villain positions at the top of the table
   - Displays "3bet, 100bb" information

2. **Pot Size Information**
   - Displays the pot size in big blinds (e.g., "25 BB")

3. **Bet Size Indicator**
   - Shows the current bet size (e.g., "6.75 BB")

4. **Hero and Villain Positions**
   - Hero position at the bottom with cards and position label
   - Villain position at the top with position label

5. **Table Positions**
   - All positions (BTN, SB, BB, UTG, MP, CO, HJ) displayed around the table
   - Selected position highlighted with a yellow border
   - Active positions highlighted in blue

## Usage

```jsx
<PokerTable
  selectedPosition={position}
  onPositionSelect={handlePositionSelect}
  communityCards={communityCards.filter(card => card !== null) as CardType[]}
  heroPosition={position}
  villainPosition={position === Position.BB ? Position.UTG : Position.BB}
  heroCards={holeCards.filter(card => card !== null) as CardType[]}
  potSize={25}
  betSize={6.75}
/>
```

## Visual Appearance

The table has a dark background with a circular shape. The community cards are displayed in the center, with the hero's cards at the bottom and the villain's cards at the top. Position labels are shown in colored badges (blue for hero, orange for villain).

The table positions are displayed as circles around the edge of the table, with the currently selected position highlighted.
