const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});

function getFirstUserEmail(room) {
  const emails = roomToEmailsMap.get(room) || [];
  return emails[0];
}

const emailToSocketMap = new Map();
const socketToEmailMap = new Map();
const roomToEmailsMap = new Map();

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("room:join", ({ email, room }) => {
    emailToSocketMap.set(email, socket.id);
    socketToEmailMap.set(socket.id, email);

    const emails = roomToEmailsMap.get(room) || [];
    roomToEmailsMap.set(room, emails);
    emails.push(email);

    const firstUserEmail = getFirstUserEmail(room);
    const firstUserId = emailToSocketMap.get(firstUserEmail);
    console.log("firstUserEmail", firstUserEmail);
    console.log("currentUserEmail", email);

    io.to(room).emit("user:joined", { email, id: socket.id, room });
    socket.join(room);

    io.to(socket.id).emit("room:join", { email, room });
    console.log(firstUserEmail != email);
    if (firstUserEmail != email) {
      io.to(socket.id).emit("user:joined", {
        email: firstUserEmail,
        id: firstUserId,
        room,
      });
    }
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, answer }) => {
    io.to(to).emit("call:accepted", { from: socket.id, answer });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });
  
  socket.on("peer:nego:done", ({ to, answer }) => {
    console.log("peer:nego:done", answer);
    io.to(to).emit("peer:nego:final", { from: socket.id, answer });
  });
});

