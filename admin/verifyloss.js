//converting back to image image 
function arrayBufferToBase64(buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}


//loss requests loading ---------------------------------------------------
async function loadlostitemsforVarification() {
  const res = await fetch('/api/lostitems/varifyList');
      console.log("Response status:", res.status);

  const products = await res.json();
//   console.log(products);
  const container = document.getElementById('lost-items');
  container.innerHTML = "";
  if (products.length == 0) container.innerHTML = '<h1 style="text-align:center"> No Requests for approval</h1>';
  

  products.forEach(c => {
    const image = c.image ? `data:image/png;base64,${arrayBufferToBase64(c.image.data)}` : null;
    if (image) {
      imgElement = `<img src="${image}" class="card-img-top" alt="Complaint Image">`;
    } else {
      imgElement = `<div class="no-image text-center p-4 bg-light">Not Available</div>`;
    }

    const cardHTML = `
      <div class="card m-2 shadow-sm" style="max-width: 18rem; flex: 1;">
       ${imgElement}
        <div class="card-body">
          <h5 class="card-title text-truncate">${c.name}</h5>
          <p class="card-text small">${c.description}</p>
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item"><strong>Owner:</strong> ${c.username}</li>
          <li class="list-group-item"><strong>Email:</strong> ${c.email}</li>
          <li class="list-group-item"><strong>Lost At:</strong> ${c.location}</li>
          <li class="list-group-item"><strong>Lost on:</strong> ${c.lost_date}, ${c.lost_time}</li>
          <li class="list-group-item"><strong>Category:</strong> ${c.category}</li>
        </ul>
        <div class="card-body">
          <button type="button" class="btn btn-danger approveitem" data-id="${c.id}" data-name="${c.name}" data-email ="${c.email}">
            Approve Request
          </button>
          <p></p>
          <button type="button" class="btn btn-danger removeitem" data-id="${c.id}" data-name="${c.name}" data-email ="${c.email}">
            Remove Request
          </button>
        </div>
      </div>
    `;
    document.getElementById("lost-items").insertAdjacentHTML("beforeend",  `<div class="col-sm-6 col-md-4 col-lg-3">${cardHTML}</div>`);
  });
}

loadlostitemsforVarification();


document.getElementById("lost-items").addEventListener("click", async function(e) {
  // REMOVE ITEM
  if (e.target && e.target.classList.contains("removeitem")) {
    const productName = e.target.dataset.name;
    const userEmail = e.target.dataset.email;
    const id = e.target.dataset.id;

    if (!confirm(`Are you sure you want to remove "${productName}"?`)) return;

    try {
      const res = await fetch("/api/delete/admin/lostRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: id , email: userEmail})
      });

      if (res.ok) {
        alert("Product removed successfully!");
        e.target.closest(".card").remove();
      } else {
        const msg = await res.text();
        alert("Failed to remove product: " + msg);
      }
    } catch (err) {
      console.error("Error removing product:", err);
      alert("Error removing product.");
    }
  }

  // APPROVE ITEM
  if (e.target && e.target.classList.contains("approveitem")) {
    const productName = e.target.dataset.name;
    const userEmail = e.target.dataset.email;
    const id = e.target.dataset.id;


    if (!confirm(`Do you want to approve "${productName}"?`)) return;

    try {
      const res = await fetch("/api/approve/admin/lostRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: id, email: userEmail })
      });

      if (res.ok) {
        alert("Product approved successfully!");
        e.target.closest(".card").remove(); // remove from list after approval
      } else {
        const msg = await res.text();
        alert("Failed to approve product: " + msg);
      }
    } catch (err) {
      console.error("Error approving product:", err);
      alert("Error approving product.");
    }
  }
});

/////found requests loading --------------------------------------------------

async function loadfounditemsforVerification() {
  const res = await fetch('/api/founditems/varifyList');
      console.log("Response status:", res.status);

  const products = await res.json();
//   console.log(products);
  const container = document.getElementById('found-items');
  container.innerHTML = "";
  if (products.length == 0) container.innerHTML = '<h1 style="text-align:center"> No Requests for approval of found items</h1>';
  

  products.forEach(c => {
    const image = c.image ? `data:image/png;base64,${arrayBufferToBase64(c.image.data)}` : null;
    if (image) {
      imgElement = `<img src="${image}" class="card-img-top" alt="Complaint Image">`;
    } else {
      imgElement = `<div class="no-image text-center p-4 bg-light">Not Available</div>`;
    }

    const cardHTML = `
      <div class="card m-2 shadow-sm" style="max-width: 18rem; flex: 1;">
       ${imgElement}
        <div class="card-body">
          <h5 class="card-title text-truncate">${c.name}</h5>
          <p class="card-text small">${c.description}</p>
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item"><strong>Owner:</strong> ${c.username}</li>
          <li class="list-group-item"><strong>Email:</strong> ${c.email}</li>
          <li class="list-group-item"><strong>Lost At:</strong> ${c.location}</li>
          <li class="list-group-item"><strong>Lost on:</strong> ${c.found_date}</li>
          <li class="list-group-item"><strong>Category:</strong> ${c.category}</li>
        </ul>
        <div class="card-body">
          <button type="button" class="btn btn-danger approveitem" data-foundid="${c.id}" data-namefound="${c.name}" data-emailfound ="${c.email}">
            Approve Request
          </button>
          <p></p>
          <button type="button" class="btn btn-danger removeitem" data-foundid="${c.id}" data-namefound="${c.name}" data-emailfound ="${c.email}">
            Remove Request
          </button>
        </div>
      </div>
    `;
    document.getElementById("found-items").insertAdjacentHTML("beforeend",  `<div class="col-sm-6 col-md-4 col-lg-3">${cardHTML}</div>`);
  });
}

loadfounditemsforVerification();


document.getElementById("found-items").addEventListener("click", async function(e) {
  // REMOVE ITEM
  if (e.target && e.target.classList.contains("removeitem")) {
    const userEmail = e.target.dataset.emailfound;
    const foundid = e.target.dataset.foundid;    
    const productName = e.target.dataset.namefound;


    if (!confirm(`Are you sure you want to remove found request "${productName}"?`)) return;

    try {
      const res = await fetch("/api/delete/admin/foundRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: userEmail, id: foundid})
      });

      if (res.ok) {
        alert("Request removed successfully!");
        e.target.closest(".card").remove();
      } else {
        const msg = await res.text();
        alert("Failed to remove Request: " + msg);
      }
    } catch (err) {
      console.error("Error removing Request:", err);
      alert("Error removing Found Request.");
    }
  }

  // APPROVE ITEM
  if (e.target && e.target.classList.contains("approveitem")) {
    const productName = e.target.dataset.namefound;
    const userEmail = e.target.dataset.emailfound;
    const foundid = e.target.dataset.foundid;


    if (!confirm(`Do you want to approve found Request for "${productName}"?`)) return;

    try {
      const res = await fetch("/api/approve/admin/foundRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: foundid, email: userEmail })
      });

      if (res.ok) {
        alert("Product approved successfully!");
        e.target.closest(".card").remove(); // remove from list after approval
      } else {
        const msg = await res.text();
        alert("Failed to approve Request: " + msg);
      }
    } catch (err) {
      console.error("Error approving found Request:", err);
      alert("Error approving found Request.");
    }
  }
});

