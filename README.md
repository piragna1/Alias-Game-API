# Alias-Game-API

## Table of content

- [Overview](#overview)
- [Setup](#setup)
- [Endpoints](#endpoints)
- [Entities Relationship](#entities-relationship)
- [WebSocket Events](#websocket-events)

## Overview

Alias Game is a multiplayer word-guessing game currently under development.  
The goal of the project is to recreate the classic *Alias* experience in a digital environment, where players must describe a target word without using a set of forbidden words.

The system includes:
- A backend service that builds and manages a word bank.
- Automatic generation of forbidden words for each entry (semantic, phonetic, and spelling variations).
- Real-time multiplayer support using WebSocket events powered by Socket.IO.
- A modular architecture designed for separation between game logic, session management, and player interactions.

This repository represents the foundation of the game logic, including both RESTful endpoints and WebSocket event handling.  
It will later integrate with a frontend interface to deliver a complete interactive experience.


## Setup

To run the project locally, follow these steps:

1. Make sure you have [Docker](https://www.docker.com/) installed and running on your system.

2. Open two terminal windows.

3. In the first terminal, navigate to the `backend` folder and start the required services:
```bash
   docker compose up --build
   npm install
   npm run dev
```
5. In the second terminal, navigate to the `frontend` folder and start the development server:
```bash
   cd frontend
   npm install
   npm run dev
```
Both servers will start in development mode.  
Make sure the backend (including Docker services) is running before interacting with the frontend.

## Endpoints

### Authentication

- **POST /auth/register**
  - Body: { name, email, password, role }
  - Creates a new user in the database.
  - Returns: { status: "success", user }

- **POST /auth/login**
  - Body: { email, password }
  - Validates credentials and issues:
    - accessToken (JSON response, valid 15 min)
    - refreshToken (HTTP-only cookie, valid 30 days)
  - Returns: { status: "success", accessToken }

- **POST /auth/refresh-token**
  - Requires refreshToken cookie.
  - Rotates tokens and returns new accessToken.
  - Returns: { status: "success", accessToken }

- **POST /auth/logout**
  - Requires valid tokens.
  - Invalidates session, clears refreshToken cookie.
  - Returns: { message: "Logged out successfully" }

---

### Rooms

- **POST /rooms**
  - Auth required.
  - Creates a new room with the requesting user as host.
  - Returns: room object.

- **POST /rooms/:code/join**
  - Auth required.
  - Adds the user to the room (auto-assigns team).
  - Emits `player:joined` and `team-state` via sockets.
  - Returns: updated room object.

- **DELETE /rooms/:code/leave**
  - Auth required.
  - Marks user as inactive in the room.
  - If last player leaves → room is closed (`room:close` event).
  - Returns: updated room object.

- **POST /rooms/:code/start**
  - Auth required.
  - Starts a new game in the room.
  - Calls `gameService.createGame`.
  - Emits `game:started` event with initial game state.
  - Returns: game object.

- **PATCH /rooms/:code/status**
  - Auth required.
  - Updates room status (e.g., waiting, finished).
  - Returns: updated room object.

- **GET /rooms/:code**
  - Fetches room details (teams, players, scores).
  - Returns: room object.

- **GET /rooms**
  - Lists available rooms with status "waiting".
  - Returns: array of rooms.

---

### Integration with Game Flow

- **REST → Game Start**
  - `POST /rooms/:code/start` → `gameService.createGame` → `SocketEventEmitter.gameStarted`.

- **Sockets → Game Progress**
  - Players interact via `chat:message` and `game:message`.
  - `game.service.js` validates answers/taboo words.
  - Events emitted: `game:correct-answer`, `game:taboo-word`, `game:turn-updated`, `game:finished`.

- **Persistence**
  - Room state stored in Redis (`roomCache`).
  - Game state stored in Redis (`gameCache`).
  - DB (Sequelize) used for persistence of rooms, users, words, scores.# Entities Relationship
```txt
User : Room -> N : 1
```
Many users can be connected to a room and just one room at the same time.
```txt
Word : TabooWord -> 1 : N
```
The word to guess is related to several taboo words that can not be written.
```txt
Word : SimilarWord -> 1 : N
```
The word to guess is related to several similar words each one with its own similarity score.


## WebSocket Events

The game logic is handled via WebSocket events using [Socket.IO](https://socket.io/).  
Clients must establish a socket connection after authentication to participate in real-time gameplay.

### Example events

- `connect`  
  Triggered when a client connects to the server.

- `room:join`  
  Join a specific room by code.

- `game:start`  
  Starts a new game round.

- `game:guess`  
  Submit a guess for the current word.

- `game:skip`  
  Skip the current word.

- `game:end`  
  Ends the current round and broadcasts results.

> Note: All socket events are namespaced and require a valid session.

## Game Flow (Frontend Perspective)

This section describes how the frontend reacts to game events using WebSocket messages and API calls, as implemented in RoomPage.jsx.

### Initial Room Load

When the user enters a room:

- The frontend fetches room data from GET /rooms/:roomCode.
- It verifies:
  - That the room is active (status !== "finished").
  - That the user is part of the room (players.some(p => p.id === user.id && p.active)).
- If a game is already in progress (data.game exists), it sets the room state to "in-game" and loads the current game data.

### WebSocket Event Handling

The frontend listens to the following WebSocket events:

Event                | Effect on UI
---------------------|---------------------------------------------------------------
player:joined        | Adds a system message to chat
player:left          | Adds a system message to chat
chat:message         | Appends a new user message to chat
team-state           | Updates team composition (red and blue)
game:started         | Sets roomState to "in-game" and loads initial game data
game:turn-updated    | Updates gameData with new turn info
game:correct-answer  | Updates gameData and appends a success message
game:taboo-word      | Displays an error message (forbidden word used)
game:finished        | Stores final results in gameData.results, resets to lobby
room:updated         | Updates room metadata (e.g., global scores)

All events are handled through a single handleSocketEvent dispatcher.

### Game State

- roomState: "lobby" or "in-game", determines layout and available actions.
- gameData: Contains current word, team turn, timer, and results.
- roomData: Holds global scores and room metadata.
- teams: Updated via team-state event or initial fetch.
- messages: Chat and system messages, updated on most events.

### Game Actions

- Join a team: Emits join-team with { roomCode, team, userId }.
- Start game: Calls POST /rooms/:roomCode/start, which triggers game:started.
- Leave room: Calls DELETE /rooms/:roomCode/leave and redirects to home.

## Game Flow (Backend Perspective)

This section describes how the backend handles game logic and real-time communication using WebSocket events.

### Socket Initialization

- The `registerRoomSocket(io)` function sets up the socket server.
- A middleware validates the access token from `socket.handshake.auth.token`.
- If a previous socket exists for the same user and `override` is not set, the connection is rejected.
- On successful connection, the socket ID is cached in Redis using `socketCache.set(userId, socket.id)`.

### Core Events

#### chat:message
- Broadcasts a chat message to the room using `SocketEventEmitter.sendMessage`.

#### game:message
- Validates the message using `gameService.checkForAnswer(user, text, code)`.
- Depending on the result:
  - If correct → emits `game:correct-answer`.
  - If taboo word → emits `game:taboo-word` to the sender only.
  - Otherwise → emits a regular chat message.

#### join-team
- Updates team assignment via `roomService.updateTeams`.

#### disconnect
- If the socket was part of a room, it triggers `roomService.leaveRoom`.
- Emits `player:left` to the room.
- Removes the socket mapping from Redis.

### Event Emission via SocketEventEmitter

| Method                     | Emits Event           | Description                                      |
|---------------------------|-----------------------|--------------------------------------------------|
| `gameStarted`             | `game:started`        | Broadcasts game start with initial game state    |
| `gameCorrectAnswer`       | `game:correct-answer` | Broadcasts correct guess with updated game state |
| `gameTurnUpdated`         | `game:turn-updated`   | Broadcasts new turn info                         |
| `tabooWord`               | `game:taboo-word`     | Sends error to user who used forbidden word      |
| `gameFinished`            | `game:finished`       | Broadcasts final results                         |
| `sendMessage`             | `chat:message`        | Broadcasts chat message                          |
| `updateRoom`              | `room:updated`        | Broadcasts room metadata update                  |
| `teamState`               | `team-state`          | Broadcasts updated team composition              |
| `joinRoom` / `leaveRoom`  | `player:joined` / `player:left` | Broadcasts player movement between rooms |

### Redis Usage

- Socket IDs are cached per user to ensure single active connection.
- On disconnect, the mapping is removed.
- This enables targeted emissions like `tabooWord` to a specific user.

### Notes

- All payloads follow a consistent structure via `buildPayload(type, status, data, message)`.
- The `SocketEventEmitter` is initialized once via `SocketEventEmitter.init(io)` and reused across the app.
