(() => {
  const STORAGE_KEY = 'competency-library-levels-v1';
  const demoLevels = [
    { id: 'beginner', name: 'Beginner', description: 'Understands the fundamentals', status: 'active', order: 1 },
    { id: 'intermediate', name: 'Intermediate', description: 'Applies the skill with guidance', status: 'active', order: 2 },
    { id: 'advanced', name: 'Advanced', description: 'Works independently', status: 'active', order: 3 },
    { id: 'expert', name: 'Expert', description: 'Coaches others and solves complex problems', status: 'active', order: 4 }
  ];

  document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#levels-table-body');
    const searchInput = document.querySelector('#level-search');
    const statusFilter = document.querySelector('#status-filter');
    const count = document.querySelector('#level-count');
    const emptyState = document.querySelector('#empty-state');
    const dialog = document.querySelector('#level-dialog');
    const form = document.querySelector('#level-form');
    const toast = document.querySelector('#toast');
    let levels = loadLevels();
    let toastTimer;

    function loadLevels() {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(stored)) return stored;
      } catch (error) {
        console.warn('Could not load saved proficiency levels.', error);
      }
      return demoLevels.map((level) => ({ ...level }));
    }

    function persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
      } catch (error) {
        announce('Changes could not be saved in this browser.');
      }
    }

    function announce(message) {
      toast.textContent = message;
      toast.classList.add('is-visible');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2800);
    }

    function render() {
      const query = searchInput.value.trim().toLocaleLowerCase();
      const status = statusFilter.value;
      const visibleLevels = levels
        .filter((level) => status === 'all' || level.status === status)
        .filter((level) => `${level.name} ${level.description}`.toLocaleLowerCase().includes(query))
        .sort((a, b) => Number(a.order) - Number(b.order));

      tableBody.replaceChildren();
      visibleLevels.forEach((level) => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const nameWrap = document.createElement('div');
        nameWrap.className = 'level-name';
        const name = document.createElement('strong');
        name.textContent = level.name;
        const description = document.createElement('small');
        description.textContent = level.description || 'No description provided';
        nameWrap.append(name, description);
        nameCell.append(nameWrap);

        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className = `status status--${level.status}`;
        statusBadge.textContent = level.status === 'active' ? 'Active' : 'Inactive';
        statusCell.append(statusBadge);

        const orderCell = document.createElement('td');
        orderCell.textContent = String(level.order);
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions';
        actionsCell.append(
          makeAction('Edit', '✎', () => openForm(level)),
          makeAction('View', '◌', () => openView(level)),
          makeAction('Delete', '×', () => deleteLevel(level))
        );
        row.append(nameCell, statusCell, orderCell, actionsCell);
        tableBody.append(row);
      });
      count.textContent = String(levels.length);
      emptyState.hidden = visibleLevels.length > 0;
    }

    function makeAction(label, icon, callback) {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `${label} level`);
      button.title = `${label} level`;
      button.textContent = icon;
      button.addEventListener('click', callback);
      return button;
    }

    function openForm(level) {
      form.reset();
      document.querySelector('#level-id').value = level ? level.id : '';
      document.querySelector('#level-name-input').value = level ? level.name : '';
      document.querySelector('#level-description-input').value = level ? level.description : '';
      document.querySelector('#level-order-input').value = level ? level.order : levels.length + 1;
      document.querySelector('#level-status-input').value = level ? level.status : 'active';
      document.querySelector('#dialog-title').textContent = level ? 'Edit proficiency level' : 'Add proficiency level';
      document.querySelector('#save-level').textContent = level ? 'Save changes' : 'Save level';
      setFormDisabled(false);
      dialog.showModal();
      document.querySelector('#level-name-input').focus();
    }

    function openView(level) {
      form.reset();
      document.querySelector('#level-id').value = level.id;
      document.querySelector('#level-name-input').value = level.name;
      document.querySelector('#level-description-input').value = level.description;
      document.querySelector('#level-order-input').value = level.order;
      document.querySelector('#level-status-input').value = level.status;
      document.querySelector('#dialog-title').textContent = 'Proficiency level details';
      document.querySelector('#save-level').hidden = true;
      setFormDisabled(true);
      dialog.showModal();
      document.querySelector('[data-close-dialog]').focus();
    }

    function setFormDisabled(disabled) {
      form.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach((field) => { field.disabled = disabled; });
      document.querySelector('#save-level').hidden = disabled;
    }

    function deleteLevel(level) {
      if (!window.confirm(`Delete “${level.name}”? This cannot be undone.`)) return;
      levels = levels.filter((item) => item.id !== level.id);
      persist();
      render();
      announce(`${level.name} was deleted.`);
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const id = document.querySelector('#level-id').value;
      const name = document.querySelector('#level-name-input').value.trim();
      const description = document.querySelector('#level-description-input').value.trim();
      const order = Number(document.querySelector('#level-order-input').value);
      const status = document.querySelector('#level-status-input').value;
      if (levels.some((level) => level.name.toLocaleLowerCase() === name.toLocaleLowerCase() && level.id !== id)) {
        document.querySelector('#level-name-input').setCustomValidity('A level with this name already exists.');
        document.querySelector('#level-name-input').reportValidity();
        return;
      }
      document.querySelector('#level-name-input').setCustomValidity('');
      const updated = { id: id || `level-${Date.now()}`, name, description, order, status };
      levels = id ? levels.map((level) => level.id === id ? updated : level) : [...levels, updated];
      persist();
      render();
      dialog.close();
      announce(id ? `${name} was updated.` : `${name} was added.`);
    });

    document.querySelector('#add-level').addEventListener('click', () => openForm());
    document.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    searchInput.addEventListener('input', render);
    statusFilter.addEventListener('change', render);
    document.querySelector('#reset-demo').addEventListener('click', () => {
      if (!window.confirm('Reset proficiency levels to the original demo data?')) return;
      levels = demoLevels.map((level) => ({ ...level }));
      persist();
      searchInput.value = '';
      statusFilter.value = 'all';
      render();
      announce('Demo data has been reset.');
    });

    render();
  });
})();
