function showForm(formId){
    document.querySelectorAll(".form-box").forEach(form => form.classList.remove("active"));
    document.getElementById(formId).classList.add("active");
}

  const form = document.querySelector("form");
  form.addEventListener("submit", async (e)=> {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("/login", 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Email: email, userPassword: password })
    });

    const data = await res.json();
    if (data.email) {
      localStorage.setItem("userEmail", data.email);
      window.location.href = "/home.html";
    } else {
      alert("Login failed");
    }
  });

