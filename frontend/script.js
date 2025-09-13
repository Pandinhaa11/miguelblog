const socket = io("http://localhost:3000");

async function loadPosts() {
  const res = await fetch("http://localhost:3000/posts");
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

  await fetch("http://localhost:3000/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author, content })
  });
}

async function sendComment(postId) {
  const author = document.getElementById(`name-${postId}`).value;
  const content = document.getElementById(`comment-${postId}`).value;
  if (!author || !content) return;

  await fetch(`http://localhost:3000/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author, content })
  });
}

// Realtime updates
socket.on("newPost", post => {
  loadPosts();
});

socket.on("newComment", data => {
  loadPosts();
});

loadPosts();
