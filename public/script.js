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

      // if(res.error){
      //   alert("Failed to send email");
      //   window.location.reload();
      // }
      const data = await res.json();
      document.getElementById("status").textContent = data.message;
    });
//otp verification
    document.getElementById('otpverify').addEventListener("submit", async(e)=>{
      e.preventDefault();
      const user_otp = document.getElementById("otp-in").value;
      if(user_otp == otp){
        alert("OTP verified");
        document.getElementById("registration-verify").style.display = "block"
        document.getElementById("status").style.display = "none"
      }else{
        alert("Wrong OTP");
        window.location.reload();

      }

    })

    ///////---OTP vERIFICATION---FOR CHANGING PASSWORD--------////////
    //Email Verification  , sending otp
    let pass_otp = 1000+Math.floor(Math.random()*1000)
    document.getElementById("forgetemailForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      document.getElementById("forget-otpverify").style.display = 'inline-flex';
      document.getElementById("forget-status").style.display = 'inline-flex';
      const to = document.getElementById("forget-email").value;
      const subject = `Password Changing`
      const message = `OTP Verification for changing password for the account ${to},You OTP for verification is ${pass_otp}`

      const res = await fetch("/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, text: message })
      });

      if(!res.ok){
		const error = await res.json().catch(() => ({}));
        alert(error.error);
        window.location.reload();
      }
      const data = await res.json();
      document.getElementById("forget-status").textContent = data.message;
    });
//otp verification
    document.getElementById('forget-otpverify').addEventListener("submit", async(e)=>{
      e.preventDefault();
      const user_otp = document.getElementById("forget-otp-in").value;
      if(user_otp == pass_otp){
        alert("OTP verified");
        document.getElementById("password-reset").style.display = "block"
        document.getElementById("forget-status").style.display = "none"
      }else{
        alert("Wrong OTP");
        window.location.reload();

      }

    })

    // starting change password
    document.getElementById("password-reset").addEventListener("submit", async(e)=>{
      e.preventDefault();
      let  password, confirm_Password ,Email ;

      Email = document.getElementById("forget-email").value;
      password = document.getElementById("new-password").value;
      confirm_Password = document.getElementById("confirm-new-password").value;

      if(password !== confirm_Password){
        alert("password mismatch");
        window.location.reload();
      }

      const res = await fetch("/changePassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email,password })
      });

      if (res.ok) {
		alert("Password Changed successfully");
        window.location.href = "/";
      }
      if (!res.ok) {
        const data = await res.json();
        alert(data.error);
        window.location.reload();
      }
    })


    //registration
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

    ////////////------Changing Password --------////////////
