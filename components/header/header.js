document.addEventListener('DOMContentLoaded', () => {
  const menuTrigger = document.querySelector('.user-menu__trigger');
  const menuList = document.querySelector('.user-menu__list');
  if (menuTrigger && menuList) {
    menuTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      menuList.classList.toggle('is-open');
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.user-menu')) {
        menuList.classList.remove('is-open');
      }
    });
  }
});
