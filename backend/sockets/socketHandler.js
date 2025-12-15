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



        // --- Live task updates ---
    socket.on("task updated", (updatedTask) => {
        io.emit("taskUpdated", updatedTask);   // name has to match frontend
    });

    socket.on("task created", (newTask) => {
        io.emit("taskCreated", newTask);       
    });

    socket.on("task deleted", ({ id, project_id }) => {
        io.emit("taskDeleted", { id, project_id });
    });

    socket.on("disconnect", () => {
            console.log("User disconnected:", username);
    });
    });
}
