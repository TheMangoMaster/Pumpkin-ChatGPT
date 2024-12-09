document.addEventListener('DOMContentLoaded', () => {
    // Copy Address
    window.copyToClipboard = function() {
        const address = document.getElementById("contract-address").innerText;
        navigator.clipboard.writeText(address)
            .then(() => {
                document.getElementById("copy-confirmation").style.display = "inline";
                setTimeout(() => {
                    document.getElementById("copy-confirmation").style.display = "none";
                }, 2000);
            })
            .catch(err => console.error("Copy failed", err));
    }

    // Dexscreener API Integration
    fetch('https://api.dexscreener.com/latest/dex/tokens/3J4BuoMSVQT5t6ZYRHtij1Re9NZYYLoYcb9gqkCJpump')
        .then(response => response.json())
        .then(data => {
            const price = data.pairs && data.pairs.length > 0 ? data.pairs[0].priceUsd : null;
            document.getElementById('price').innerText = price ? `$${price}` : "Data Unavailable";
        })
        .catch(error => console.error('Error fetching price:', error));

    // Hero Particle Canvas
    const heroCanvas = document.getElementById('hero-canvas');
    const heroCtx = heroCanvas.getContext('2d');

    function resizeHeroCanvas() {
        heroCanvas.width = window.innerWidth;
        heroCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeHeroCanvas);
    resizeHeroCanvas();

    let particles = [];
    class Particle {
        constructor(x, y, size, color) {
            this.x = x; this.y = y;
            this.size = size; this.color = color;
            this.speedX = Math.random()*2 - 1;
            this.speedY = Math.random()*2 - 1;
        }
        update() {
            this.x += this.speedX; 
            this.y += this.speedY;
            if(this.size > 0.3) this.size -= 0.1;
        }
        draw() {
            heroCtx.fillStyle = this.color;
            heroCtx.beginPath();
            heroCtx.arc(this.x, this.y, this.size, 0, Math.PI*2);
            heroCtx.fill();
        }
    }

    const hue = 30; 
    const color = `hsla(${hue}, 100%, 50%, 0.8)`; 

    for (let i=0; i<60; i++) {
        particles.push(new Particle(
            Math.random()*heroCanvas.width,
            Math.random()*heroCanvas.height,
            Math.random()*8+4,
            color
        ));
    }

    function animateParticles() {
        heroCtx.clearRect(0,0,heroCanvas.width, heroCanvas.height);
        for(let i=particles.length-1; i>=0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].size <= 0.3) {
                particles.splice(i,1);
            }
        }
        requestAnimationFrame(animateParticles);
    }

    window.addEventListener('mousemove',(e)=>{
        for(let i=0; i<2; i++) {
            particles.push(new Particle(
                e.clientX,
                e.clientY,
                Math.random()*6+3,
                color
            ));
        }
    });

    animateParticles();

    // Three.js main hero object
    const threeCanvas = document.getElementById('three-canvas');
    const renderer = new THREE.WebGLRenderer({canvas: threeCanvas, alpha:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.1,1000);
    camera.position.z = 5;

    const textureLoader = new THREE.TextureLoader();
    const coinFaceTexture = textureLoader.load('Images/Background.jpg', function(){
        coinFaceTexture.encoding = THREE.sRGBEncoding;
        coinFaceTexture.needsUpdate = true;
    });

    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0xd6a56b,
        metalness:0.3,
        roughness:0.5
    });
    const faceMaterial = new THREE.MeshStandardMaterial({
        map: coinFaceTexture,
        metalness:0.2,
        roughness:0.5,
        side: THREE.DoubleSide
    });

    faceMaterial.map.wrapS = THREE.RepeatWrapping;
    faceMaterial.map.wrapT = THREE.RepeatWrapping;
    faceMaterial.map.center.set(0.5, 0.5);
    faceMaterial.map.rotation = Math.PI / 2;  

    const coinGeo = new THREE.CylinderGeometry(1,1,0.1,64,1,false);
    coinGeo.groups[0].materialIndex = 0; 
    coinGeo.groups[1].materialIndex = 1; 
    coinGeo.groups[2].materialIndex = 2; 

    const coin = new THREE.Mesh(coinGeo, [rimMaterial, faceMaterial, faceMaterial]);
    coin.rotation.set(0,0,0);
    scene.add(coin);

    const ambientLight = new THREE.AmbientLight(0xffffff,0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff,1);
    pointLight.position.set(2,2,2);
    scene.add(pointLight);

    function animateHero3D() {
        requestAnimationFrame(animateHero3D);
        coin.rotation.x += 0.01; 
        renderer.render(scene, camera);
    }
    animateHero3D();

    window.addEventListener('resize',()=>{
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
    });

    // Smooth Scroll
    const exploreBtn = document.getElementById('explore-btn');
    if(exploreBtn) {
        exploreBtn.addEventListener('click', ()=>{
            const target = document.querySelector('#about');
            if(target) target.scrollIntoView({ behavior:'smooth', block:'start'});
        });
    }

    document.querySelectorAll('.sticky-navbar a').forEach(link=>{
        link.addEventListener('click',(e)=>{
            e.preventDefault();
            const href = link.getAttribute('href');
            const target = document.querySelector(href);
            if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
        });
    });

    // Hide copy confirmation initially
    document.getElementById("copy-confirmation").style.display = "none";

    // GSAP Animations
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section').forEach(sec => {
        gsap.fromTo(sec, 
            {opacity:0, y:50}, 
            {
                opacity:1, y:0, 
                duration:1, 
                scrollTrigger: {
                    trigger: sec,
                    start:"top 80%"
                }
            }
        );
    });

    // Container 3D Scene
    const containerCanvas = document.getElementById('container-3d-canvas');
    const containerRenderer = new THREE.WebGLRenderer({canvas:containerCanvas, alpha:true});
    function resizeContainerCanvas() {
        const width = containerCanvas.clientWidth;
        const height = width / 2; // maintain aspect ratio
        containerRenderer.setSize(width, height);
        containerCamera.aspect = width/height;
        containerCamera.updateProjectionMatrix();
    }

    const containerScene = new THREE.Scene();
    const containerCamera = new THREE.PerspectiveCamera(50, containerCanvas.clientWidth/(containerCanvas.clientWidth/2), 0.1, 1000);
    containerCamera.position.z = 5;

    const contAmbient = new THREE.AmbientLight(0xffffff,0.5);
    containerScene.add(contAmbient);
    const contPoint = new THREE.PointLight(0xffffff,1);
    contPoint.position.set(1,1,2);
    containerScene.add(contPoint);

    const orbitGroup = new THREE.Group();
    for (let i=0; i<5; i++){
        const smallCoin = new THREE.Mesh(coinGeo, [rimMaterial, faceMaterial, faceMaterial]);
        smallCoin.scale.set(0.5,0.5,0.5);
        smallCoin.rotation.x = -Math.PI / 2; 
        const angle = (Math.PI*2*i)/5;
        const radius = 1.5;
        smallCoin.position.set(Math.cos(angle)*radius, Math.sin(angle)*radius, 0);
        orbitGroup.add(smallCoin);
    }
    containerScene.add(orbitGroup);

    function animateContainer3D() {
        requestAnimationFrame(animateContainer3D);
        orbitGroup.rotation.z += 0.01;
        orbitGroup.children.forEach(c => c.rotation.x += 0.02);
        containerRenderer.render(containerScene, containerCamera);
    }

    window.addEventListener('resize', resizeContainerCanvas);
    resizeContainerCanvas();
    animateContainer3D();
});
