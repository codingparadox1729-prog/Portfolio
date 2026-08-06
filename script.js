/* ==========================================================================
   Rishabh Dimri Portfolio - Master Application Engine with Firebase Realtime Sync
   ========================================================================== */

import { database, ref, onValue } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
    initAOS();
    initTypingEffect();
    initParticleCanvas();
    initCursorGlow();
    initMobileMenu();
    initNavbarScroll();
    initContactForm();
    initRealtimeProjects();
});

/* ==========================================================================
   1. Realtime Firebase Projects Renderer
   ========================================================================== */
function initRealtimeProjects() {
    const projectsContainer = document.getElementById('projectsContainer');
    const counterProjects = document.getElementById('counterProjects');
    if (!projectsContainer) return;

    // Create Firebase reference
    const projectsRef = ref(database, 'projects');

    // Subscribe to live database updates across all connected clients
    onValue(projectsRef, (snapshot) => {
        const data = snapshot.val();
        projectsContainer.innerHTML = '';

        if (!data) {
            if (counterProjects) counterProjects.textContent = '0';
            projectsContainer.innerHTML = `
                <div class="col-span-full glass-card p-12 rounded-3xl text-center border border-white/10">
                    <i class="fa-solid fa-folder-open text-4xl text-slate-500 mb-3"></i>
                    <h4 class="text-lg font-bold text-slate-300">No Projects Published Yet</h4>
                    <p class="text-xs text-slate-500 mt-1">Check back later or add projects from the Admin Portal.</p>
                </div>
            `;
            return;
        }

        // Convert key-value object to array
        const projectList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));

        if (counterProjects) {
            counterProjects.textContent = projectList.length;
        }

        projectList.forEach((project, index) => {
            const thumbnail = (project.images && project.images.length > 0)
                ? project.images[0]
                : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop';

            const tagsHTML = (project.tags || [])
                .map(t => `<span class="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300">${t}</span>`)
                .join('');

            const cardHTML = `
                <div data-aos="fade-up" data-aos-delay="${index * 100}" class="project-card glass-card rounded-3xl border border-white/10 overflow-hidden flex flex-col group hover:border-electric-500/50 transition-all duration-500">
                    <div class="relative overflow-hidden h-64 bg-dark-700">
                        <div class="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent z-10 opacity-80"></div>
                        <div class="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style="background-image: url('${thumbnail}')"></div>
                        <span class="absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-xs font-mono bg-electric-500/20 text-electric-400 border border-electric-500/30 backdrop-blur-md">
                            ${project.tags && project.tags[0] ? project.tags[0] : 'Project'}
                        </span>
                    </div>
                    <div class="p-8 flex-1 flex flex-col justify-between">
                        <div>
                            <h4 class="text-2xl font-bold text-white mb-3 group-hover:text-electric-400 transition-colors">${project.title}</h4>
                            <p class="text-slate-300 text-sm leading-relaxed mb-6">${project.description}</p>
                        </div>
                        <div>
                            <div class="flex flex-wrap gap-2 mb-6">
                                ${tagsHTML}
                            </div>
                            <div class="flex items-center gap-4 pt-4 border-t border-white/10">
                                ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" class="flex-1 py-3 rounded-xl bg-electric-500 hover:bg-electric-600 text-white text-center font-medium text-sm transition-colors flex items-center justify-center gap-2"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo</a>` : ''}
                                ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="px-4 py-3 rounded-xl glass-card hover:bg-white/10 text-slate-300 hover:text-white text-sm border border-white/10 transition-colors"><i class="fa-brands fa-github text-lg"></i></a>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            projectsContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    });
}

/* ==========================================================================
   2. Interactive Subsystems (AOS, Canvas, Typing, Nav)
   ========================================================================== */
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 80 });
    }
}

function initTypingEffect() {
    const typingElement = document.getElementById('typingElement');
    if (!typingElement) return;

    const phrases = [
        "Web Development Freelancer",
        "B.Tech CSE (AI & ML) Student",
        "Full Stack Web Developer",
        "UI/UX Motion Enthusiast"
    ];

    let phraseIndex = 0, charIndex = 0, isDeleting = false;

    function type() {
        const currentPhrase = phrases[phraseIndex];
        typingElement.textContent = isDeleting 
            ? currentPhrase.substring(0, charIndex--) 
            : currentPhrase.substring(0, charIndex++);

        let delay = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentPhrase.length + 1) {
            delay = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            delay = 500;
        }

        setTimeout(type, delay);
    }
    type();
}

function initParticleCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let particles = Array.from({ length: 40 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 1.8 + 0.8
    }));

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(14, 165, 233, 0.4)';
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

function initCursorGlow() {
    const cursorGlow = document.getElementById('cursorGlow');
    if (!cursorGlow) return;
    window.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
    });
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    if (!mobileMenuBtn || !mobileDrawer) return;

    mobileMenuBtn.addEventListener('click', () => {
        mobileDrawer.classList.toggle('-translate-y-full');
        mobileDrawer.classList.toggle('opacity-0');
        mobileDrawer.classList.toggle('pointer-events-none');
    });
}

function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar?.classList.add('backdrop-blur-xl', 'bg-dark-900/80');
        } else {
            navbar?.classList.remove('backdrop-blur-xl', 'bg-dark-900/80');
        }
    });
}

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you! Your message has been sent successfully.');
        contactForm.reset();
    });
}
