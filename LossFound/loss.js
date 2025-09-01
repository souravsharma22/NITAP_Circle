//found item form display and closing
document.getElementById("FoundItem-form").addEventListener('click', function () {
  document.getElementById("form-found").style.display = 'block';
});

document.getElementById("closeButtonfound").addEventListener('click', function(){
    document.getElementById("form-found").style.display = 'none';
});

// lost -item request form displaying and hiding

document.getElementById("LostItems-form").addEventListener('click', function(){
    document.getElementById("form-lost").style.display = 'block';
});

document.getElementById("closeButtonlost").addEventListener('click', function(){
    document.getElementById("form-lost").style.display = 'none';
});

