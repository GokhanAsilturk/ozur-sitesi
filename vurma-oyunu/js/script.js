// Bird Game Variables
let score = 0;
let hitCount = 0;
let poopCount = 0;
let birdHealth = 100;
let maxHealth = 100;

// Game Elements
const gameArea = document.getElementById('gameArea');
const flyingBird = document.getElementById('flyingBird');
const scoreDisplay = document.getElementById('score');
const catchCountDisplay = document.getElementById('shotCount');
const poopCountDisplay = document.getElementById('poopCount');
const catchBtn = document.getElementById('catchBtn');
const resetBtn = document.getElementById('resetShootingGame');
const poopContainer = document.getElementById('poopContainer');
const healthFill = document.getElementById('healthFill');

// Game State
let isGameActive = true;
let isAlive = true;
let birdSpeed = 6; // seconds for one flight cycle - daha yavaş
let poopTimer = null;

// Initialize Game
function initGame() {
    updateStats();
    updateHealthBar();
    startFlyingBird();
    startPoopTimer();
    
    // Add click event to bird
    flyingBird.addEventListener('click', hitBird);
    catchBtn.addEventListener('click', hitBird);
    resetBtn.addEventListener('click', resetGame);
}

// Start flying bird animation
function startFlyingBird() {
    if (isAlive) {
        flyingBird.style.animationDuration = `${birdSpeed}s`;
    }
}

// Start poop timer - bird poops randomly
function startPoopTimer() {
    const makeRandomPoop = () => {
        if (isGameActive && isAlive) {
            makePoop();
            // Random interval between 3-8 seconds
            const nextPoopTime = 3000 + Math.random() * 5000;
            poopTimer = setTimeout(makeRandomPoop, nextPoopTime);
        }
    };
    makeRandomPoop();
}

// Make bird poop
function makePoop() {
    const birdRect = flyingBird.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();
    
    const poop = document.createElement('div');
    poop.className = 'poop';
    poop.textContent = '💩';
    
    // Position poop under the bird
    const relativeLeft = birdRect.left - gameRect.left + 20;
    const relativeTop = birdRect.top - gameRect.top + 40;
    
    poop.style.left = `${relativeLeft}px`;
    poop.style.top = `${relativeTop}px`;
    
    poopContainer.appendChild(poop);
    poopCount++;
    updateStats();
    
    // Remove poop after animation
    setTimeout(() => {
        if (poop.parentNode) {
            poop.parentNode.removeChild(poop);
        }
    }, 2000);
}

// Hit bird
function hitBird(e) {
    if (!isGameActive || !isAlive) return;
    
    hitCount++;
    birdHealth = Math.max(0, birdHealth - 10); // Her vuruşta 10 can azalt
    score += 10;
    
    // Bird hit animation
    flyingBird.classList.add('bird-caught');
    setTimeout(() => {
        flyingBird.classList.remove('bird-caught');
    }, 500);
    
    updateHealthBar();
    
    // Kuş öldü mü kontrol et
    if (birdHealth <= 0) {
        killBird();
        return;
    }
    
    // Show hit popup
    showHitPopup();
    
    // Play hit sound
    playHitSound();
    
    updateStats();
    checkAchievements();
    
    // Increase bird speed slightly
    if (hitCount % 5 === 0) {
        birdSpeed = Math.max(3, birdSpeed - 0.4); // Minimum 3s, gets faster
        flyingBird.style.animationDuration = `${birdSpeed}s`;
        showAchievement('Kuş Hızlandı! 🏃‍♂️', 'Gökhan daha hızlı uçmaya başladı!');
    }
}

function killBird() {
    isGameActive = false;
    isAlive = false;
    
    // Stop all animations and timers
    flyingBird.style.animationPlayState = 'paused';
    if (poopTimer) {
        clearTimeout(poopTimer);
    }
    
    flyingBird.classList.add('bird-dead');
    flyingBird.style.pointerEvents = 'none'; // Tıklamayı devre dışı bırak
    
    // Game over popup göster
    showGameOverPopup();
}

function resetGame() {
    score = 0;
    hitCount = 0;
    poopCount = 0;
    birdHealth = maxHealth;
    isGameActive = true;
    isAlive = true;
    birdSpeed = 6; // Başlangıç hızı daha yavaş
    
    // Clear poop timer
    if (poopTimer) {
        clearTimeout(poopTimer);
    }
    
    // Reset bird animation
    flyingBird.style.animationPlayState = 'running';
    flyingBird.style.animationDuration = `${birdSpeed}s`;
    
    // Remove any lingering animations and effects
    flyingBird.classList.remove('bird-caught', 'bird-hit', 'bird-dead');
    flyingBird.style.pointerEvents = 'auto';
    
    updateHealthBar();
    updateStats();
    
    // Clear all poop
    poopContainer.innerHTML = '';
    
    // Clear game over popup
    const gameOverPopup = document.querySelector('.game-over-popup');
    if (gameOverPopup) {
        gameOverPopup.remove();
    }
    
    // Restart poop mechanic
    startPoopTimer();
}

function updateHealthBar() {
    const healthFill = document.querySelector('.health-fill');
    const healthPercentage = (birdHealth / maxHealth) * 100;
    healthFill.style.width = healthPercentage + '%';
}
}

// Show hit popup
function showHitPopup() {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = 'VURDUN! 💥';
    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.background = 'rgba(255,69,0,0.9)';
    
    gameArea.appendChild(popup);
    
    setTimeout(() => {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    }, 1000);
}

// Play hit sound
function playHitSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        console.log('Kuş vuruldu!');
    }
}

// Show game over popup when bird dies
function showGameOverPopup() {
    const popup = document.createElement('div');
    popup.className = 'game-over-popup';
    popup.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: rgba(0,0,0,0.9); color: white; padding: 30px; border-radius: 20px; 
                    text-align: center; font-size: 1.2em; z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h2 style="color: #ff0000; margin-bottom: 15px;">💀 GÖKHAN ÖLDÜ! 💀</h2>
            <p style="margin: 10px 0;">Safinur çok sert vurdu...</p>
            <p style="margin: 10px 0; color: #ffff00;">⭐ Toplam Puan: ${score}</p>
            <p style="margin: 10px 0; color: #ff9999;">💔 Toplam Vuruş: ${hitCount}</p>
            <p style="margin: 15px 0 5px 0; font-size: 0.9em; color: #ccc;">Oyunu sıfırla butonuyla tekrar canlandırabilirsin</p>
        </div>
    `;
    
    document.body.appendChild(popup);
}

// Update stats display
function updateStats() {
    scoreDisplay.textContent = score;
    catchCountDisplay.textContent = hitCount;
    poopCountDisplay.textContent = poopCount;
    
    // Can göstergesini güncelle
    const healthText = document.querySelector('.health-text');
    if (healthText) {
        healthText.textContent = `${birdHealth}/${maxHealth}`;
    }
}
    
    // Clear poop timer
    if (poopTimer) {
        clearTimeout(poopTimer);
    }
    
    // Reset bird speed
    flyingBird.style.animationDuration = `${birdSpeed}s`;
    
    updateStats();
    
    // Remove any lingering animations
    flyingBird.classList.remove('bird-caught');
    
    // Clear all poop
    poopContainer.innerHTML = '';
    
    // Restart poop timer
    startPoopTimer();
    
    console.log('Kuş oyunu sıfırlandı! Gökhan tekrar normal hızda uçuyor.');
}

// Add CSS for animations and death effects
const birdGameStyle = document.createElement('style');
birdGameStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .bird-caught {
        animation: birdHit 0.5s ease-out;
    }
    
    @keyframes birdHit {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); background-color: rgba(255,0,0,0.3); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(birdGameStyle);

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);

// Special messages based on score
function getScoreMessage(score) {
    if (score >= 200) return "Safinur çok etkilendi! Kuş Gökhan'ı çok iyi yakalıyorsun! 😍";
    if (score >= 150) return "Muhteşem performans! Gökhan kuşu kaçamıyor senden! 🐦";
    if (score >= 100) return "Harika gidiyorsun! Kuş avında çok iyisin! 🎯";
    if (score >= 50) return "İyi başlangıç! Uçan kuşu yakalamaya alışıyorsun! 👍";
    return "Devam et! Kuş Gökhan'ı yakalamaya çalış! (Ve kakaları izle!) 💩";
}