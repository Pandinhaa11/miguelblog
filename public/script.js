const socket = io();

// Carregar posts
async function loadPosts() {
  const res = await fetch("/api/posts");
  const posts = await res.json();
  renderPosts(posts);
}

function renderPosts(posts) {
  const container = document.getElementById("posts");
  container.innerHTML = "";
  posts.forEach(post => {
    const div = document.createElement("div");
    div.classList.add("post");
    div.innerHTML = `
      <h3>${post.author}</h3>
      <p>${post.content}</p>
      <div class="comments">
        ${post.comments.map(c => `<div class="comment"><b>${c.author}:</b> ${c.content}</div>`).join("")}
      </div>
      <input placeholder="Seu nome" id="name-${post.id}">
      <input placeholder="Comentário" id="comment-${post.id}">
      <button onclick="sendComment(${post.id})">Comentar</button>
    `;
    container.appendChild(div);
  });
}

async function sendPost() {
  const author = document.getElementById("author").value;
  const content = document.getElementById("content").value;
  if (!author || !content) return;

  await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author, content })
  });

  document.getElementById("content").value = "";
}

async function sendComment(postId) {
  const author = document.getElementById(`name-${postId}`).value;
  const content = document.getElementById(`comment-${postId}`).value;
  if (!author || !content) return;

  await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author, content })
  });

  document.getElementById(`comment-${postId}`).value = "";
}

// Atualizações em tempo real
socket.on("newPost", () => loadPosts());
socket.on("newComment", () => loadPosts());

// Início
loadPosts();
