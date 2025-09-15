document.addEventListener("DOMContentLoaded", async () => {
    const result = await fetch("/api/currentUser");
    const user = await result.json();
    // console.log(user)
    if (user) {
        document.querySelector("#logout-btn > form > button").innerHTML = "Log Out"
    }
    if (user && user.user_type === 'admin') {
        document.getElementById("Admin-btn").style.display = "block"
        document.querySelector(".navbar a").style.margin = "0"
    }
})