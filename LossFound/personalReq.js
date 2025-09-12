function arrayBufferToBase64(buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}


async function loadMyRequestLostItems() {
  const res = await fetch('/api/myRequest/lostitems');
  const products = await res.json();
  // console.log(complaints);
  const container = document.getElementById('mylostrequests');
  container.innerHTML = "";
  if (products.length == 0) container.innerHTML = '<h1 style="text-align:center">You have not putted any lost request</h1>';
  

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
          <li class="list-group-item"><strong>Request Date:</strong> ${c.lost_date}</li>
        </ul>
        <div class="card-body">
          <button type="button" class="btn btn-danger removeitem" data-id="${c.id}" data-name="${c.name}">
            Remove Request
          </button>
        </div>
      </div>
    `;
    document.getElementById("mylostrequests").insertAdjacentHTML("beforeend",  `<div class="col-sm-6 col-md-4 col-lg-3">${cardHTML}</div>`);
  });
}
loadMyRequestLostItems();

document.getElementById("mylostrequests").addEventListener("click", async function (e) {
    if (e.target && e.target.classList.contains("removeitem")) {
        const productName = e.target.dataset.name;
        const req_id = e.target.dataset.id;

        if (!confirm(`Are you sure you want to remove loss request for "${productName}"?`)) return;

        try {
            const res = await fetch("/api/mylostRequest/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ req_id: req_id })
            });

            if (res.ok) {
                alert("Request removed successfully!");
                e.target.closest(".card").remove();
            } else {
                const msg = await res.text();
                alert("Failed to remove request: " + msg);
            }
        } catch (err) {
            console.error("Error removing request:", err);
            alert("Error removing request.");
        }
    }
});



async function loadMyRequestFoundItems() {
  const res = await fetch('/api/myRequest/founditems');
  const products = await res.json();
  // console.log(complaints);
  const container = document.getElementById('myfoundrequests');
  container.innerHTML = "";
  if (products.length == 0) container.innerHTML = '<h1 style="text-align:center">You have not putted any found request</h1>';
  

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
          <li class="list-group-item"><strong>Request Date:</strong> ${c.found_date}</li>
        </ul>
        <div class="card-body">
          <button type="button" class="btn btn-danger removeitem" data-id="${c.id}" data-name="${c.name}">
            Remove Request
          </button>
        </div>
      </div>
    `;
    document.getElementById("myfoundrequests").insertAdjacentHTML("beforeend",  `<div class="col-sm-6 col-md-4 col-lg-3">${cardHTML}</div>`);
  });
}
loadMyRequestFoundItems();

document.getElementById("myfoundrequests").addEventListener("click", async function (e) {
    if (e.target && e.target.classList.contains("removeitem")) {
        const productName = e.target.dataset.name;
        const req_id = e.target.dataset.id;

        if (!confirm(`Are you sure you want to remove loss request for "${productName}"?`)) return;

        try {
            const res = await fetch("/api/myfoundRequest/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ req_id: req_id })
            });

            if (res.ok) {
                alert("Request removed successfully!");
                e.target.closest(".card").remove();
            } else {
                const msg = await res.text();
                alert("Failed to remove request: " + msg);
            }
        } catch (err) {
            console.error("Error removing request:", err);
            alert("Error removing request.");
        }
    }
});

