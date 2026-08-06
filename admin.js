/* ==========================================================================
   Rishabh Dimri Portfolio - Admin Control Engine with Firebase Synchronization
   ========================================================================== */

import { database, ref, set, push, onValue, remove, update } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {

    const ADMIN_USER = "admin";
    const ADMIN_PASS = "rishabh123";

    let currentImages = [];
    let projectsMap = {};
    let pendingDeleteId = null;

    // DOM Elements
    const loginScreen = document.getElementById('loginScreen');
    const adminDashboard = document.getElementById('adminDashboard');
    const loginForm = document.getElementById('loginForm');
    const loginUsername = document.getElementById('loginUsername');
    const loginPassword = document.getElementById('loginPassword');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const passwordEyeIcon = document.getElementById('passwordEyeIcon');
    const logoutBtn = document.getElementById('logoutBtn');

    const adminProjectsList = document.getElementById('adminProjectsList');
    const statProjectCount = document.getElementById('statProjectCount');

    const projectModal = document.getElementById('projectModal');
    const openAddModalBtn = document.getElementById('openAddModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const projectForm = document.getElementById('projectForm');

    const modalTitle = document.getElementById('modalTitle');
    const projectIdInput = document.getElementById('projectId');
    const projectTitleInput = document.getElementById('projectTitleInput');
    const projectDescInput = document.getElementById('projectDescInput');
    const wordCountBadge = document.getElementById('wordCountBadge');
    const projectTagsInput = document.getElementById('projectTagsInput');
    const projectDemoInput = document.getElementById('projectDemoInput');
    const projectGithubInput = document.getElementById('projectGithubInput');

    const dropZone = document.getElementById('dropZone');
    const imageFileInput = document.getElementById('imageFileInput');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');

    const confirmModal = document.getElementById('confirmModal');
    const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
    const actionConfirmBtn = document.getElementById('actionConfirmBtn');
    const toastContainer = document.getElementById('toastContainer');

    // ==========================================================================
    // 1. Authentication Check
    // ==========================================================================
    function checkAuth() {
        const isAuthenticated = sessionStorage.getItem('portfolio_admin_auth') === 'true';
        if (isAuthenticated) {
            loginScreen.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
            bindFirebaseProjects();
        } else {
            loginScreen.classList.remove('hidden');
            adminDashboard.classList.add('hidden');
        }
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (loginUsername.value.trim() === ADMIN_USER && loginPassword.value.trim() === ADMIN_PASS) {
            sessionStorage.setItem('portfolio_admin_auth', 'true');
            showToast('Authenticated successfully!', 'success');
            checkAuth();
        } else {
            showToast('Invalid credentials!', 'error');
        }
    });

    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = loginPassword.type === 'password';
        loginPassword.type = isPassword ? 'text' : 'password';
        passwordEyeIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('portfolio_admin_auth');
        showToast('Logged out successfully', 'info');
        checkAuth();
    });

    // ==========================================================================
    // 2. Realtime Firebase Subscription
    // ==========================================================================
    function bindFirebaseProjects() {
        const projectsRef = ref(database, 'projects');

        onValue(projectsRef, (snapshot) => {
            projectsMap = snapshot.val() || {};
            renderProjectsList();
        });
    }

    function renderProjectsList() {
        adminProjectsList.innerHTML = '';
        const keys = Object.keys(projectsMap);
        if (statProjectCount) statProjectCount.textContent = keys.length;

        if (keys.length === 0) {
            adminProjectsList.innerHTML = `
                <div class="col-span-full glass-card p-12 rounded-3xl text-center border border-white/10">
                    <i class="fa-solid fa-folder-open text-4xl text-slate-500 mb-3"></i>
                    <h4 class="text-lg font-bold text-slate-300">No Projects Found</h4>
                    <p class="text-xs text-slate-500 mt-1">Click "Add New Project" above to create your first portfolio entry.</p>
                </div>
            `;
            return;
        }

        keys.forEach((key) => {
            const project = projectsMap[key];
            const thumbnail = (project.images && project.images.length > 0)
                ? project.images[0]
                : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop';

            const tagsHTML = (project.tags || [])
                .map(t => `<span class="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">${t}</span>`)
                .join('');

            const cardHTML = `
                <div class="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between gap-4 relative group">
                    <div>
                        <div class="aspect-video w-full rounded-xl overflow-hidden mb-4 border border-white/10 bg-dark-700 relative">
                            <img src="${thumbnail}" alt="${project.title}" class="w-full h-full object-cover">
                        </div>
                        <h4 class="text-lg font-bold text-white mb-2">${project.title}</h4>
                        <p class="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">${project.description}</p>
                        <div class="flex flex-wrap gap-1.5 mb-2">${tagsHTML}</div>
                    </div>

                    <div class="flex items-center gap-2 pt-4 border-t border-white/10">
                        <button data-id="${key}" class="edit-btn flex-1 py-2 rounded-xl bg-electric-500/10 hover:bg-electric-500/20 text-electric-400 border border-electric-500/20 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button data-id="${key}" class="delete-btn py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            adminProjectsList.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Event listener delegation for dynamically generated buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => editProject(e.currentTarget.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => promptDeleteProject(e.currentTarget.dataset.id));
        });
    }

    // Edit and Delete handlers
    function editProject(id) {
        const project = projectsMap[id];
        if (!project) return;

        modalTitle.textContent = "Edit Project";
        projectIdInput.value = id;
        projectTitleInput.value = project.title || '';
        projectDescInput.value = project.description || '';
        projectTagsInput.value = (project.tags || []).join(', ');
        projectDemoInput.value = project.demoUrl || '';
        projectGithubInput.value = project.githubUrl || '';

        currentImages = [...(project.images || [])];
        renderImagePreviews();
        updateWordCount();
        openModal();
    }

    function promptDeleteProject(id) {
        pendingDeleteId = id;
        confirmModal.classList.remove('hidden');
    }

    cancelConfirmBtn.addEventListener('click', () => {
        pendingDeleteId = null;
        confirmModal.classList.add('hidden');
    });

    actionConfirmBtn.addEventListener('click', () => {
        if (pendingDeleteId) {
            // Delete project from Firebase Realtime DB
            const projectRef = ref(database, `projects/${pendingDeleteId}`);
            remove(projectRef)
                .then(() => showToast('Project deleted globally', 'info'))
                .catch((err) => showToast('Error deleting: ' + err.message, 'error'));
            pendingDeleteId = null;
        }
        confirmModal.classList.add('hidden');
    });

    // ==========================================================================
    // 3. Modal & Form Controls
    // ==========================================================================
    function openModal() { projectModal.classList.remove('hidden'); }
    function closeModal() {
        projectModal.classList.add('hidden');
        projectForm.reset();
        projectIdInput.value = '';
        currentImages = [];
        renderImagePreviews();
        updateWordCount();
    }

    openAddModalBtn.addEventListener('click', () => {
        modalTitle.textContent = "Add New Project";
        closeModal();
        openModal();
    });

    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);

    function updateWordCount() {
        const words = projectDescInput.value.trim().split(/\s+/).filter(w => w.length > 0);
        wordCountBadge.textContent = `${words.length} / 100 words`;
    }
    projectDescInput.addEventListener('input', updateWordCount);

    // Image Upload Handler
    dropZone.addEventListener('click', () => imageFileInput.click());
    imageFileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                currentImages.push(e.target.result);
                renderImagePreviews();
            };
            reader.readAsDataURL(file);
        });
    }

    function renderImagePreviews() {
        imagePreviewContainer.innerHTML = '';
        currentImages.forEach((imgSrc, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'preview-thumb';
            thumb.style.backgroundImage = `url('${imgSrc}')`;
            thumb.innerHTML = `
                <div class="remove-overlay">
                    <button type="button" class="remove-img-btn text-rose-400 text-sm p-1.5 bg-black/60 rounded-lg" data-index="${index}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
            imagePreviewContainer.appendChild(thumb);
        });

        document.querySelectorAll('.remove-img-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index);
                currentImages.splice(idx, 1);
                renderImagePreviews();
            });
        });
    }

    // Form Submit (Write to Firebase)
    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = projectIdInput.value;
        const projectData = {
            title: projectTitleInput.value.trim(),
            description: projectDescInput.value.trim(),
            tags: projectTagsInput.value.split(',').map(t => t.trim()).filter(t => t.length > 0),
            demoUrl: projectDemoInput.value.trim(),
            githubUrl: projectGithubInput.value.trim(),
            images: currentImages.length > 0 ? currentImages : ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop']
        };

        if (id) {
            // Update existing entry
            const projectRef = ref(database, `projects/${id}`);
            update(projectRef, projectData)
                .then(() => showToast('Project updated across all devices!', 'success'))
                .catch(err => showToast('Update failed: ' + err.message, 'error'));
        } else {
            // Push new entry
            const projectsListRef = ref(database, 'projects');
            const newProjectRef = push(projectsListRef);
            set(newProjectRef, projectData)
                .then(() => showToast('Project created & synced globally!', 'success'))
                .catch(err => showToast('Creation failed: ' + err.message, 'error'));
        }

        closeModal();
    });

    // Toast Engine
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl text-xs font-mono flex items-center gap-3 pointer-events-auto ${
            type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
            type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
            'bg-electric-500/10 border-electric-500/30 text-electric-400'
        }`;
        toast.innerHTML = `<span>${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    checkAuth();
});
