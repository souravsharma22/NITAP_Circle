function showForm(formId) {
  document.querySelectorAll(".form-box").forEach(form => form.classList.remove("active"));
  document.getElementById(formId).classList.add("active");
}

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // prevent default form submission

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  if (!role) {
    alert("Please select a role");
    return;
  }

  const endpoint = role === "admin" ? "/adminLogin" : "/login";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Email: email, userPassword: password })
    });

  

    const data = await res.json();

    if (data.error) {
      alert("Invalid credentials");
    } else if (data.email) {
      //storing email in local storage
      localStorage.setItem("userEmail", data.email);
      //const userEmail = localStorage.getItem("userEmail"); // for later use


      window.location.href = role === "admin" ? "admin.html" : "home.html";
    } else {
      alert("Login failed");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
});


