import { db } from "./firebase.js";
import { 
    collection, 
    getDocs, 
    doc, 
    setDoc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Global state
let projects = [];
let editingProjectId = null;
let pendingDeleteId = null;

// DOM Elements
const projectForm = document.getElementById('projectForm');
const formTitle = document.getElementById('formTitle');
const submitBtnText = document.getElementById('submitBtnText');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const projectsList = document.getElementById('projectsList');
const confirmModal = document.getElementById('confirmModal');
const actionConfirmBtn = document.getElementById('actionConfirmBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');

// Toast Notification System
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColors = {
        success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        error: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        info: 'bg-electric-500/10 border-electric-500/20 text-electric-400'
    };

    toast.className = `p-4 rounded-xl border backdrop-blur-md transition-all duration-300 flex items-center justify-between shadow-lg mb-3 ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="text-sm font-medium">${message}</span>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-4');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 1. Fetch projects from Firestore
async function loadProjects() {
    projects = [];
    try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        querySnapshot.forEach((docSnap) => {
            projects.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderProjectsList();
    } catch (error) {
        console.error("Error fetching projects from Firestore: ", error);
        showToast("Error loading projects from database", "error");
    }
}

// 2. Render Projects in Admin Table
function renderProjectsList() {
    if (!projectsList) return;

    if (projects.length === 0) {
        projectsList.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-8 text-center text-slate-400">
                    No projects found. Add your first project above!
                </td>
            </tr>
        `;
        return;
    }

    projectsList.innerHTML = projects.map(project => `
        <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            <td class="px-6 py-4">
                <div class="font-medium text-white">${project.title || 'Untitled Project'}</div>
                <div class="text-xs text-slate-400 truncate max-w-xs">${project.description || ''}</div>
            </td>
            <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                    ${(project.tags || []).map(tag => `
                        <span class="px-2 py-0.5 text-xs rounded bg-white/5 border border-white/10 text-slate-300">${tag}</span>
                    `).join('')}
                </div>
            </td>
            <td class="px-6 py-4 text-xs font-mono text-slate-400">
                ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" class="text-electric-400 hover:underline">Demo</a>` : ''}
                ${project.demoUrl && project.githubUrl ? ' | ' : ''}
                ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="text-slate-300 hover:underline">GitHub</a>` : ''}
            </td>
            <td class="px-6 py-4 text-right space-x-2">
                <button onclick="editProject('${project.id}')" class="p-2 text-slate-400 hover:text-white transition-colors">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onclick="promptDelete('${project.id}')" class="p-2 text-rose-400 hover:text-rose-300 transition-colors">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 3. Form Submit Handler (Save / Update Firestore Document)
if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('projectTitle').value.trim();
        const description = document.getElementById('projectDescription').value.trim();
        const demoUrl = document.getElementById('demoUrl').value.trim();
        const githubUrl = document.getElementById('githubUrl').value.trim();
        const tagsInput = document.getElementById('projectTags').value.trim();
        const imagesInput = document.getElementById('projectImages').value.trim();

        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [];
        const images = imagesInput ? imagesInput.split(',').map(i => i.trim()).filter(Boolean) : [];

        const projectId = editingProjectId || 'proj_' + Date.now();

        const projectData = {
            id: projectId,
            title,
            description,
            demoUrl,
            githubUrl,
            tags,
            images,
            updatedAt: new Date().toISOString()
        };

        try {
            // Save to Firestore
            await setDoc(doc(db, "projects", projectId), projectData);

            showToast(editingProjectId ? 'Project updated successfully!' : 'Project added successfully!', 'success');
            resetForm();
            await loadProjects();
        } catch (error) {
            console.error("Error saving project: ", error);
            showToast('Failed to save project to Firestore', 'error');
        }
    });
}

// 4. Edit Project Setup
window.editProject = function(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    editingProjectId = id;
    document.getElementById('projectTitle').value = project.title || '';
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('demoUrl').value = project.demoUrl || '';
    document.getElementById('githubUrl').value = project.githubUrl || '';
    document.getElementById('projectTags').value = (project.tags || []).join(', ');
    document.getElementById('projectImages').value = (project.images || []).join(', ');

    if (formTitle) formTitle.textContent = 'Edit Project';
    if (submitBtnText) submitBtnText.textContent = 'Update Project';
    if (cancelEditBtn) cancelEditBtn.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Reset Form Function
function resetForm() {
    editingProjectId = null;
    if (projectForm) projectForm.reset();
    if (formTitle) formTitle.textContent = 'Add New Project';
    if (submitBtnText) submitBtnText.textContent = 'Save Project';
    if (cancelEditBtn) cancelEditBtn.classList.add('hidden');
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', resetForm);
}

// 5. Delete Project Modal & Firestore Delete Action
window.promptDelete = function(id) {
    pendingDeleteId = id;
    if (confirmModal) confirmModal.classList.remove('hidden');
};

if (cancelModalBtn) {
    cancelModalBtn.addEventListener('click', () => {
        pendingDeleteId = null;
        if (confirmModal) confirmModal.classList.add('hidden');
    });
}

if (actionConfirmBtn) {
    actionConfirmBtn.addEventListener('click', async () => {
        if (pendingDeleteId) {
            try {
                // Delete document from Firestore
                await deleteDoc(doc(db, "projects", pendingDeleteId));
                showToast('Project deleted successfully', 'info');
                await loadProjects();
            } catch (error) {
                console.error("Error deleting project: ", error);
                showToast('Failed to delete project', 'error');
            }
            pendingDeleteId = null;
        }
        if (confirmModal) confirmModal.classList.add('hidden');
    });
}

// Initial Load
loadProjects();
