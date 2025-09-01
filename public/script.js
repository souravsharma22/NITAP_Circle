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
//holidays.js
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const currentYear = new Date().getFullYear();
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${currentYear}/IN`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch holidays: " + response.status);
    }

    const data = await response.json();
    console.log("API Response:", data); 

    const tbody = document.getElementById("holidays-body");
    if (!tbody) {
      console.error(" Could not find #holidays-body element");
      return;
    }

    tbody.innerHTML = ""; 

    const today = new Date();
    const currentMonth = today.getMonth() + 1;

    
    let holidays = data.filter(holiday => {
      const holidayMonth = new Date(holiday.date).getMonth() + 1;
      return holidayMonth === currentMonth;
    });

    
    if (holidays.length === 0) {
      console.warn("No holidays this month, showing next upcoming ones...");
      holidays = data.filter(holiday => new Date(holiday.date) >= today);
    }

    
    if (holidays.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center">No upcoming holidays found</td>
        </tr>
      `;
      return;
    }

    
    holidays.forEach((holiday, index) => {
      const row = `
        <tr>
          <th scope="row">${index + 1}</th>
          <td>${new Date(holiday.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
          <td>${holiday.localName}</td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error(" Error fetching holidays:", error);
  }
});

//Email Verification 

async function sendEmail() {
  const response = await fetch("/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: "receiver@example.com",
      subject: "Varification code for Email",
      text: ""
    })
  });

  const result = await response.json();
  alert(result.message);
}
