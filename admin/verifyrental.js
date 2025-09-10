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

async function loadProductsforVarification() {
  const res = await fetch('/api/Products/rental/varifyList');
    // console.log("Response status:", res.status);

  const products = await res.json();
//   console.log(products);
  const container = document.getElementById('products');
  container.innerHTML = "";
  if (products.length == 0) container.innerHTML = '<h1 style="text-align:center"> No item for approval</h1>';
  

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
          <h5 class="card-title text-truncate">${c.product_name}</h5>
          <p class="card-text small">${c.description}</p>
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item"><strong>Owner:</strong> ${c.name}</li>
          <li class="list-group-item"><strong>Email:</strong> ${c.email}</li>
          <li class="list-group-item"><strong>Hostel:</strong> ${c.hostel}</li>
          <li class="list-group-item"><strong>Category:</strong> ${c.category}</li>
          <li class="list-group-item"><strong>Price:</strong> ₹${c.price}</li>
        </ul>
        <div class="card-body">
          <button type="button" class="btn btn-danger approveitem" data-id = "${c.product_id}" data-name="${c.product_name}" data-email ="${c.email}">
            Approve item
          </button>
          <button type="button" class="btn btn-danger removeitem" data-id = "${c.product_id}" data-name="${c.product_name}" data-email ="${c.email}">
            Remove item
          </button>
        </div>
      </div>
    `;
    document.getElementById("products").insertAdjacentHTML("beforeend",  `<div class="col-sm-6 col-md-4 col-lg-3">${cardHTML}</div>`);
  });
}

loadProductsforVarification();

document.getElementById("products").addEventListener("click", async function(e) {
  // REMOVE ITEM
  if (e.target && e.target.classList.contains("removeitem")) {
    const productName = e.target.dataset.name;
    const userEmail = e.target.dataset.email;
    const id = e.target.dataset.id;

    if (!confirm(`Are you sure you want to remove "${productName}"?`)) return;

    try {
      const res = await fetch("/api/delete/admin/rental", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ product_id:id , email: userEmail})
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
      const res = await fetch("/api/approve/admin/rental", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ product_id: id, email: userEmail })
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



//loading all the products availbale for renting for admin access

async function loadAllRentalProducts() {
  const res = await fetch('/api/AllRentalProducts');
  const products = await res.json();
  // console.log(complaints);
  const container = document.getElementById('allproducts');
  if (products.length == 0) container.innerHTML = '<h1 style="text-align:center"> </h1>';
  

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
          <h5 class="card-title text-truncate">${c.product_name}</h5>
          <p class="card-text small">${c.description}</p>
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item"><strong>Sold by:</strong> ${c.name}</li>
          <li class="list-group-item"><strong>Email:</strong> ${c.email}</li>
          <li class="list-group-item"><strong>Hostel:</strong> ${c.hostel}</li>
          <li class="list-group-item"><strong>Category:</strong> ${c.category}</li>
          <li class="list-group-item"><strong>Price:</strong> ₹${c.price}</li>
        </ul>
        <div class="card-body">
          <button type="button" class="btn btn-danger removeitem" data-id="${c.product_id}" data-name="${c.product_name}">
            Remove item
          </button>
        </div>
      </div>
    `;
   
    document.getElementById("allproducts").insertAdjacentHTML("beforeend", cardHTML);
  });
}

loadAllRentalProducts();

//enabling the delete option for the admin
document.getElementById("allproducts").addEventListener("click", async function(e) {
    if (e.target && e.target.classList.contains("removeitem")) {
      const productName = e.target.dataset.name;
      const product_id = e.target.dataset.id;

      if (!confirm(`Are you sure you want to remove "${productName}"?`)) return;

      try {
        const res = await fetch("/api/admin/rental/products/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ product_id: product_id })
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
  });