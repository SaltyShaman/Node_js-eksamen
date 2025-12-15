export default function socketHandler(io) {
    // Middleware for session check
    io.use((socket, next) => {
        const session = socket.request.session;
        if (session && session.user) {
            next();
        } else {
            console.log("Unauthorized socket connection attempt");
            next(new Error("Not authenticated"));
        }
    });

    io.on("connection", (socket) => {
        const { user } = socket.request.session;
        const username = user.username;
        const userId = user.id;

        console.log("User connected:", username, "ID:", userId);

        // --- Eksempel chat event ---
        socket.on("chat message", (msg) => {
            io.emit("chat message", { user: username, message: msg });
        });

        // --- Live task updates ---
    socket.on("task updated", (updatedTask) => {
        io.emit("taskUpdated", updatedTask);   // ✔ samme navn som frontend
    });

    socket.on("task created", (newTask) => {
        io.emit("taskCreated", newTask);       // hvis du har dette event
    });

    socket.on("task deleted", ({ id, project_id }) => {
        io.emit("taskDeleted", { id, project_id });
    });

    socket.on("disconnect", () => {
            console.log("User disconnected:", username);
    });
    });
}
