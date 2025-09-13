import express from "express";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;
const postsFile = path.join(process.cwd(), "data", "posts.json");

// Middlewares
app.use(cors());
app.use(express.json());

// Servir frontend automaticamente
app.use(express.static(path.join(process.cwd(), "public")));

// Função utilitária pra ler/escrever posts
function getPosts() {
  return JSON.parse(fs.readFileSync(postsFile, "utf-8"));
}
function savePosts(posts) {
  fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
}

// Rota de API: pegar posts
app.get("/api/posts", (req, res) => {
  res.json(getPosts());
});

// Rota de API: criar post
app.post("/api/posts", (req, res) => {
  const { author, content } = req.body;
  if (!author || !content) {
    return res.status(400).json({ error: "Autor e conteúdo obrigatórios!" });
  }

  const posts = getPosts();
  const newPost = {
    id: Date.now(),
    author,
    content,
    comments: []
  };

  posts.push(newPost);
  savePosts(posts);

  io.emit("newPost", newPost);
  res.json(newPost);
});

// Rota de API: criar comentário
app.post("/api/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  const { author, content } = req.body;

  if (!author || !content) {
    return res.status(400).json({ error: "Autor e conteúdo obrigatórios!" });
  }

  const posts = getPosts();
  const post = posts.find(p => p.id == id);
  if (!post) return res.status(404).json({ error: "Post não encontrado" });

  const newComment = {
    id: Date.now(),
    author,
    content
  };

  post.comments.push(newComment);
  savePosts(posts);

  io.emit("newComment", { postId: id, comment: newComment });
  res.json(newComment);
});

// Socket.io
io.on("connection", socket => {
  console.log("🔌 Usuário conectado:", socket.id);
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
