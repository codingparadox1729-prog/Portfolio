/* ==========================================================================
   Rishabh Dimri Portfolio - Master Application Engine
   Engineered with Vanilla JS, GSAP, Canvas Particle Math & Dynamic LocalStorage
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize All Subsystems
    initAOS();
    initTypingEffect();
    initParticleCanvas();
    initCursorGlow();
    initMobileMenu();
    initNavbarScroll();
    initButtonRipples();
    initDynamicProjects();
    initContactForm();
    initCounters();
});

/* ==========================================================================
   1. AOS (Animate On Scroll) Initialization
   ========================================================================== */
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 80,
            disable: window.innerWidth < 768
        });
    }
}

/* ==========================================================================
   2. Typing Effect Engine
   ========================================================================== */
function initTypingEffect() {
    const typingElement = document.getElementById('typingElement');
    if (!typingElement) return;

    const phrases = [
        "Web Development Freelancer",
        "B.Tech CSE (AI & ML) Student",
        "Full Stack Web Developer",
        "UI/UX Motion Enthusiast",
        "Problem Solver & Tech Creator"
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingDelay = 100;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingDelay = 50;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingDelay = 100;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            typingDelay = 2000; // Pause at top
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingDelay = 500;
        }

        setTimeout(type, typingDelay);
    }

    type();
}

/* ==========================================================================
   3. Interactive Particle Background Canvas
   ========================================================================== */
function initParticleCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 20), 60);

    const mouse = {
        x: null,
        y: null,
        radius: 150
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        createParticles();
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.radius = Math.random() * 1.8 + 0.8;
            this.color = Math.random() > 0.5 ? 'rgba(14, 165, 233, ' : 'rgba(168, 85, 247, ';
            this.alpha = Math.random() * 0.5 + 0.2;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            ctx.fill();
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse proximity interaction
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const angle = Math.atan2(dy, dx);
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= Math.cos(angle) * force * 2;
                    this.y -= Math.sin(angle) * force * 2;
                }
            }

            this.draw();
        }
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    const opacity = (1 - distance / 120) * 0.15;
                    ctx.strokeStyle = `rgba(14, 165, 233, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((particle) => particle.update());
        connectParticles();
        requestAnimationFrame(animate);
    }

    createParticles();
    animate();
}

/* ==========================================================================
   4. Smooth Cursor Glow Follower
   ========================================================================== */
function initCursorGlow() {
    const cursorGlow = document.getElementById('cursorGlow');
    if (!cursorGlow || window.innerWidth < 1024) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function renderCursor() {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;

        cursorGlow.style.left = `${currentX}px`;
        cursorGlow.style.top = `${currentY}px`;

        requestAnimationFrame(renderCursor);
    }

    renderCursor();
}

/* ==========================================================================
   5. Mobile Navigation Drawer Controller
   ========================================================================== */
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const drawer = document.getElementById('mobileDrawer');
    const links = document.querySelectorAll('.mobile-nav-link');

    if (!btn || !drawer) return;

    let isOpen = false;

    function toggleMenu() {
        isOpen = !isOpen;
        if (isOpen) {
            drawer.classList.remove('-translate-y-full', 'opacity-0', 'pointer-events-none');
            drawer.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
            btn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        } else {
            drawer.classList.add('-translate-y-full', 'opacity-0', 'pointer-events-none');
            drawer.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
            btn.innerHTML = '<i class="fa-solid fa-bars-staggered"></i>';
        }
    }

    btn.addEventListener('click', toggleMenu);

    links.forEach((link) => {
        link.addEventListener('click', () => {
            if (isOpen) toggleMenu();
        });
    });
}

/* ==========================================================================
   6. Dynamic Active Navbar & Glass Transition
   ========================================================================== */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        // Sticky shadow boost on scroll
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-2xl', 'shadow-black/50');
        } else {
            navbar.classList.remove('shadow-2xl', 'shadow-black/50');
        }

        // Active Link Highlight
        let currentSection = '';
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove('text-electric-400', 'active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('text-electric-400', 'active');
            }
        });
    });
}

/* ==========================================================================
   7. Button Click Micro-Ripple Effect
   ========================================================================== */
function initButtonRipples() {
    const buttons = document.querySelectorAll('button, .btn-ripple');

    buttons.forEach((button) => {
        button.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

/* ==========================================================================
   8. Dynamic Projects Engine (LocalStorage Reader with Fallback)
   ========================================================================== */
function initDynamicProjects() {
    const container = document.getElementById('projectsContainer');
    if (!container) return;

    const savedProjects = localStorage.getItem('portfolio_projects');
    
    if (!savedProjects) {
        // Keep default HTML static cards if no local storage exists yet
        return;
    }

    try {
        const projects = JSON.parse(savedProjects);
        if (!Array.isArray(projects) || projects.length === 0) return;

        // Update Counter
        const counterProjects = document.getElementById('counterProjects');
        if (counterProjects) {
            counterProjects.textContent = projects.length;
        }

        container.innerHTML = ''; // Clear fallback content

        projects.forEach((project, index) => {
            const mainImg = (project.images && project.images.length > 0) 
                ? project.images[0] 
                : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop';

            const tagsHTML = (project.tags || [])
                .map((tag) => `<span class="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300">${tag.trim()}</span>`)
                .join('');

            const cardHTML = `
                <div data-aos="fade-up" data-aos-delay="${(index % 2) * 150}" class="project-card glass-card rounded-3xl border border-white/10 overflow-hidden flex flex-col group hover:border-electric-500/50 transition-all duration-500">
                    <div class="relative overflow-hidden h-64 bg-dark-700">
                        <div class="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent z-10 opacity-80"></div>
                        <div class="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style="background-image: url('${mainImg}');"></div>
                        <span class="absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-xs font-mono bg-electric-500/20 text-electric-400 border border-electric-500/30 backdrop-blur-md">
                            Featured Project #${index + 1}
                        </span>
                    </div>
                    <div class="p-8 flex-1 flex flex-col justify-between">
                        <div>
                            <h4 class="text-2xl font-bold text-white mb-3 group-hover:text-electric-400 transition-colors">${project.title || 'Untitled Project'}</h4>
                            <p class="text-slate-300 text-sm leading-relaxed mb-6">
                                ${project.description || 'No description provided.'}
                            </p>
                        </div>
                        <div>
                            <div class="flex flex-wrap gap-2 mb-6">
                                ${tagsHTML}
                            </div>
                            <div class="flex items-center gap-4 pt-4 border-t border-white/10">
                                <a href="${project.demoUrl || '#'}" target="_blank" class="flex-1 py-3 rounded-xl bg-electric-500 hover:bg-electric-600 text-white text-center font-medium text-sm transition-colors flex items-center justify-center gap-2">
                                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo
                                </a>
                                <a href="${project.githubUrl || 'https://github.com/codingparadox1729'}" target="_blank" class="px-4 py-3 rounded-xl glass-card hover:bg-white/10 text-slate-300 hover:text-white text-sm border border-white/10 transition-colors">
                                    <i class="fa-brands fa-github text-lg"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (e) {
        console.error("Error loading projects from LocalStorage:", e);
    }
}

/* ==========================================================================
   9. Interactive Contact Form Submission
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const subject = document.getElementById('contactSubject').value.trim() || 'Portfolio Inquiry';
        const message = document.getElementById('contactMessage').value.trim();

        if (!name || !email || !message) {
            alert('Please fill out all required fields.');
            return;
        }

        // Generate mailto link for direct submission
        const mailtoBody = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
        const mailtoUrl = `mailto:codingparadox1729@gmail.com?subject=${encodeURIComponent(subject)}&body=${mailtoBody}`;

        window.open(mailtoUrl, '_blank');

        // Display Success Feedback
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> Message Sent!`;
        submitBtn.classList.remove('from-electric-500', 'to-neon-purple');
        submitBtn.classList.add('bg-emerald-600');

        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.classList.add('from-electric-500', 'to-neon-purple');
            submitBtn.classList.remove('bg-emerald-600');
            form.reset();
        }, 3000);
    });
}

/* ==========================================================================
   10. Animated Counter Engine
   ========================================================================== */
function initCounters() {
    const counters = document.querySelectorAll('[id^="counter"]');
    
    counters.forEach(counter => {
        const target = +counter.innerText;
        if (isNaN(target)) return;

        let count = 0;
        const speed = 200; // Increment duration modifier
        const inc = target / speed;

        function updateCount() {
            count += inc;
            if (count < target) {
                counter.innerText = Math.ceil(count);
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target;
            }
        }

        updateCount();
    });
}
