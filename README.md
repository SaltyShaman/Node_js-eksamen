This is examination project for node js elective fall 2025 at Erhvervsakademi København (EK).

Student: Kristoffer Søholm Gillesberg


## Packages used in the backend:

express
sqlite3
sqlite
bcrypt
helmet
dotenv
cors
sockets.io
express-sessions

## Project structure:

```

Eksamen/ (root folder)
├─ backend/
│ ├─ .env
│ ├─ app.js
│ ├─ users.db (in gitignore)
│ └─ routers/
│ ├─ authRouter.js
│ └─ middlewareRouter.js
│ └─ config/
│ ├─ rateLimiters.js
│ ├─ sessionConfig.js
│ └─ controllers/
│ ├─ authController.js
│ └─ database/
│ ├─ connection.js
│ ├─ createDatabase.js
│ └─ middleware/
│ ├─ requireLogin.js
├─ frontend/  (to-do)

```

## How to setup a local session secret:

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
