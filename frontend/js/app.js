// =====================================================================
// Research Opportunity Portal - Application UI Logic
// Vanilla JavaScript with Bootstrap 5 Components
// =====================================================================

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------
  // DOM Elements
  // -------------------------------------------------------------------
  const opportunitiesContainer = document.getElementById('opportunitiesContainer');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const emptyState = document.getElementById('emptyState');
  const emptyStateMessage = document.getElementById('emptyStateMessage');
  const opportunityCount = document.getElementById('opportunityCount');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const btnResetFilters = document.getElementById('btnResetFilters');
  const inlineAlertContainer = document.getElementById('inlineAlertContainer');
  const toastContainer = document.getElementById('toastContainer');

  // Modal Instances
  const opportunityModalEl = document.getElementById('opportunityModal');
  const opportunityModal = new bootstrap.Modal(opportunityModalEl);
  const detailModalEl = document.getElementById('detailModal');
  const detailModal = new bootstrap.Modal(detailModalEl);
  const deleteConfirmModalEl = document.getElementById('deleteConfirmModal');
  const deleteConfirmModal = new bootstrap.Modal(deleteConfirmModalEl);

  // Form Elements
  const opportunityForm = document.getElementById('opportunityForm');
  const opportunityModalLabel = document.getElementById('opportunityModalLabel');
  const opportunityIdInput = document.getElementById('opportunityId');
  const formTitle = document.getElementById('formTitle');
  const formResearchArea = document.getElementById('formResearchArea');
  const formFacultyName = document.getElementById('formFacultyName');
  const formDepartment = document.getElementById('formDepartment');
  const formPositions = document.getElementById('formPositions');
  const formDeadline = document.getElementById('formDeadline');
  const formStatus = document.getElementById('formStatus');
  const statusFieldContainer = document.getElementById('statusFieldContainer');
  const formSkills = document.getElementById('formSkills');
  const formDescription = document.getElementById('formDescription');
  const modalAlert = document.getElementById('modalAlert');
  const btnSaveOpportunity = document.getElementById('btnSaveOpportunity');
  const saveSpinner = document.getElementById('saveSpinner');
  const saveButtonText = document.getElementById('saveButtonText');

  // Detail Modal Elements
  const detailTitle = document.getElementById('detailTitle');
  const detailStatusBadge = document.getElementById('detailStatusBadge');
  const detailFaculty = document.getElementById('detailFaculty');
  const detailDepartment = document.getElementById('detailDepartment');
  const detailResearchArea = document.getElementById('detailResearchArea');
  const detailPositions = document.getElementById('detailPositions');
  const detailDeadline = document.getElementById('detailDeadline');
  const detailSkillsContainer = document.getElementById('detailSkillsContainer');
  const detailDescription = document.getElementById('detailDescription');
  const detailCreatedAt = document.getElementById('detailCreatedAt');
  const detailUpdatedAt = document.getElementById('detailUpdatedAt');
  const btnDetailEdit = document.getElementById('btnDetailEdit');
  const btnDetailCloseOpp = document.getElementById('btnDetailCloseOpp');
  const btnDetailDelete = document.getElementById('btnDetailDelete');

  // Delete Modal Elements
  const deleteOpportunityTitle = document.getElementById('deleteOpportunityTitle');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');
  const deleteSpinner = document.getElementById('deleteSpinner');

  // Navigation Buttons
  const btnOpenCreateModal = document.getElementById('btnOpenCreateModal');
  const btnEmptyCreate = document.getElementById('btnEmptyCreate');

  // Application State
  let opportunitiesList = [];
  let currentDetailOpportunity = null;
  let opportunityIdPendingDelete = null;
  let searchDebounceTimeout = null;

  // -------------------------------------------------------------------
  // Helper Utilities: XSS Prevention & Escaping
  // -------------------------------------------------------------------
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Display dynamic Bootstrap Toast notifications
   */
  function showToast(message, type = 'success') {
    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success text-white' : 'bg-danger text-white';
    const iconClass = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-octagon-fill';

    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center">
            <i class="bi ${iconClass} fs-5 me-2"></i>
            <div>${escapeHTML(message)}</div>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastElement, { delay: 4500 });
    bsToast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  }

  /**
   * Display inline alert banner on the page
   */
  function showInlineAlert(message, type = 'danger') {
    inlineAlertContainer.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
        <i class="bi bi-info-circle-fill me-2"></i>
        <span>${escapeHTML(message)}</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }

  function clearInlineAlert() {
    inlineAlertContainer.innerHTML = '';
  }

  // -------------------------------------------------------------------
  // Data Fetching & Rendering
  // -------------------------------------------------------------------
  async function loadOpportunities() {
    clearInlineAlert();
    loadingSpinner.classList.remove('d-none');
    emptyState.classList.add('d-none');
    opportunitiesContainer.classList.add('d-none');

    try {
      const search = searchInput.value.trim();
      const status = statusFilter.value;
      const result = await OpportunityAPI.getAll({ search, status });

      opportunitiesList = result.data || [];
      opportunityCount.textContent = opportunitiesList.length;

      renderOpportunities(opportunitiesList);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
      showInlineAlert(error.message || 'Error communicating with database backend server', 'danger');
      opportunityCount.textContent = '0';
      opportunitiesContainer.innerHTML = '';
      opportunitiesContainer.classList.add('d-none');
    } finally {
      loadingSpinner.classList.add('d-none');
    }
  }

  /**
   * Render list of opportunity cards dynamically
   */
  function renderOpportunities(list) {
    if (!list || list.length === 0) {
      opportunitiesContainer.innerHTML = '';
      opportunitiesContainer.classList.add('d-none');
      emptyState.classList.remove('d-none');

      const isFiltered = searchInput.value.trim() !== '' || statusFilter.value !== 'All';
      emptyStateMessage.textContent = isFiltered
        ? 'No research opportunities match your specified search keywords or status filter.'
        : 'There are currently no research opportunities posted. Click "Post Opportunity" to create one.';
      return;
    }

    emptyState.classList.add('d-none');
    opportunitiesContainer.classList.remove('d-none');
    opportunitiesContainer.innerHTML = '';

    list.forEach(opp => {
      const cardCol = document.createElement('div');
      cardCol.className = 'col-12 col-md-6 col-lg-4';

      const isOpen = opp.status === 'Open';
      const statusBadgeClass = isOpen ? 'badge-open' : 'badge-closed';
      const statusIcon = isOpen ? 'bi-check-circle' : 'bi-dash-circle';

      // Parse skills into badges
      const skillsArray = (opp.required_skills || '')
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .slice(0, 4); // show up to first 4 on card preview

      // Create card container safely using DOM elements and textContent
      const card = document.createElement('div');
      card.className = 'opportunity-card';

      // Card Header / Top Bar
      const headerDiv = document.createElement('div');
      headerDiv.className = 'd-flex justify-content-between align-items-center p-3 pb-0';

      const areaBadge = document.createElement('span');
      areaBadge.className = 'badge text-bg-light border text-truncate';
      areaBadge.style.maxWidth = '65%';
      areaBadge.textContent = opp.research_area;
      headerDiv.appendChild(areaBadge);

      const statusBadge = document.createElement('span');
      statusBadge.className = `card-badge-status ${statusBadgeClass}`;
      statusBadge.innerHTML = `<i class="bi ${statusIcon} me-1"></i>${escapeHTML(opp.status)}`;
      headerDiv.appendChild(statusBadge);

      card.appendChild(headerDiv);

      // Card Body
      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'card-body';

      const titleLink = document.createElement('a');
      titleLink.href = '#';
      titleLink.className = 'card-title-link mb-3';
      titleLink.textContent = opp.title;
      titleLink.addEventListener('click', (e) => {
        e.preventDefault();
        openDetailModal(opp.id);
      });
      bodyDiv.appendChild(titleLink);

      // Metadata: Faculty
      const metaFaculty = document.createElement('div');
      metaFaculty.className = 'card-meta-item';
      metaFaculty.innerHTML = `<i class="bi bi-person-fill card-meta-icon text-primary"></i><span class="text-truncate">${escapeHTML(opp.faculty_name)}</span>`;
      bodyDiv.appendChild(metaFaculty);

      // Metadata: Department
      const metaDept = document.createElement('div');
      metaDept.className = 'card-meta-item';
      metaDept.innerHTML = `<i class="bi bi-building card-meta-icon text-secondary"></i><span class="text-truncate">${escapeHTML(opp.department)}</span>`;
      bodyDiv.appendChild(metaDept);

      // Metadata: Positions & Deadline in a two-column row
      const metaRow = document.createElement('div');
      metaRow.className = 'row g-1 my-2 py-2 border-top border-bottom bg-light rounded text-center small';
      metaRow.innerHTML = `
        <div class="col-6 border-end">
          <span class="text-muted d-block" style="font-size:0.75rem;">Positions</span>
          <span class="fw-bold text-dark">${escapeHTML(opp.available_positions)}</span>
        </div>
        <div class="col-6">
          <span class="text-muted d-block" style="font-size:0.75rem;">Deadline</span>
          <span class="fw-bold text-dark">${escapeHTML(opp.application_deadline)}</span>
        </div>
      `;
      bodyDiv.appendChild(metaRow);

      // Skills Pill container
      const skillsContainer = document.createElement('div');
      skillsContainer.className = 'skills-pill-container';
      skillsArray.forEach(skill => {
        const pill = document.createElement('span');
        pill.className = 'skill-pill';
        pill.textContent = skill;
        skillsContainer.appendChild(pill);
      });
      bodyDiv.appendChild(skillsContainer);

      card.appendChild(bodyDiv);

      // Card Footer with Actions
      const footerDiv = document.createElement('div');
      footerDiv.className = 'card-footer d-flex justify-content-between align-items-center gap-1';

      // View Button
      const btnView = document.createElement('button');
      btnView.className = 'btn btn-sm btn-outline-primary';
      btnView.innerHTML = '<i class="bi bi-eye"></i> View';
      btnView.addEventListener('click', () => openDetailModal(opp.id));
      footerDiv.appendChild(btnView);

      // Edit Button
      const btnEdit = document.createElement('button');
      btnEdit.className = 'btn btn-sm btn-outline-secondary';
      btnEdit.innerHTML = '<i class="bi bi-pencil"></i> Edit';
      btnEdit.addEventListener('click', () => openEditModal(opp));
      footerDiv.appendChild(btnEdit);

      // One-click Close Button
      const btnClose = document.createElement('button');
      if (isOpen) {
        btnClose.className = 'btn btn-sm btn-outline-warning text-dark';
        btnClose.innerHTML = '<i class="bi bi-slash-circle"></i> Close';
        btnClose.title = 'Mark opportunity as Closed';
        btnClose.addEventListener('click', () => handleCloseOpportunity(opp.id));
      } else {
        btnClose.className = 'btn btn-sm btn-light text-muted border-0';
        btnClose.innerHTML = '<i class="bi bi-check-all"></i> Closed';
        btnClose.disabled = true;
        btnClose.title = 'Opportunity is already closed';
      }
      footerDiv.appendChild(btnClose);

      // Delete Button
      const btnDelete = document.createElement('button');
      btnDelete.className = 'btn btn-sm btn-outline-danger';
      btnDelete.innerHTML = '<i class="bi bi-trash3"></i>';
      btnDelete.title = 'Delete opportunity';
      btnDelete.addEventListener('click', () => openDeleteConfirmModal(opp.id, opp.title));
      footerDiv.appendChild(btnDelete);

      card.appendChild(footerDiv);
      cardCol.appendChild(card);
      opportunitiesContainer.appendChild(cardCol);
    });
  }

  // -------------------------------------------------------------------
  // Detail Modal Actions
  // -------------------------------------------------------------------
  async function openDetailModal(id) {
    try {
      const response = await OpportunityAPI.getById(id);
      const opp = response.data;
      currentDetailOpportunity = opp;

      detailTitle.textContent = opp.title;
      detailFaculty.textContent = opp.faculty_name;
      detailDepartment.textContent = opp.department;
      detailResearchArea.textContent = opp.research_area;
      detailPositions.textContent = `${opp.available_positions} ${opp.available_positions > 1 ? 'Positions' : 'Position'}`;
      detailDeadline.textContent = opp.application_deadline;
      detailDescription.textContent = opp.description;
      detailCreatedAt.textContent = new Date(opp.created_at).toLocaleString();
      detailUpdatedAt.textContent = new Date(opp.updated_at).toLocaleString();

      const isOpen = opp.status === 'Open';
      detailStatusBadge.className = `badge fs-6 ${isOpen ? 'bg-success' : 'bg-danger'}`;
      detailStatusBadge.textContent = opp.status;

      // Close Opportunity button state in detail modal
      if (isOpen) {
        btnDetailCloseOpp.classList.remove('d-none');
      } else {
        btnDetailCloseOpp.classList.add('d-none');
      }

      // Populate skills
      detailSkillsContainer.innerHTML = '';
      const skills = (opp.required_skills || '').split(',').map(s => s.trim()).filter(Boolean);
      skills.forEach(skill => {
        const pill = document.createElement('span');
        pill.className = 'badge bg-light text-dark border p-2';
        pill.textContent = skill;
        detailSkillsContainer.appendChild(pill);
      });

      detailModal.show();
    } catch (error) {
      showToast(error.message || 'Failed to load opportunity details', 'danger');
    }
  }

  // Bind Actions inside Detail Modal
  btnDetailEdit.addEventListener('click', () => {
    if (currentDetailOpportunity) {
      detailModal.hide();
      openEditModal(currentDetailOpportunity);
    }
  });

  btnDetailCloseOpp.addEventListener('click', async () => {
    if (currentDetailOpportunity) {
      detailModal.hide();
      await handleCloseOpportunity(currentDetailOpportunity.id);
    }
  });

  btnDetailDelete.addEventListener('click', () => {
    if (currentDetailOpportunity) {
      detailModal.hide();
      openDeleteConfirmModal(currentDetailOpportunity.id, currentDetailOpportunity.title);
    }
  });

  // -------------------------------------------------------------------
  // Client-Side Validation
  // -------------------------------------------------------------------
  function resetFormValidation() {
    opportunityForm.querySelectorAll('.form-control, .form-select').forEach(el => {
      el.classList.remove('is-invalid');
    });
    modalAlert.classList.add('d-none');
    modalAlert.innerHTML = '';
  }

  function validateClientForm() {
    resetFormValidation();
    let isValid = true;

    // Title validation
    if (!formTitle.value.trim()) {
      formTitle.classList.add('is-invalid');
      document.getElementById('formTitleFeedback').textContent = 'Title is required.';
      isValid = false;
    } else if (formTitle.value.trim().length > 255) {
      formTitle.classList.add('is-invalid');
      document.getElementById('formTitleFeedback').textContent = 'Title cannot exceed 255 characters.';
      isValid = false;
    }

    // Research Area validation
    if (!formResearchArea.value.trim()) {
      formResearchArea.classList.add('is-invalid');
      document.getElementById('formResearchAreaFeedback').textContent = 'Research area is required.';
      isValid = false;
    }

    // Faculty Name validation
    if (!formFacultyName.value.trim()) {
      formFacultyName.classList.add('is-invalid');
      document.getElementById('formFacultyNameFeedback').textContent = 'Faculty supervisor name is required.';
      isValid = false;
    }

    // Department validation
    if (!formDepartment.value.trim()) {
      formDepartment.classList.add('is-invalid');
      document.getElementById('formDepartmentFeedback').textContent = 'Department is required.';
      isValid = false;
    }

    // Positions validation (integer >= 1)
    const posVal = Number(formPositions.value);
    if (!formPositions.value || !Number.isInteger(posVal) || posVal < 1) {
      formPositions.classList.add('is-invalid');
      document.getElementById('formPositionsFeedback').textContent = 'Available positions must be an integer >= 1.';
      isValid = false;
    }

    // Deadline validation
    if (!formDeadline.value) {
      formDeadline.classList.add('is-invalid');
      document.getElementById('formDeadlineFeedback').textContent = 'Deadline date is required.';
      isValid = false;
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formDeadline.value)) {
        formDeadline.classList.add('is-invalid');
        document.getElementById('formDeadlineFeedback').textContent = 'Deadline must be formatted as YYYY-MM-DD.';
        isValid = false;
      }
    }

    // Skills validation
    if (!formSkills.value.trim()) {
      formSkills.classList.add('is-invalid');
      document.getElementById('formSkillsFeedback').textContent = 'Required skills are required.';
      isValid = false;
    }

    // Description validation
    if (!formDescription.value.trim()) {
      formDescription.classList.add('is-invalid');
      document.getElementById('formDescriptionFeedback').textContent = 'Project description is required.';
      isValid = false;
    }

    return isValid;
  }

  // -------------------------------------------------------------------
  // Create / Edit Modal Management
  // -------------------------------------------------------------------
  function openCreateModal() {
    opportunityForm.reset();
    resetFormValidation();
    opportunityIdInput.value = '';
    opportunityModalLabel.innerHTML = '<i class="bi bi-file-earmark-plus text-primary me-2"></i>Post New Opportunity';
    saveButtonText.textContent = 'Post Opportunity';
    formStatus.value = 'Open';
    statusFieldContainer.classList.add('d-none'); // Default to Open on create
    opportunityModal.show();
  }

  function openEditModal(opp) {
    resetFormValidation();
    opportunityIdInput.value = opp.id;
    opportunityModalLabel.innerHTML = '<i class="bi bi-pencil-square text-primary me-2"></i>Edit Research Opportunity';
    saveButtonText.textContent = 'Save Changes';

    formTitle.value = opp.title || '';
    formResearchArea.value = opp.research_area || '';
    formFacultyName.value = opp.faculty_name || '';
    formDepartment.value = opp.department || '';
    formPositions.value = opp.available_positions || 1;
    formDeadline.value = opp.application_deadline || '';
    formStatus.value = opp.status || 'Open';
    formSkills.value = opp.required_skills || '';
    formDescription.value = opp.description || '';

    statusFieldContainer.classList.remove('d-none');
    opportunityModal.show();
  }

  // Save (Create or Update) handler
  btnSaveOpportunity.addEventListener('click', async () => {
    if (!validateClientForm()) {
      return;
    }

    const isEdit = Boolean(opportunityIdInput.value);
    const id = opportunityIdInput.value;

    const payload = {
      title: formTitle.value.trim(),
      research_area: formResearchArea.value.trim(),
      faculty_name: formFacultyName.value.trim(),
      department: formDepartment.value.trim(),
      available_positions: parseInt(formPositions.value, 10),
      application_deadline: formDeadline.value,
      required_skills: formSkills.value.trim(),
      description: formDescription.value.trim(),
      status: formStatus.value
    };

    // Toggle button loading state
    saveSpinner.classList.remove('d-none');
    btnSaveOpportunity.disabled = true;
    modalAlert.classList.add('d-none');

    try {
      if (isEdit) {
        await OpportunityAPI.update(id, payload);
        showToast('Research opportunity updated successfully!', 'success');
      } else {
        await OpportunityAPI.create(payload);
        showToast('New research opportunity published successfully!', 'success');
      }

      opportunityModal.hide();
      await loadOpportunities();
    } catch (error) {
      console.error('Save failed:', error);
      let errorMsg = error.message || 'Operation failed.';
      if (error.errors && error.errors.length > 0) {
        errorMsg += ' ' + error.errors.join(' | ');
      }
      modalAlert.textContent = errorMsg;
      modalAlert.classList.remove('d-none');
    } finally {
      saveSpinner.classList.add('d-none');
      btnSaveOpportunity.disabled = false;
    }
  });

  // -------------------------------------------------------------------
  // One-Click "Close" Action
  // -------------------------------------------------------------------
  async function handleCloseOpportunity(id) {
    try {
      await OpportunityAPI.close(id);
      showToast('Opportunity has been marked as Closed.', 'success');
      await loadOpportunities();
    } catch (error) {
      showToast(error.message || 'Failed to close opportunity', 'danger');
    }
  }

  // -------------------------------------------------------------------
  // Delete Modal & Confirmation
  // -------------------------------------------------------------------
  function openDeleteConfirmModal(id, title) {
    opportunityIdPendingDelete = id;
    deleteOpportunityTitle.textContent = title;
    deleteConfirmModal.show();
  }

  btnConfirmDelete.addEventListener('click', async () => {
    if (!opportunityIdPendingDelete) return;

    deleteSpinner.classList.remove('d-none');
    btnConfirmDelete.disabled = true;

    try {
      await OpportunityAPI.delete(opportunityIdPendingDelete);
      showToast('Research opportunity deleted successfully.', 'success');
      deleteConfirmModal.hide();
      opportunityIdPendingDelete = null;
      await loadOpportunities();
    } catch (error) {
      showToast(error.message || 'Failed to delete opportunity', 'danger');
    } finally {
      deleteSpinner.classList.add('d-none');
      btnConfirmDelete.disabled = false;
    }
  });

  // -------------------------------------------------------------------
  // Search & Filtering Event Listeners
  // -------------------------------------------------------------------
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(() => {
      loadOpportunities();
    }, 300);
  });

  statusFilter.addEventListener('change', () => {
    loadOpportunities();
  });

  btnResetFilters.addEventListener('click', () => {
    searchInput.value = '';
    statusFilter.value = 'All';
    loadOpportunities();
  });

  // Modal open triggers
  btnOpenCreateModal.addEventListener('click', openCreateModal);
  btnEmptyCreate.addEventListener('click', openCreateModal);

  // Initial Data Load
  loadOpportunities();
});
