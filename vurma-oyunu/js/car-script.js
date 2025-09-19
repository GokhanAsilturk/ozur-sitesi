// Car Escape Game Variables
// Oyun müziği
const gameMusic = document.getElementById('gameMusic');
let musicEnabled = false;

// Müziği ilk kullanıcı etkileşiminde hazırla
function prepareMusicForGame() {
    if (!musicEnabled) {
        gameMusic.volume = 0;
        gameMusic.play().then(() => {
            gameMusic.pause();
            gameMusic.currentTime = 0;
            gameMusic.volume = 0.5;
            musicEnabled = true;
            console.log('Müzik sistemi hazırlandı');
        }).catch(e => {
            console.log('Müzik hazırlanamadı:', e);
        });
    }
}

let gameState = {
    isRunning: false,
    isPaused: false,
    score: 0,
    highScore: localStorage.getItem('carGameHighScore') || 0,
    speed: 0,
    distance: 0,
    timeElapsed: 0,
    gameStartTime: 0
};

let playerPosition = {
    x: 0, // -1 (sol), 0 (orta), 1 (sağ)
    y: 80 // bottom position - daha öne
};

let gameSettings = {
    baseSpeed: 1.5,
    maxSpeed: 5,
    acceleration: 0.008,
    trafficSpawnRate: 0.015,
    chaserSpeed: 0.6,
    roadLanes: [-1, 0, 1] // sol, orta, sağ
};

// Game Elements
const gameArea = document.getElementById('gameArea');
const playerCar = document.getElementById('playerCar');
const chaserGokhan = document.getElementById('chaserGokhan');
const trafficContainer = document.getElementById('trafficContainer');
const crashEffect = document.getElementById('crashEffect');

// UI Elements
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetCarGame');
const speedDisplay = document.getElementById('speedDisplay');
const distanceDisplay = document.getElementById('distanceDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameStatusDisplay = document.getElementById('gameStatus');

// Game Arrays
let trafficCars = [];
let keysPressed = {};

// Initialize Game
function initGame() {
    updateDisplays();
    setupEventListeners();
    updateHighScoreDisplay();
}

function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Mobile controls
    setupMobileControls();
    
    console.log('Araba kaçış oyunu hazır! 🚗💨');
}

function setupMobileControls() {
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    
    // Touch and mouse events for mobile buttons
    if (upBtn) {
        upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keysPressed['w'] = true; });
        upBtn.addEventListener('touchend', (e) => { e.preventDefault(); keysPressed['w'] = false; });
        upBtn.addEventListener('mousedown', (e) => { e.preventDefault(); keysPressed['w'] = true; });
        upBtn.addEventListener('mouseup', (e) => { e.preventDefault(); keysPressed['w'] = false; });
    }
    
    if (downBtn) {
        downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keysPressed['s'] = true; });
        downBtn.addEventListener('touchend', (e) => { e.preventDefault(); keysPressed['s'] = false; });
        downBtn.addEventListener('mousedown', (e) => { e.preventDefault(); keysPressed['s'] = true; });
        downBtn.addEventListener('mouseup', (e) => { e.preventDefault(); keysPressed['s'] = false; });
    }
    
    if (leftBtn) {
        leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keysPressed['a'] = true; });
        leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); keysPressed['a'] = false; });
        leftBtn.addEventListener('mousedown', (e) => { e.preventDefault(); keysPressed['a'] = true; });
        leftBtn.addEventListener('mouseup', (e) => { e.preventDefault(); keysPressed['a'] = false; });
    }
    
    if (rightBtn) {
        rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keysPressed['d'] = true; });
        rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); keysPressed['d'] = false; });
        rightBtn.addEventListener('mousedown', (e) => { e.preventDefault(); keysPressed['d'] = true; });
        rightBtn.addEventListener('mouseup', (e) => { e.preventDefault(); keysPressed['d'] = false; });
    }
}

function handleKeyDown(e) {
    if (!gameState.isRunning) return;
    
    keysPressed[e.key.toLowerCase()] = true;
    
    // Prevent default behavior for game keys
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
}

function handleKeyUp(e) {
    keysPressed[e.key.toLowerCase()] = false;
}

function startGame() {
    if (gameState.isRunning) return;
    
    // Oyun müziğini başlat (daha agresif yaklaşım)
    console.log('Müzik başlatılmaya çalışılıyor...');
    
    gameMusic.currentTime = 0;
    gameMusic.volume = 0.5;
    
    // Promise tabanlı müzik başlatma
    const playPromise = gameMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log('Müzik başarıyla başlatıldı!');
        }).catch(error => {
            console.error('Müzik başlatılamadı:', error.message);
            console.log('Lütfen tarayıcınızın ses ayarlarını kontrol edin');
        });
    }
    
    gameState.isRunning = true;
    gameState.score = 0;
    gameState.speed = gameSettings.baseSpeed;
    gameState.distance = 0;
    gameState.timeElapsed = 0;
    gameState.gameStartTime = Date.now();
    
    playerPosition.x = 0;
    playerPosition.y = 80;
    
    trafficCars = [];
    trafficContainer.innerHTML = '';
    
    startBtn.disabled = true;
    startBtn.textContent = 'OYUN BAŞLADI! 🏃‍♂️';
    
    updateGameStatus('Kaçıyor! 🚗💨');
    
    updatePlayerPosition();
    gameLoop();
    
    console.log('Oyun başladı! Gökhan\'dan kaç! 🚗💨');
}

function gameLoop() {
    if (!gameState.isRunning) return;
    
    // Update game time
    gameState.timeElapsed = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
    
    // Handle player movement
    updatePlayerMovement();
    
    // Update game speed (gradually increase)
    gameState.speed = Math.min(gameSettings.maxSpeed, gameSettings.baseSpeed + gameState.timeElapsed * gameSettings.acceleration);
    
    // Update distance
    gameState.distance += gameState.speed;
    
    // Update score (based on distance and time survived)
    gameState.score = Math.floor(gameState.distance / 10) + gameState.timeElapsed * 2;
    
    // Spawn traffic
    if (Math.random() < gameSettings.trafficSpawnRate * (1 + gameState.speed / 10)) {
        spawnTrafficCar();
    }
    
    // Update traffic cars
    updateTrafficCars();
    
    // Update chaser Gokhan
    updateChaser();
    
    // Check collisions
    checkCollisions();
    
    // Update displays
    updateDisplays();
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

function updatePlayerMovement() {
    const moveSpeed = 0.15; // Daha hızlı hareket
    
    // Horizontal movement (A/D or Arrow Left/Right)
    if (keysPressed['a'] || keysPressed['arrowleft']) {
        playerPosition.x = Math.max(-1, playerPosition.x - moveSpeed);
    }
    if (keysPressed['d'] || keysPressed['arrowright']) {
        playerPosition.x = Math.min(1, playerPosition.x + moveSpeed);
    }
    
    // Vertical movement (W/S or Arrow Up/Down) - daha geniş alan
    if (keysPressed['w'] || keysPressed['arrowup']) {
        playerPosition.y = Math.min(120, playerPosition.y + moveSpeed * 25); // Daha yukarı çıkabilir
    }
    if (keysPressed['s'] || keysPressed['arrowdown']) {
        playerPosition.y = Math.max(40, playerPosition.y - moveSpeed * 25); // Daha aşağı inebilir
    }
    
    updatePlayerPosition();
}

function updatePlayerPosition() {
    // Daha geniş hareket alanı - lane'ler arası mesafe artırıldı
    const positions = {
        '-1': '30%',  // Sol lane - daha sol
        '0': '50%',   // Orta lane  
        '1': '70%'    // Sağ lane - daha sağ
    };
    
    const leftPercentage = positions[playerPosition.x.toString()] || '50%';
    
    playerCar.style.left = leftPercentage;
    playerCar.style.transform = 'translateX(-50%)'; // Merkezle
    playerCar.style.bottom = `${playerPosition.y}px`;
}

function spawnTrafficCar() {
    const car = document.createElement('div');
    car.className = 'traffic-car';
    
    // Random car emoji and color
    const carTypes = [
        {emoji: '🚙', class: 'blue'},
        {emoji: '🚗', class: 'red'},
        {emoji: '🚕', class: 'yellow'},
        {emoji: '🚐', class: 'green'}
    ];
    
    const carType = carTypes[Math.floor(Math.random() * carTypes.length)];
    car.textContent = carType.emoji;
    car.classList.add(carType.class);
    
    // Random lane
    const lane = gameSettings.roadLanes[Math.floor(Math.random() * gameSettings.roadLanes.length)];
    
    // Daha geniş hareket alanı
    const positions = {
        '-1': '30%',  // Sol lane - daha sol
        '0': '50%',   // Orta lane  
        '1': '70%'    // Sağ lane - daha sağ
    };
    
    const leftPercentage = positions[lane.toString()];
    
    car.style.left = leftPercentage;
    car.style.transform = 'translateX(-50%)';
    car.style.top = '-60px';
    
    // Add to game
    trafficContainer.appendChild(car);
    trafficCars.push({
        element: car,
        lane: lane,
        y: -60,
        speed: gameState.speed + Math.random() * 1 // Daha yavaş trafik
    });
}

function updateTrafficCars() {
    for (let i = trafficCars.length - 1; i >= 0; i--) {
        const car = trafficCars[i];
        car.y += car.speed;
        car.element.style.top = `${car.y}px`;
        
        // Remove cars that are off screen
        if (car.y > gameArea.offsetHeight + 60) {
            car.element.remove();
            trafficCars.splice(i, 1);
        }
    }
}

function updateChaser() {
    // Gökhan tries to follow player with some delay from behind
    const positions = {
        '-1': '30%',  // Sol lane - daha sol
        '0': '50%',   // Orta lane  
        '1': '70%'    // Sağ lane - daha sağ
    };
    
    const targetPosition = positions[playerPosition.x.toString()] || '50%';
    
    // Daha yavaş takip
    const currentLeft = chaserGokhan.style.left || '50%';
    const targetLeftNumeric = parseFloat(targetPosition);
    const currentLeftNumeric = parseFloat(currentLeft);
    const newLeftNumeric = currentLeftNumeric + (targetLeftNumeric - currentLeftNumeric) * 0.015; // Daha yavaş
    
    chaserGokhan.style.left = `${newLeftNumeric}%`;
    chaserGokhan.style.transform = 'translateX(-50%)';
    
    // Gökhan daha yavaş yaklaşıyor
    const timeBasedApproach = Math.min(gameState.timeElapsed * 0.3, 30); // Daha yavaş, daha az yaklaşma
    const newBottom = -50 + timeBasedApproach;
    chaserGokhan.style.bottom = `${newBottom}px`;
}

function checkCollisions() {
    const playerRect = getElementBounds(playerCar);
    
    // Check collision with traffic cars
    for (let i = 0; i < trafficCars.length; i++) {
        const trafficRect = getElementBounds(trafficCars[i].element);
        
        if (isColliding(playerRect, trafficRect)) {
            crashGame('Arabaya çarptın! 💥');
            return;
        }
    }
    
    // Check if caught by Gökhan
    const chaserRect = getElementBounds(chaserGokhan);
    if (isColliding(playerRect, chaserRect)) {
        crashGame('Gökhan seni yakaladı! 😡');
        return;
    }
}

function getElementBounds(element) {
    const rect = element.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();
    
    return {
        left: rect.left - gameRect.left,
        right: rect.right - gameRect.left,
        top: rect.top - gameRect.top,
        bottom: rect.bottom - gameRect.top
    };
}

function isColliding(rect1, rect2) {
    return !(rect1.right < rect2.left + 10 || 
             rect1.left > rect2.right - 10 || 
             rect1.bottom < rect2.top + 10 || 
             rect1.top > rect2.bottom - 10);
}

function crashGame(reason) {
    gameState.isRunning = false;
    
    // Oyun müziğini durdur
    gameMusic.pause();
    gameMusic.currentTime = 0;
    
    // Add crash effect
    playerCar.classList.add('crashed');
    crashEffect.style.display = 'block';
    
    // Play crash animation
    setTimeout(() => {
        crashEffect.style.display = 'none';
    }, 800);
    
    // Update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('carGameHighScore', gameState.highScore);
        updateHighScoreDisplay();
        showAchievement('Yeni Rekor! 🏆', `${gameState.score} puanla yeni rekor kırdın!`);
    }
    
    updateGameStatus(`Yakalandın! 💥`);
    
    // Show game over popup
    showGameOverPopup(reason);
    
    // Re-enable start button
    setTimeout(() => {
        startBtn.disabled = false;
        startBtn.textContent = 'TEKRAR BAŞLA! 🚗';
    }, 2000);
    
    console.log(`Oyun bitti: ${reason} Skor: ${gameState.score}`);
}

function showGameOverPopup(reason) {
    const popup = document.createElement('div');
    popup.className = 'game-over-popup';
    popup.innerHTML = `
        <div class="game-over-content">
            <h2 style="margin-bottom: 15px;">💥 YAKALANDIN! 💥</h2>
            <p style="margin: 10px 0; font-size: 1.1em;">${reason}</p>
            <div style="margin: 20px 0;">
                <p><strong>🏁 Final Skor:</strong> ${gameState.score}</p>
                <p><strong>📏 Kaçtığın Mesafe:</strong> ${Math.floor(gameState.distance)}m</p>
                <p><strong>⏱️ Kaçış Süresi:</strong> ${gameState.timeElapsed}s</p>
                <p><strong>🏆 En Yüksek Skor:</strong> ${gameState.highScore}</p>
            </div>
            <p style="font-size: 0.9em; color: #ffeb3b;">Tekrar denemek için "TEKRAR BAŞLA" butonuna bas!</p>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Remove popup after 5 seconds
    setTimeout(() => {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    }, 5000);
}

function resetGame() {
    gameState.isRunning = false;
    
    // Oyun müziğini durdur
    gameMusic.pause();
    gameMusic.currentTime = 0;
    
    gameState.score = 0;
    gameState.speed = gameSettings.baseSpeed;
    gameState.distance = 0;
    gameState.timeElapsed = 0;
    
    playerPosition.x = 0;
    playerPosition.y = 80;
    
    // Clear traffic
    trafficCars = [];
    trafficContainer.innerHTML = '';
    
    // Reset positions
    updatePlayerPosition();
    chaserGokhan.style.left = '50%'; // Ortada başla
    chaserGokhan.style.transform = 'translateX(-50%)';
    chaserGokhan.style.bottom = '-50px'; // Çok arkada başlasın
    
    // Reset UI
    playerCar.classList.remove('crashed');
    startBtn.disabled = false;
    startBtn.textContent = 'BAŞLA! 🚗';
    
    updateGameStatus('Hazır');
    updateDisplays();
    
    // Remove any game over popups
    const gameOverPopups = document.querySelectorAll('.game-over-popup');
    gameOverPopups.forEach(popup => popup.remove());
    
    console.log('Oyun sıfırlandı!');
}

function updateDisplays() {
    speedDisplay.textContent = Math.floor(gameState.speed * 15); // Convert to km/h feel
    distanceDisplay.textContent = Math.floor(gameState.distance);
    timerDisplay.textContent = gameState.timeElapsed;
    scoreDisplay.textContent = gameState.score;
}

function updateHighScoreDisplay() {
    highScoreDisplay.textContent = gameState.highScore;
}

function updateGameStatus(status) {
    gameStatusDisplay.textContent = status;
}

function showAchievement(title, description) {
    const achievement = document.createElement('div');
    achievement.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #ffd700, #ffed4e); color: #333; padding: 20px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.3); z-index: 1000; animation: slideIn 0.5s ease-out; max-width: 300px;">
            <h4 style="margin: 0 0 10px 0; font-size: 1.2em;">${title}</h4>
            <p style="margin: 0; font-size: 0.9em;">${description}</p>
        </div>
    `;
    
    document.body.appendChild(achievement);
    
    setTimeout(() => {
        if (achievement.parentNode) {
            achievement.style.animation = 'slideOut 0.5s ease-in forwards';
            setTimeout(() => {
                achievement.parentNode.removeChild(achievement);
            }, 500);
        }
    }, 3000);
}

// Add CSS animations
const carGameStyle = document.createElement('style');
carGameStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(carGameStyle);

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);

// Special achievement system
function checkSpecialAchievements() {
    if (gameState.timeElapsed >= 30 && !localStorage.getItem('car_achievement_30s')) {
        showAchievement('Kaçış Ustası! 🏃‍♂️', '30 saniye kaçmayı başardın!');
        localStorage.setItem('car_achievement_30s', 'true');
    }
    
    if (gameState.score >= 100 && !localStorage.getItem('car_achievement_100pts')) {
        showAchievement('Puan Kasanı! 💯', 'İlk 100 puanını aldın!');
        localStorage.setItem('car_achievement_100pts', 'true');
    }
    
    if (gameState.distance >= 1000 && !localStorage.getItem('car_achievement_1km')) {
        showAchievement('Maraton Koşucusu! 🏃', '1 kilometreden fazla kaçtın!');
        localStorage.setItem('car_achievement_1km', 'true');
    }
}

// Run achievement check periodically during game
setInterval(() => {
    if (gameState.isRunning) {
        checkSpecialAchievements();
    }
}, 1000);