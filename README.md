# Alias-Game-API

## Table of content

- [Overview](#overview)
- [Summary](#summary)
- [Task Description](#description)
- [Setup](#setup)
- [Authentication](#authentication)
- [Relationships](#relationships)
- [Endpoints](#endpoints)

## Overview

Alias Game API es un servicio backend diseñado para generar y administrar bancos de palabras para juegos de adivinanza tipo *Alias*.  
El sistema permite:
- Construir una banca de hasta 10.000 palabras.
- Asociar a cada palabra un conjunto de 6 prohibidas (sinónimos, variaciones fonéticas u ortográficas, relaciones semánticas).
- Integrar múltiples fuentes (APIs externas y listas locales) con fallback para garantizar robustez.
- Mantener la banca limpia y consistente mediante scripts de filtrado.

Este proyecto está pensado para ser **modular, escalable y fácil de extender**, de modo que se pueda integrar en diferentes entornos de juego multijugador.
