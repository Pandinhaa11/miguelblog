import express from "express";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = 3000;
const postsFile = path.join(process.cwd(), "backend", "posts.json");


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "frontend")));

// Rota para pegar posts
app.get("/posts", (req, res) => {
  const posts = JSON.parse(fs.readFileSync(postsFile, "utf-8"));
  res.json(posts);
});

// Adicionar novo post
app.post("/posts", (req, res) => {
  const { author, content } = req.body;
  const posts = JSON.parse(fs.readFileSync(postsFile, "utf-8"));

  const newPost = {
    id: Date.now(),
    author,
    content,
    comments: []
  };

  posts.push(newPost);
  fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));

  io.emit("newPost", newPost); // manda pros clientes em tempo real
  res.json(newPost);
});

// Adicionar comentário
app.post("/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  const { author, content } = req.body;
  const posts = JSON.parse(fs.readFileSync(postsFile, "utf-8"));

  const post = posts.find(p => p.id == id);
  if (!post) return res.status(404).json({ error: "Post não encontrado" });

  const newComment = {
    id: Date.now(),
    author,
    content
  };

  post.comments.push(newComment);
  fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));

  io.emit("newComment", { postId: id, comment: newComment });
  res.json(newComment);
});

// Socket.io
io.on("connection", socket => {
  console.log("Usuário conectado:", socket.id);
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
