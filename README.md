# EventMe — Aplicación Multiplataforma para Compartir Eventos y Gestión Ética de Entradas

**Proyecto Intermodular — Desarrollo de Aplicaciones Multiplataforma (DAM)**  
**Autora:** María Marta Frisone  
**Centro:** Prometeo, thePower FP Oficial  
**Tutor:** Jorge Chaves Cristobal  

---

## Descripción del Proyecto

**EventMe** es una aplicación multiplataforma diseñada para conectar a personas que desean asistir a conciertos, festivales, obras teatrales o actividades deportivas y no cuentan con compañía en su entorno habitual, priorizando la afinidad cultural real por encima de la valoración superficial de perfiles.

Además de la exploración de eventos y la coordinación en tiempo real mediante chat, la plataforma integra **FairTicket**, un módulo de traspaso ético de entradas entre particulares que prohíbe el sobreprecio (`precio_reventa <= precio_original`) y gestiona la reserva bajo un flujo de custodia segura.

---

## Funcionalidades Principales

* **Autenticación y Seguridad (`R01`):** Registro e inicio de sesión con contraseñas cifradas unidireccionalmente mediante `bcrypt` y autorización sin estado mediante JSON Web Tokens (`JWT`).
* **Catálogo de Eventos y Favoritos (`R02`):** Exploración de espectáculos con búsqueda, filtrado por categorías y guardado de eventos de interés por usuario (`POST /api/favoritos/toggle`).
* **Chat en Tiempo Real (`R03`):** Salas de mensajería instantánea vinculadas a cada evento mediante WebSockets (`Socket.io`) para organizar puntos de encuentro.
* **Módulo FairTicket Anti-Especulación (`R04`):** Publicación de entradas sobrantes con validación algorítmica en el servidor que rechaza cualquier intento de reventa por encima del valor nominal original (`400 Bad Request`).
* **Compra Atómica y Control de Concurrencia (`R05`):** Adquisición segura de entradas con transición de estado (`disponible` → `vendido`), bloqueo de auto-compra y protección frente a condiciones de carrera (`409 Conflict`).

---

## Arquitectura y Stack Tecnológico

El sistema sigue una arquitectura cliente-servidor desacoplada en tres capas:

* **Frontend (Cliente Multiplataforma):** React Native, Expo, React Navigation, Socket.io-client.
* **Backend (API REST y Tiempo Real):** Node.js, Express, Socket.io, JSON Web Token (`JWT`), `bcrypt`.
* **Base de Datos (Persistencia):** MySQL 8.0 con esquema relacional normalizado en Tercera Forma Normal (3FN) compuesto por 5 tablas: `usuarios`, `eventos`, `favoritos`, `tickets` y `mensajes`.
* **Pruebas y Documentación:** Thunder Client, Diagrams.net (draw.io), Uizard.

---

## Estructura del Repositorio

```text
ProyectoFinal/
├── eventme-backend/          # Servidor Node.js + Express + Socket.io
│   ├── src/
│   │   ├── config/           # Conexión a base de datos MySQL
│   │   ├── controllers/      # Lógica de negocio (auth, eventos, favoritos, tickets)
│   │   ├── middlewares/      # Verificación de token JWT
│   │   ├── routes/           # Definición de endpoints REST (/api/...)
│   │   └── sockets/          # Gestión de eventos y salas en tiempo real (Socket.io)
│   ├── app.js                # Punto de entrada del servidor HTTP y WebSockets
│   └── package.json
├── eventme-frontend/         # Aplicación móvil/web en React Native + Expo
│   ├── src/
│   │   ├── api/              # Cliente HTTP centralizado (apiRequest)
│   │   ├── context/          # Gestión de sesión (AuthContext)
│   │   ├── screens/          # Pantallas (Login, Register, Home, Detail, Favoritos, Tickets, Chat)
│   │   └── theme/            # Paleta de colores corporativa (colors.js)
│   ├── App.js                # Configuración principal y navegación (Stack y Bottom Tabs)
│   └── package.json
└── README.md

---

## Instalación y Puesta en Marcha

### 1. Requisitos previos
* Node.js (v18 o superior)
* MySQL Server (v8.0 o superior)
* Expo CLI / Navegador web o app Expo Go

### 2. Configuración de la Base de Datos
1. Crear la base de datos en MySQL: `CREATE DATABASE eventme_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
2. Ejecutar el script SQL con la creación de las tablas `usuarios`, `eventos`, `favoritos`, `tickets` y `mensajes`.

### 3. Arranque del Backend (`eventme-backend`)
1. Instalar dependencias: `cd eventme-backend && npm install`
2. Crear un archivo `.env` en la raíz de `eventme-backend` con las variables `PORT=3000`, `DB_HOST=localhost`, `DB_USER=root`, `DB_PASSWORD`, `DB_NAME=eventme_db` y `JWT_SECRET`.
3. Iniciar el servidor: `node index.js`

### 4. Arranque del Frontend (`eventme-frontend`)
1. Instalar dependencias: `cd eventme-frontend && npm install`
2. Iniciar la aplicación: `npx expo start`
3. Pulsar `w` para abrir la versión web en el navegador o escanear el código QR con **Expo Go** en dispositivo móvil.

---

## Endpoints Principales de la API REST

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Público | Registro de nuevo usuario con cifrado `bcrypt` |
| `POST` | `/api/auth/login` | Público | Autenticación y emisión de token `JWT` |
| `GET` | `/api/eventos` | Público | Listado completo del catálogo de eventos |
| `GET` | `/api/favoritos` | Privado | Obtiene los eventos guardados por el usuario autenticado |
| `POST` | `/api/favoritos/toggle` | Privado | Añade o elimina un evento de la lista de favoritos |
| `GET` | `/api/tickets/evento/:id` | Privado | Lista las entradas disponibles para un evento concreto |
| `POST` | `/api/tickets` | Privado | Publica una entrada verificando `precio_reventa <= precio_original` |
| `PATCH` | `/api/tickets/:id/comprar` | Privado | Compra atómica de entrada con control de concurrencia (`409 Conflict`) |
| `GET` | `/api/tickets/mis-publicaciones` | Privado | Historial de entradas publicadas por el usuario (`INNER JOIN`) |
| `GET` | `/api/tickets/mis-compras` | Privado | Historial de entradas adquiridas con datos del vendedor |
