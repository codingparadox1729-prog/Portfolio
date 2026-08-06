/* ==========================================================================
   Rishabh Dimri Portfolio - Admin Control Engine
   Engineered with Vanilla JS, Base64 File Processing & LocalStorage Sync
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Default Admin Credentials
    const ADMIN_USER = "admin";
    const ADMIN_PASS = "rishabh123";

    // Global State Variables
    let currentImages = []; // Stores Base64 image strings for current project
    let projects = [];
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
    // 1. Authentication Engine
    // ==========================================================================

    function checkAuth() {
        const isAuthenticated = sessionStorage.getItem('portfolio_admin_auth') === 'true';
        if (isAuthenticated) {
            loginScreen.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
            loadProjects();
        } else {
            loginScreen.classList.remove('hidden');
            adminDashboard.classList.add('hidden');
        }
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = loginUsername.value.trim();
        const pass = loginPassword.value.trim();

        if (user === ADMIN_USER && pass === ADMIN_PASS) {
            sessionStorage.setItem('portfolio_admin_auth', 'true');
            showToast('Authenticated successfully!', 'success');
            checkAuth();
        } else {
            showToast('Invalid credentials! Use: admin / rishabh123', 'error');
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
    // 2. LocalStorage Data Synchronization & Initial Seed
    // ==========================================================================

    function loadProjects() {
        const savedProjects = localStorage.getItem('portfolio_projects');
        if (savedProjects) {
            try {
                projects = JSON.parse(savedProjects);
            } catch (e) {
                projects = [];
            }
        } else {
            // Seed Default Projects if empty
            projects = [
                {
                    id: 'seed-1',
                    title: 'Full-Stack AI Image Generator',
                    description: 'A cutting-edge SaaS platform integrating OpenAI DALL-E 3 API with React, Tailwind CSS, and Node.js for rapid text-to-image generation and cloud storage.',
                    tags: ['React', 'Node.js', 'OpenAI API', 'Tailwind CSS'],
                    demoUrl: 'https://example.com',
                    githubUrl: 'https://github.com/codingparadox1729',
                    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop']
                },
                {
                    id: 'seed-2',
                    title: 'E-Commerce Microservices Engine',
                    description: 'High-throughput e-commerce backend built with Node.js microservices, Redis caching, MongoDB, and Docker containers handling peak transaction traffic.',
                    tags: ['Node.js', 'Express', 'MongoDB', 'Docker', 'Redis'],
                    demoUrl: 'https://example.com',
                    githubUrl: 'https://github.com/codingparadox1729',
                    images: ['https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1200&auto=format&fit=crop']
                }
            ];
            saveProjectsToStorage();
        }
        renderProjectsList();
    }

    function saveProjectsToStorage() {
        localStorage.setItem('portfolio_projects', JSON.stringify(projects));
        if (statProjectCount) {
            statProjectCount.textContent = projects.length;
        }
    }

    // ==========================================================================
    // 3. Render Admin Projects List
    // ==========================================================================

    function renderProjectsList() {
        adminProjectsList.innerHTML = '';
        if (statProjectCount) statProjectCount.textContent = projects.length;

        if (projects.length === 0) {
            adminProjectsList.innerHTML = `
                <div class="col-span-full glass-card p-12 rounded-3xl text-center border border-white/10">
                    <i class="fa-solid fa-folder-open text-4xl text-slate-500 mb-3"></i>
                    <h4 class="text-lg font-bold text-slate-300">No Projects Found</h4>
                    <p class="text-xs text-slate-500 mt-1">Click "Add New Project" above to create your first portfolio entry.</p>
                </div>
            `;
            return;
        }

        projects.forEach((project) => {
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
                            <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-mono bg-black/60 backdrop-blur-md text-electric-400 border border-white/10">
                                ${project.images ? project.images.length : 0} image(s)
                            </span>
                        </div>
                        <h4 class="text-lg font-bold text-white mb-2">${project.title}</h4>
                        <p class="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">${project.description}</p>
                        <div class="flex flex-wrap gap-1.5 mb-2">
                            ${tagsHTML}
                        </div>
                    </div>

                    <div class="flex items-center gap-2 pt-4 border-t border-white/10">
                        <button onclick="editProject('${project.id}')" class="flex-1 py-2 rounded-xl bg-electric-500/10 hover:bg-electric-500/20 text-electric-400 border border-electric-500/20 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button onclick="promptDeleteProject('${project.id}')" class="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            adminProjectsList.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    // Expose Edit / Delete handlers globally for inline onClick
    window.editProject = function (id) {
        const project = projects.find(p => p.id === id);
        if (!project) return;

        modalTitle.textContent = "Edit Project";
        projectIdInput.value = project.id;
        projectTitleInput.value = project.title || '';
        projectDescInput.value = project.description || '';
        projectTagsInput.value = (project.tags || []).join(', ');
        projectDemoInput.value = project.demoUrl || '';
        projectGithubInput.value = project.githubUrl || '';

        currentImages = [...(project.images || [])];
        renderImagePreviews();
        updateWordCount();

        openModal();
    };

    window.promptDeleteProject = function (id) {
        pendingDeleteId = id;
        confirmModal.classList.remove('hidden');
    };

    cancelConfirmBtn.addEventListener('click', () => {
        pendingDeleteId = null;
        confirmModal.classList.add('hidden');
    });

    actionConfirmBtn.addEventListener('click', () => {
        if (pendingDeleteId) {
            projects = projects.filter(p => p.id !== pendingDeleteId);
            saveProjectsToStorage();
            renderProjectsList();
            showToast('Project deleted', 'info');
            pendingDeleteId = null;
        }
        confirmModal.classList.add('hidden');
    });

    // ==========================================================================
    // 4. Modal Engine & Form Handling
    // ==========================================================================

    function openModal() {
        projectModal.classList.remove('hidden');
    }

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
        closeModal(); // Reset form
        openModal();
    });

    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);

    // Description Word Counter
    function updateWordCount() {
        const words = projectDescInput.value.trim().split(/\s+/).filter(w => w.length > 0);
        const count = words.length;
        wordCountBadge.textContent = `${count} / 100 words`;

        if (count > 100) {
            wordCountBadge.classList.add('text-rose-400');
            wordCountBadge.classList.remove('text-slate-400');
        } else {
            wordCountBadge.classList.remove('text-rose-400');
            wordCountBadge.classList.add('text-slate-400');
        }
    }

    projectDescInput.addEventListener('input', updateWordCount);

    // ==========================================================================
    // 5. Drag and Drop Base64 Image Processing Engine
    // ==========================================================================

    dropZone.addEventListener('click', () => imageFileInput.click());

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drop-zone-active');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drop-zone-active');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    imageFileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        const fileList = Array.from(files);

        if (currentImages.length + fileList.length > 10) {
            showToast('Maximum 10 images allowed per project', 'error');
            return;
        }

        fileList.forEach(file => {
            if (!file.type.startsWith('image/')) {
                showToast('Only image files are allowed', 'error');
                return;
            }

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
                    <button type="button" onclick="removeImage(${index})" class="text-rose-400 hover:text-rose-300 text-sm p-1.5 rounded-lg bg-black/60">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
            imagePreviewContainer.appendChild(thumb);
        });
    }

    window.removeImage = function (index) {
        currentImages.splice(index, 1);
        renderImagePreviews();
    };

    // Form Submission (Add or Update Project)
    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const words = projectDescInput.value.trim().split(/\s+/).filter(w => w.length > 0);
        if (words.length > 100) {
            showToast('Project description exceeds 100 words', 'error');
            return;
        }

        const id = projectIdInput.value || 'proj_' + Date.now();
        const title = projectTitleInput.value.trim();
        const description = projectDescInput.value.trim();
        const tags = projectTagsInput.value.split(',').map(t => t.trim()).filter(t => t.length > 0);
        const demoUrl = projectDemoInput.value.trim();
        const githubUrl = projectGithubInput.value.trim();

        const newProject = {
            id,
            title,
            description,
            tags,
            demoUrl,
            githubUrl,
            images: currentImages.length > 0 ? currentImages : ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop']
        };

        const existingIndex = projects.findIndex(p => p.id === id);
        if (existingIndex > -1) {
            projects[existingIndex] = newProject;
            showToast('Project updated successfully', 'success');
        } else {
            projects.unshift(newProject);
            showToast('New project created successfully', 'success');
        }

        saveProjectsToStorage();
        renderProjectsList();
        closeModal();
    });

    // ==========================================================================
    // 6. Toast Notification Subsystem
    // ==========================================================================

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl text-xs font-mono flex items-center gap-3 pointer-events-auto ${
            type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
            type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
            'bg-electric-500/10 border-electric-500/30 text-electric-400'
        }`;

        const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info';

        toast.innerHTML = `
            <i class="fa-solid ${icon} text-sm"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 350);
        }, 3000);
    }

    // Initial Auth Verification
    checkAuth();
});
