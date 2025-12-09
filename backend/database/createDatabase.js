import db from './connection.js';
import bcrypt from 'bcrypt';

const deleteMode = process.argv.includes('delete');

// DROP TABLES hvis deleteMode er aktiveret
if (deleteMode) {
    await db.exec(`DROP TABLE IF EXISTS tasks;`);
    await db.exec(`DROP TABLE IF EXISTS projects;`);
    await db.exec(`DROP TABLE IF EXISTS users;`);
}

// CREATE TABLE users
await db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('ADMIN', 'TEAM_LEADER', 'STAFF')) DEFAULT 'STAFF',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// CREATE TABLE projects
await db.exec(`
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
`);

// CREATE TABLE tasks
await db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to INTEGER,
    status TEXT DEFAULT 'todo', -- 'todo', 'in_progress', 'done'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);
`);

// Seeding: 1 admin, 1 team_leader, 1 staff og 1 project med 3 tasks
if (deleteMode) {
    const hashedAdmin = await bcrypt.hash('admin123', 10);
    const hashedLeader = await bcrypt.hash('leader123', 10);
    const hashedStaff = await bcrypt.hash('staff123', 10);

    const { lastID: adminId } = await db.run(
        `INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['Kristoffer', 'admin@example.com', hashedAdmin, 'ADMIN']
    );

    const { lastID: leaderId } = await db.run(
        `INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['TeamLeader1', 'leader@example.com', hashedLeader, 'TEAM_LEADER']
    );

    const { lastID: staffId } = await db.run(
        `INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['Staff1', 'staff@example.com', hashedStaff, 'STAFF']
    );

    // Seed 1 project oprettet af Team Leader
    const { lastID: projectId } = await db.run(
        `INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)`,
        ['Website Redesign', 'Redesign company website for better UX', leaderId]
    );

    // Seed 3 tasks tilknyttet projektet
    await db.run(
        `INSERT INTO tasks (project_id, title, description, assigned_to, status) VALUES (?, ?, ?, ?, ?)`,
        [projectId, 'Design homepage', 'Create new homepage layout', staffId, 'todo']
    );

    await db.run(
        `INSERT INTO tasks (project_id, title, description, assigned_to, status) VALUES (?, ?, ?, ?, ?)`,
        [projectId, 'Develop frontend', 'Implement frontend using Svelte', staffId, 'todo']
    );

    await db.run(
        `INSERT INTO tasks (project_id, title, description, assigned_to, status) VALUES (?, ?, ?, ?, ?)`,
        [projectId, 'Setup backend', 'Create API endpoints with Express', staffId, 'todo']
    );

}


process.exit();