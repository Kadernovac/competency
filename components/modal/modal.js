document.addEventListener('DOMContentLoaded', () => {
  const modal = document.querySelector('.modal-backdrop');
  const openButtons = document.querySelectorAll('[data-open-modal]');
  const closeButtons = document.querySelectorAll('.modal__close, .modal__footer .btn--ghost');
  openButtons.forEach((button) => button.addEventListener('click', () => modal && modal.classList.remove('is-hidden')));
  closeButtons.forEach((button) => button.addEventListener('click', () => modal && modal.classList.add('is-hidden')));
});
