document.addEventListener('DOMContentLoaded', () => {
  const navItem = document.querySelector('.nav-item');
  if (navItem) {
    navItem.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('nav-item--active'));
      navItem.classList.add('nav-item--active');
    });
  }
});
