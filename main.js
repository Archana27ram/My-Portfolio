import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- Configuration ---
const COLORS = {
    primary: 0x00f5ff,
    secondary: 0xbf00ff,
    tertiary: 0x3a7bd5,
    bg: 0x050505
};

const PERSONAL_INFO = {
    name: "RAM ARCHANA",
    role: "Full Stack Web Developer",
    fullRole: "Web Development Trainee & Full Stack Developer"
};

// --- Three.js Background (Morphing Blob) ---
const initBackground = () => {
    const canvas = document.querySelector('#bg-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Post Processing
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.1;
    bloomPass.strength = 0.5;
    bloomPass.radius = 0.8;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Create Blob
    const geometry = new THREE.IcosahedronGeometry(2, 64);
    const material = new THREE.MeshStandardMaterial({
        color: COLORS.primary,
        metalness: 0.9,
        roughness: 0.1,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    const blob = new THREE.Mesh(geometry, material);
    scene.add(blob);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(COLORS.secondary, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(COLORS.primary, 20);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Animation variables
    const initialPositions = geometry.attributes.position.array.slice();
    let time = 0;

    // Mouse movement
    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Animation Loop
    const animate = () => {
        time += 0.01;
        
        // Morph blob
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = initialPositions[i];
            const y = initialPositions[i + 1];
            const z = initialPositions[i + 2];
            
            const noise = Math.sin(x * 1.5 + time) * 0.15 + 
                          Math.sin(y * 1.5 + time * 1.2) * 0.15 + 
                          Math.sin(z * 1.5 + time * 0.8) * 0.15;
            
            const ratio = 1 + noise;
            positions[i] = x * ratio;
            positions[i + 1] = y * ratio;
            positions[i + 2] = z * ratio;
        }
        geometry.attributes.position.needsUpdate = true;

        blob.rotation.y += 0.002;
        blob.rotation.x += 0.001;

        // Interaction
        blob.position.x += (mouseX * 0.5 - blob.position.x) * 0.05;
        blob.position.y += (-mouseY * 0.5 - blob.position.y) * 0.05;
        
        // Scroll Interaction
        const scrollY = window.scrollY;
        blob.position.z = Math.max(-2, -scrollY * 0.005);
        blob.rotation.z = scrollY * 0.001;
        
        composer.render();
        requestAnimationFrame(animate);
    };

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
};

// --- Scroll Progress ---
const updateScrollProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
        progressBar.style.width = scrollPercent + '%';
    }
};

window.addEventListener('scroll', updateScrollProgress);

// --- Typing Animation ---
const initTypingAnimation = () => {
    const nameElement = document.querySelector('#typing-name');
    const roleElement = document.querySelector('#typing-role');
    
    if (!nameElement || !roleElement) return;

    let nameText = PERSONAL_INFO.name;
    let roleText = PERSONAL_INFO.role;
    let nameIndex = 0;
    let roleIndex = 0;
    let isNameDone = false;

    const typeEffect = () => {
        if (!isNameDone) {
            if (nameIndex < nameText.length) {
                nameElement.textContent = nameText.substring(0, nameIndex + 1);
                nameIndex++;
            } else {
                isNameDone = true;
            }
        }

        if (isNameDone) {
            if (roleIndex < roleText.length) {
                roleElement.textContent = roleText.substring(0, roleIndex + 1);
                roleIndex++;
            }
        }

        if (nameIndex < nameText.length || (isNameDone && roleIndex < roleText.length)) {
            setTimeout(typeEffect, 60);
        }
    };

    typeEffect();
};

// --- Mobile Menu ---
const menuToggle = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// --- Download CV ---
const setupDownloadCV = () => {
    const downloadBtn = document.getElementById('download-cv');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const cvContent = `RAM ARCHANA - Full Stack Developer CV...`;
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(cvContent));
            element.setAttribute('download', 'RAM_ARCHANA_CV.txt');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        });
    }
};

// --- Contact Form ---
const setupContactForm = () => {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            feedback.innerHTML = '<p class="form-success">Message sent!</p>';
            form.reset();
            setTimeout(() => { feedback.innerHTML = ''; }, 3000);
        });
    }
};

// --- GSAP Animations ---
gsap.registerPlugin(ScrollTrigger);

const initGSAP = () => {
    gsap.utils.toArray('.reveal').forEach((elem) => {
        gsap.fromTo(elem, 
            { opacity: 0, y: 30 },
            {
                scrollTrigger: {
                    trigger: elem,
                    start: "top 90%",
                    toggleActions: "play none none none"
                },
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power3.out"
            }
        );
    });

    gsap.utils.toArray('.skill-fill').forEach((bar) => {
        const width = bar.style.width;
        bar.style.width = '0%';
        gsap.to(bar, {
            scrollTrigger: {
                trigger: bar,
                start: "top 90%",
            },
            width: width,
            duration: 2,
            ease: "expo.out"
        });
    });
};

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    initTypingAnimation();
    setupDownloadCV();
    setupContactForm();
    initGSAP();
    initBackground();
});

