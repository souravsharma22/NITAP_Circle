function showForm(formId){
    document.querySelectorAll(".form-box").forEach(form => form.classList.remove("active"));
    document.getElementById(formId).classList.add("active");
}
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("complaintForm");
  const complaintContainer = document.getElementById("complaintsContainer");

  // 🟩 RENDER COMPLAINT (on index.html)
  if (complaintContainer) {
    const stored = localStorage.getItem("newComplaint");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        renderComplaint(data);
        localStorage.removeItem("newComplaint");
      } catch (err) {
        console.error("Invalid complaint data", err);
      }
    }
  }

  // 🟥 SUBMIT FORM (on raise.html)
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const complaint = {
        title: document.getElementById("title").value,
        description: document.getElementById("desc").value,
        name: document.getElementById("name").value,
        roll: document.getElementById("roll").value,
        hostel: document.getElementById("hostel").value,
        type: document.getElementById("type").value,
      };

      const imageInput = document.getElementById("image");

      if (imageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (event) {
          complaint.image = event.target.result;
          localStorage.setItem("newComplaint", JSON.stringify(complaint));
          window.location.href = "index.html";
        };
        reader.readAsDataURL(imageInput.files[0]);
      } else {
        complaint.image = null;
        localStorage.setItem("newComplaint", JSON.stringify(complaint));
        window.location.href = "index.html";
      }
    });
  }
});
<script>
  const form = document.querySelector("form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://localhost:4000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.email) {
      localStorage.setItem("userEmail", data.email);
      // redirect or show welcome
    } else {
      alert("Login failed");
    }
  });
</script>

// ✅ Helper to render a complaint card
function renderComplaint({ title, description, name, roll, hostel,type, image }) {
  const container = document.getElementById("complaintsContainer");
  const card = document.createElement("div");
  card.className = "col-md-4 mb-4";
  card.innerHTML = `
    <div class="card" style="width: 100%;">
      ${
        image
          ? `<img src="${image}" class="card-img-top" alt="Uploaded image">`
          : `<div class="card-img-top text-center py-5 bg-light">No Image Provided</div>`
      }
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${description}</p>
      </div>
      <ul class="list-group list-group-flush">
        <li class="list-group-item">${name}</li>
        <li class="list-group-item">${roll}</li>
        <li class="list-group-item">${hostel}</li>
        <li class="list-group-item">${type}</li>
      </ul>
    </div>
  `;
  container.appendChild(card);
}
