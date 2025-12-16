This is examination project for node js elective fall 2025 at Erhvervsakademi København (EK).

Student: Kristoffer Søholm Gillesberg

Topic: Small project management system prototype.


## Packages used in the backend:

1) express
2) sqlite3
3) sqlite
4) bcrypt
5) helmet
6) dotenv
7) cors
8) sockets.io

## Project structure:

```

Eksamen/ (root folder)
├─ backend/
│ ├─ .env
│ ├─ app.js
│ ├─ users.db
│ ├─ database.sqlite
│ ├─package-lock.json
│ ├─package.json
│ └─ routers/
│ ├─ authRouter.js
│ └─ projectRouter.js
│ └─ protectedRouter.js
│ └─ taskRouter.js
│ └─ userRouter.js
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
│ ├─ requireRole.js
│ └─ sockets/
│ ├─ socketHandler.js
│ ├─ socketIoInstance.js
├─ frontend/
│ ├─ .env
│ ├─ .gitignore
│ ├─ .npmrc
│ ├─ README.md (basic vite README)
│ ├─ package-lock.json
│ ├─ package.json
│ ├─ svelte.config.js
│ ├─ tsconfig.json
│ ├─ vite.config.ts
│ ├─ src/
│ ├─ app.html
│ ├─ app.d.ts
│ ├─ lib/
│ ├─ Footer.svelte
│ ├─ Header.svelte
│ ├─ api.js
│ ├─ index.ts
│ ├─ socket.js
│ ├─ assets/
│ ├─ favicon.svg
│ ├─ components/
│ ├─ ProjectForm.css
│ ├─ ProjectForm.svelte
│ ├─ TaskForm.css
│ ├─ TaskForm.svelte
│ ├─ TaskList.svelte
│ ├─ UserForm.css
│ ├─ UserList.svelte
│ ├─ Userform.svelte
│ ├─ stores/
│ ├─ projectStore.js
│ ├─ sessionStore.js
│ ├─ taskStore.js
│ ├─ userStore.js
│ ├─ routes/
│ ├─ +layout.svelte
│ ├─ +page.svelte
│ ├─ layout.css
│ ├─ dashboard/
│ ├─ +page.js
│ ├─ +page.svelte
│ ├─ login/
│ ├─ +page.svelte
│ ├─ login.css
│ ├─ projects/
│ ├─ +page.svelte
│ ├─ login.css
│ ├─ create/
│ ├─ +page.svelte
│ ├─ projectcreatepage.css
│ ├─ edit/
│ ├─ [id]/
│ ├─ +page.svelte
│ ├─ tasks/
│ ├─ +page.svelte
│ ├─ staff/
│ ├─ [id]/
│ ├─ +page.svelte
│ ├─ users/
│ ├─ +page.svelte
│ ├─ userspage.css
│ ├─ static/
│ ├─ robots.txt



```

The frontend pages are located inside their respecive folder. Note there is a few [id]/+page.svelte files.

## How to setup a local session secret:

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"


## Roles in the application
1) ADMIN
2) TEAM_LEADER
3) STAFF

## What has been attempted
In this project I have attempted to learn Svelte kit server side rendering with sockets. I have tried to create a modular application where the same forms would be reused all across the entity. Say UserForm for all the user related activities. I have also attempted to create a centralized control system with websockets. This is also the first time where I have tried to create role based activities. It works on the backend, but it has proven difficult to do a proper frontend integration.

## what is currently buggy
As of December 16th 2025 small problems exist with the user entity. It has some socket frontend problems. Like doublecreation is still possible even if you logout and log back in. Corner cases are not yet fully adressed.
The styling for part of the application is way of what I wanted it to be. I think it is because of using <ul> html tags.

Sometimes the user entity goes poof and turns into unknown. Safety mechanics are a bit tricky to implement.

You can acces the page used to host the users without being logged in.

## Road map for future devolpment
1) better control of user entity
2) clearer seperation of forms and lists and the pages. I think it is better to let the styling happend locally through the pages.
3) refactor away from html lists element
4) a self service part for the user entity
5) implement proper role restriction.
6) turn the project page into a general overview with redirects for edits.
7) Refactor sockets and server into a new file. Let the backend app.js be a HTTP related file
