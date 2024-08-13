# Desert Adventure Game

Welcome to the Desert Adventure Game! This is an exciting and challenging game where you must navigate an ivory colored square across a desert background to reach civilization.

## Running the Game

To run the game, ensure you are in a browser environment. The game relies on the `window` object, which is only available in browsers.

Note: The game must be run in a browser environment to function correctly.

## Game Description

In this game, you control an ivory colored square that spawns in a desert background. The objective is to cross the desert to reach civilization, which is some distance in the upward direction relative to the Birds Eye view of the screen. However, there are many black circles that represent holes, and if you fall down one of them, you get taken backward 1 minute of your adventure and get placed there. If a point comes where you fall into a hole within 1 minute of your last reset, or your first "unreset" run, then you lose the game.

## Controls

- Use the arrow keys to move the ivory colored square in the desired direction.

## Objective

- The objective is to cross the desert to reach civilization, avoiding black circles that represent holes, which cause a reset if fallen into.

## Additional Information

- The game uses `p5.js` for rendering the player character, desert background, and holes.
- The game includes mechanics for crossing the desert, avoiding holes, and resetting the player's position upon falling into a hole.

## Minimap

The game now includes a minimap component that renders at the top left corner of the screen. The minimap shows the ivory square in relation to the black circles, providing a quick overview of the player's position and the surrounding obstacles.

### Purpose and Functionality

The minimap helps players navigate the desert by providing a smaller, zoomed-out view of the game area. It displays the player's position as a red square and the black circles as black dots. This allows players to plan their movements and avoid falling into holes.

### How to Use the Minimap

The minimap is automatically displayed at the top left corner of the screen when the game starts. Players can use the minimap to see their position and the locations of the black circles in relation to the game area. The minimap updates in real-time as the player moves and the game progresses.

## Installation and Usage

To install and use `p5.js` and `three.js` in your project, follow these steps:

1. Install the libraries using npm:
   ```bash
   npm install p5 three
   ```

2. Import the libraries in your JavaScript files:
   ```javascript
   import p5 from 'p5';
   import * as THREE from 'three';
   ```

3. Use the libraries to create your sketches and 3D scenes as needed.

## Browser Environment

To ensure the game runs correctly, make sure you are running it in a browser environment. The game relies on the `window` object, which is only available in browsers. If you encounter a `ReferenceError: window is not defined` error, it means the game is being run in a non-browser environment. Ensure you are running the game in a browser to avoid this issue.
