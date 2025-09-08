
//found item form display and closing
document.getElementById("FoundItem-form").addEventListener('click', function () {
    document.getElementById("form-found").style.display = 'block';
});

document.getElementById("closeButtonfound").addEventListener('click', function () {
    document.getElementById("form-found").style.display = 'none';
});

// lost -item request form displaying and hiding

document.getElementById("LostItems-form").addEventListener('click', function () {
    document.getElementById("form-lost").style.display = 'block';
});

document.getElementById("closeButtonlost").addEventListener('click', function () {
    document.getElementById("form-lost").style.display = 'none';
});
//image handelling 
function arrayBufferToBase64(buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

let found_req = [];

//loading the items that are listed as found
async function loadFoundItems() {
    const res = await fetch('/api/found_Items');
    if(!res.ok){
        console.log("Errrrororororor")
    }
    const products = await res.json();
    // console.log(products);
    const container = document.getElementById('found-items-container');
    if (products.length == 0) container.innerHTML = '<h1 style="text-align:center"> No Listed items</h1>';


    found_req=products.map(c => {
        const image = c.image ? `data:image/png;base64,${arrayBufferToBase64(c.image.data)}` : null;
        if (image) {
            imgElement = `<img src="${image}" class="card-img-top" alt="Complaint Image">`;
        } else {
            imgElement = `<div class="no-image text-center p-4 bg-light">Not Available</div>`;
        }

        const cardHTML = `
  <div class="card m-2 shadow-sm" style="min-width:fitContent; flex: 1;">
      ${imgElement}
      <div class="card-body">
          <h5 class="card-title text-truncate">${c.name}</h5>
          <p class="card-text small">${c.description}</p>
      </div>
      <ul class="list-group list-group-flush">
          <li class="list-group-item"><strong>Found by:</strong> ${c.username}</li>
          <li class="list-group-item"><strong>Email:</strong> ${c.email}</li>
          <li class="list-group-item"><strong>Found on :</strong> ${c.found_date}</li>
          <li class="list-group-item"><strong>Found at:</strong> ${c.location}</li>
          <li class="list-group-item"><strong>Category:</strong> ${c.category}</li>
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

        return { name: c.name, category: c.category, element: wrapper };

    });
}
loadFoundItems();

lost_req =[];

 async function loadLostItems() {
    const res = await fetch('/api/lost_Items');
    if(!res.ok){
        console.log("Errrrororororor")
    }
    const products = await res.json();
    // console.log(products);
    const container = document.getElementById('lost-items-container');
    if (products.length == 0) container.innerHTML = '<h1 style="text-align:center"> No lost request </h1>';


    lost_req = products.map(c => {
        const image = c.image ? `data:image/png;base64,${arrayBufferToBase64(c.image.data)}` : null;
        if (image) {
            imgElement = `<img src="${image}" class="card-img-top" alt="Complaint Image">`;
        } else {
            imgElement = `<div class="no-image text-center p-4 bg-light">Not Available</div>`;
        }

        const cardHTML = `
  <div class="card m-2 shadow-sm" style="min-width:fitContent; flex: 1;">
      ${imgElement}
      <div class="card-body">
          <h5 class="card-title text-truncate">${c.name}</h5>
          <p class="card-text small">${c.description}</p>
      </div>
      <ul class="list-group list-group-flush">
          <li class="list-group-item"><strong>Owner:</strong> ${c.username}</li>
          <li class="list-group-item"><strong>Email:</strong> ${c.email}</li>
          <li class="list-group-item"><strong>Lost on :</strong> ${c.lost_date} ${c.lost_time}</li>
          <li class="list-group-item"><strong>Lost at:</strong> ${c.location}</li>
          <li class="list-group-item"><strong>Category:</strong> ${c.category}</li>
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

        return { name: c.name, category: c.category, element: wrapper };
    });
}
loadLostItems();
document.getElementById("lost-items").addEventListener('click', function(){
    document.getElementById('found-items-container').style.display = 'none';
    document.getElementById('lost-items-container').style.display = 'flex';
})

document.getElementById("found-items").addEventListener('click', function(){
    document.getElementById('lost-items-container').style.display = 'none';
    document.getElementById('found-items-container').style.display = 'flex';
})


const serachbtn = document.getElementById("search-btn");
serachbtn.addEventListener('click', (e)=>{
    e.preventDefault();
    const value = document.getElementById('search-input').value.toLowerCase();
    // alert(value);
    let count=0;
    document.getElementById('found-section').scrollIntoView({behaviour:'smooth'})
    found_req.forEach(item=>{
        const is_visible = item.name.toLowerCase().includes(value) || item.category.toLowerCase().includes(value);
        if(is_visible) count++;
        item.element.classList.toggle('hide', !is_visible);
    })
    lost_req.forEach(item=>{
        const is_visible = item.name.toLowerCase().includes(value) || item.category.toLowerCase().includes(value);
        if(is_visible) count++;
        item.element.classList.toggle('hide', !is_visible);
    })

    if(count==0){
        alert("no items found realted to your serach")
        window.location.reload();
    }
})