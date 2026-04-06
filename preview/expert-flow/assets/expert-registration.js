window.addEventListener('scroll', function () {
  var header = document.querySelector('.cl-header');
  if (!header) {
    return;
  }

  header.classList.toggle('cl-scroll', window.scrollY > 24);
});
