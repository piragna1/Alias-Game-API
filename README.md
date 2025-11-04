# Alias-Game-API

## Table of content

- [Overview](#overview)
- [Setup](#setup)
- [Authentication](#authentication)
- [Endpoints](#endpoints)

## Overview

Alias Game is a multiplayer word-guessing game currently under development.  
The goal of the project is to recreate the classic *Alias* experience in a digital environment, where players must describe a target word without using a set of forbidden words.  

The system includes:
- A backend service that builds and manages a word bank.  
- Automatic generation of forbidden words for each entry (semantic, phonetic, and spelling variations).
- An architecture designed for future expansion into multiplayer gameplay.  

This repository represents the foundation of the game logic, which will later integrate with a frontend interface to deliver a complete interactive experience.

## Setup

To run the project locally, follow these steps:

1. Open two terminal windows.
2. In the first terminal, navigate to the `backend` folder:
   ``` bash
   cd backend
   npm install
   npm run dev
   ```

3. In the second terminal, navigate to the `frontend` folder:
4. ```bash
   cd frontend
   npm install
   npm run dev
   ```

Both servers will start in development mode.
Make sure the backend is running before interacting with the frontend.
