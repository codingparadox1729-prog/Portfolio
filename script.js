/* ==========================================================================
   Rishabh Dimri Portfolio - Master Application Engine
   Engineered with JS, GSAP, Canvas Particle Math & Firebase Realtime Database
   ========================================================================== */

import { db, ref, onValue } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {

    initAOS();
    initTypingEffect();
    initMobileMenu();
    initCanvasParticles();
    initCursorGlow();
    initFirebaseProjectSync();

    function initAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                once: true,
                offset: 100,
            });
        }
    }

    function initTypingEffect() {
        const typingElement = document.getElementById('typingElement');
        if (!typingElement) return;

        const words = ["Full Stack Web Developer", "AI & ML Student", "UI/UX Freelancer", "Problem Solver"];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        }

        type();
    }

    function initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileDrawer = document.getElementById('mobileDrawer');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

        if (mobileMenuBtn && mobileDrawer) {
            mobileMenuBtn.addEventListener('click', () => {
                const isOpen = !mobileDrawer.classList.contains('pointer-events-none');
                if (isOpen) {
                    mobileDrawer.classList.add('-translate-y-full', 'opacity-0', 'pointer-events-none');
                } else {
                    mobileDrawer.classList.remove('-translate-y-full', 'opacity-0', 'pointer-events-none');
                }
            });

            mobileNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileDrawer.classList.add('-translate-y-full', 'opacity-0', 'pointer-events-none');
                });
            });
        }
    }

    function initCanvasParticles() {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let particles = [];
        const particleCount = 40;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }

            draw() {
                ctx.fillStyle = `rgba(14, 165, 233, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
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

    // Dynamic Real-time Sync for Public Site
    function initFirebaseProjectSync() {
        const projectsContainer = document.getElementById('projectsContainer');
        if (!projectsContainer) return;

        const projectsRef = ref(db, 'portfolio_projects');
        onValue(projectsRef, (snapshot) => {
            const data = snapshot.val();
            let projects = [];
            if (data) {
                projects = Array.isArray(data) ? data : Object.values(data);
            }

            renderProjects(projects, projectsContainer);
        });
    }

    function renderProjects(projects, container) {
        container.innerHTML = '';

        if (projects.length === 0) {
            container.innerHTML = `
                <div class="col-span-full glass-card p-12 rounded-3xl text-center border border-white/10">
                    <i class="fa-solid fa-folder-open text-4xl text-slate-500 mb-3"></i>
                    <h4 class="text-lg font-bold text-slate-300">No Projects Available</h4>
                    <p class="text-xs text-slate-500 mt-1">Check back soon for new portfolio updates.</p>
                </div>
            `;
            return;
        }

        projects.forEach((project, index) => {
            const image = (project.images && project.images.length > 0)
                ? project.images[0]
                : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop';

            const tagsHTML = (project.tags || []).map(tag => `
                <span class="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300">${tag}</span>
            `).join('');

            const card = document.createElement('div');
            card.className = "project-card glass-card rounded-3xl border border-white/10 overflow-hidden flex flex-col group hover:border-electric-500/50 transition-all duration-500";
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', (index * 100).toString());

            card.innerHTML = `
                <div class="relative overflow-hidden h-64 bg-dark-700">
                    <div class="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent z-10 opacity-80"></div>
                    <div class="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style="background-image: url('${image}');"></div>
                    <span class="absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-xs font-mono bg-electric-500/20 text-electric-400 border border-electric-500/30 backdrop-blur-md">
                        Featured Work
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
                            ${project.demoUrl ? `
                                <a href="${project.demoUrl}" target="_blank" class="flex-1 py-3 rounded-xl bg-electric-500 hover:bg-electric-600 text-white text-center font-medium text-sm transition-colors flex items-center justify-center gap-2">
                                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo
                                </a>
                            ` : ''}
                            ${project.githubUrl ? `
                                <a href="${project.githubUrl}" target="_blank" class="px-4 py-3 rounded-xl glass-card hover:bg-white/10 text-slate-300 hover:text-white text-sm border border-white/10 transition-colors">
                                    <i class="fa-brands fa-github text-lg"></i>
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }
});
