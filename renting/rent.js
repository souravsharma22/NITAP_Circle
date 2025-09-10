document.getElementById("lend-btn").addEventListener('click', function () {
  document.getElementById("form").style.display = 'block';
})

document.getElementById("closeButton").addEventListener('click', function () {
  document.getElementById("form").style.display = 'none';
})


//converting image for storing in sql
function arrayBufferToBase64(buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

all_items_for_rent = [];
async function loadRentalProducts() {
  const res = await fetch('/api/AllRentalProducts');
  const products = await res.json();
//   console.log(products);
  const container = document.getElementById('rentproductContainer');
  if (products.length == 0) container.innerHTML = '<h1 style="text-align:center"> Nothing Available for Renting</h1>';


  all_items_for_rent = products.map(c => {
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
          <li class="list-group-item"><strong>Owner:</strong> ${c.username}</li>
          <li class="list-group-item"><strong>Email:</strong> ${c.email}</li>
          <li class="list-group-item"><strong>Location:</strong> ${c.hostel}</li>
          <li class="list-group-item"><strong>Category:</strong> ${c.category}</li>
          <li class="list-group-item"><strong>Rate:</strong> ₹${c.price}</li>
      </ul>
      <div class="card-body d-flex flex-column flex-md-row gap-2">
          <a href="tel:+91${c.contact}" class="btn btn-success btn-sm">
              📞 Call
          </a>
          <a href="https://wa.me/91${c.contact}" target="_blank" class="btn btn-success btn-sm" style="background-color:#25D366; border-color:#25D366;">
              💬 WhatsApp
          </a>
      </div>
  </div>
`;


    const wrapper = document.createElement('div');
    wrapper.className = "col-sm-6 col-md-4 col-lg-3";
    wrapper.innerHTML = cardHTML;
    container.appendChild(wrapper);

    return { name: c.product_name, category: c.category, element: wrapper };
  });
}
loadRentalProducts();


async function loadMyRentalProducts() {
  const res = await fetch('/api/rental/myProducts');
  const products = await res.json();
//   console.log(products);
  const container = document.getElementById('myRentItems');
  container.innerHTML = "";
  if (products.length == 0) container.innerHTML = '<h1 style="text-align:center"> You have not listed anythhing for renting</h1>';
  

  products.forEach(c => {
    const image = c.image ? `data:image/png;base64,${arrayBufferToBase64(c.image.data)}` : null;
    if (image) {
      imgElement = `<img src="${image}" class="card-img-top" alt="product Image">`;
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
          <li class="list-group-item"><strong>Contact:</strong> ${c.contact}</li>
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
    document.getElementById("myRentItems").insertAdjacentHTML("beforeend", cardHTML);
  });
}

document.getElementById('my-products').addEventListener('click', function () {

  document.getElementById('rentproductContainer').style.display = 'none';
  document.querySelector("#hero > h1").innerHTML = "Renting Services by You"
  document.querySelector("#hero > p").innerHTML = "View all your items on rent, remove them if you want"
  document.getElementById('search-section').style.display = 'none';
  loadMyRentalProducts();
})

  document.getElementById("myRentItems").addEventListener("click", async function(e) {
    if (e.target && e.target.classList.contains("removeitem")) {
      const productName = e.target.dataset.name;
      const product_id = e.target.dataset.id;

      if (!confirm(`Are you sure you want to remove "${productName}"?`)) return;

      try {
        const res = await fetch("/api/myrental/delete", {
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


////Searching functionality
const searchbtn = document.getElementById("search-btn");
searchbtn.addEventListener('click', (e)=>{
  e.preventDefault();
  const value = document.getElementById('search-input').value.toLowerCase();
  document.getElementById('rentproductContainer').scrollIntoView({behavior:'smooth'})
  let count = 0
  all_items_for_rent.forEach(product=>{
    let is_visible = product.name.toLowerCase().includes(value) || product.category.toLowerCase().includes(value);
    if(is_visible) count++;
    product.element.classList.toggle('hide',!is_visible);
  })
  if(count==0){
    alert('no Items match yous description');
    window.location.reload();
  }

})