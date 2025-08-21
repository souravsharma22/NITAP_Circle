document.getElementById("comp-btn").addEventListener('click', function () {
  document.getElementById("raisecomplaint").style.display = 'block'; 
})

document.getElementById("closeButton").addEventListener('click', function () {
  document.getElementById("raisecomplaint").style.display = 'none'; 
})


function arrayBufferToBase64(buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}


async function loadComplaints() {
  const res = await fetch('/api/complaints');
  const complaints = await res.json();
  console.log(complaints);
  const container = document.getElementById('complaintsContainer');

  complaints.forEach(c => {
    const image = c.image ? `data:image/png;base64,${arrayBufferToBase64(c.image.data)}` : null;
    if (image) {
      imgElement = `<img src="${image}" class="card-img-top" alt="Complaint Image">`;
    } else {
      imgElement = `<div class="no-image text-center p-4 bg-light">Not Available</div>`;
    }


    const cardHTML = `
            <div class="card m-2" style="width: 18rem;">
                ${imgElement}
                <div class="card-body">
                    <h5 class="card-title">${c.title}</h5>
                    <p class="card-text">${c.description}</p>
                </div>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">Name: ${c.name}</li>
                    <li class="list-group-item">Roll No: ${c.roll_no}</li>
                    <li class="list-group-item">email: ${c.email}</li>
                    <li class="list-group-item">hostel: ${c.hostel}</li>
                    <li class="list-group-item">type: ${c.complaint_type}</li>
                </ul>
            </div>
        `;
    container.insertAdjacentHTML('beforeend', cardHTML);
  });
}
loadComplaints();