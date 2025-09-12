function showForm(formId) {
  document.querySelectorAll(".form-box").forEach(form => form.classList.remove("active"));
  document.getElementById(formId).classList.add("active");
}



//Email Verification  , sending otp
    let otp = 1000+Math.floor(Math.random()*1000)
    document.getElementById("emailForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      document.getElementById("otpverify").style.display = 'inline-flex';
      document.getElementById("status").style.display = 'inline-flex';
      const to = document.getElementById("to").value;
      const subject = "OTP Verification for NITAP CIRCLE"
      const message = `You OTP for verification is ${otp}`

      const res = await fetch("/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, text: message })
      });

      if(!res.ok){
        alert("Enter valid email, use the collge email id");
        window.location.reload();
      }
      const data = await res.json();
      document.getElementById("status").textContent = data.message;
    });
//otp verification
    document.getElementById('otpverify').addEventListener("submit", async(e)=>{
      e.preventDefault();
      const user_otp = document.getElementById("otp-in").value;
      if(user_otp == otp){
        alert("OTP varified");
        document.getElementById("registration-verify").style.display = "block"
        document.getElementById("status").style.display = "none"
      }else{
        alert("Wrong OTP");
        window.location.reload();

      }

    })
    // starting registration
    document.getElementById("registration-verify").addEventListener("submit", async(e)=>{
      e.preventDefault();
      let Name,Email, password, college_id ;
      Name = document.getElementById("name").value;
      Email = document.getElementById("to").value;
      password = document.getElementById("reg-password").value;
      college_id = document.getElementById("college-id").value;

      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Name,Email,password, college_id })
      });
      if (res.redirected) {
        window.location.href = "/";
      }
      if (!res.ok) {
        const data = await res.json();
        alert(data.error);
        window.location.reload();
      }
    })