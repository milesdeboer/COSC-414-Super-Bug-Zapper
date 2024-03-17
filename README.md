# Super Bug Zapper

## Overview
Super Bug Zapper is a project for COSC 414 at The University of British Columbia - Okanagan.

## Objective
Click on bacteria to eliminate them before they grow to a critical size and avoid losing. Achieve the highest score by eliminating bacteria as quickly as possible.

## Game Rules
- **Start**: Bacteria will start growing as soon as the game begins.
- **Controls**: Click on a bacteria to make it disappear and increase your score.
- **Win/Lose Conditions**: The game continues until either all bacteria are eliminated, resulting in a win, or the bacteria reaches a specific critical size, leading to a loss.
- **Scoring**: The score for each eliminated bacteria is calculated based on the time elapsed since the start of the game. If you eliminate the bacteria immediately, you get a score of 1000. The score decreases linearly over time, reaching 0 when the bacteria grows too large, and you lose the game.

## Instructions
1. Open the game in a WebGL-enabled browser.
    - The HTML files are found in the 2D and 3D folders for the 2D and 3D game respectivly. 
2. Click on the bacteria to remove them and earn points
3. Continue playing until all bacteria are consumed or the bacteria grows too large.

## Development
The game is developed using HTML, JavaScript, and WebGL for graphics rendering.
