export default function socketHandler(io) {
    // Middleware til at tjekke session
    io.use((socket, next) => {
        const session = socket.request.session;
        if (session && session.user) {
            next();
        } else {
            next(new Error("Not authenticated"));
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.request.session.user.username);

        // Eksempel på chat event
        socket.on("chat message", (msg) => {
            io.emit("chat message", {
                user: socket.request.session.user.username,
                message: msg
            });
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.request.session.user.username);
        });
    });
}
