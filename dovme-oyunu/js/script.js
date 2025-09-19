// DOM elementlerini seç
const pollForm = document.getElementById('pollForm');
const pollResult = document.getElementById('pollResult');
const character = document.getElementById('character');
const characterFace = document.getElementById('characterFace');
const hitCountElement = document.getElementById('hitCount');
const damageLevelElement = document.getElementById('damageLevel');
const resetGameButton = document.getElementById('resetGame');

// Oyun durumu
let hitCount = 0;
let damageLevel = 0;

// Anket formunu işle
pollForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const selectedOption = document.querySelector('input[name="punishment"]:checked');
    
    if (!selectedOption) {
        alert('Lütfen bir seçenek seç Safinur\'um! 😊');
        return;
    }
    
    const value = selectedOption.value;
    let resultMessage = '';
    let resultClass = '';
    
    switch(value) {
        case 'none':
            resultMessage = '💕 Safinur çok tatlı! Gökhan\'ı affetti! Aşk kazandı! 💕';
            resultClass = 'result-forgiven';
            break;
        case 'light':
            resultMessage = '😊 Safinur hafif kızgın! Gökhan bir tokat hak etti! 👋';
            resultClass = 'result-light';
            break;
        case 'medium':
            resultMessage = '😠 Safinur ciddi kızgın! Gökhan iyi bir ders almalı! 👊';
            resultClass = 'result-medium';
            break;
        case 'heavy':
            resultMessage = '😡 Safinur çok çok kızgın! Gökhan\'ın kemikleri kırılsın! 💀';
            resultClass = 'result-heavy';
            break;
    }
    
    pollResult.innerHTML = `<div class="${resultClass}">${resultMessage}</div>`;
    pollResult.style.display = 'block';
    
    // Sonuca göre özel efektler
    if (value === 'heavy') {
        document.body.classList.add('very-angry');
        setTimeout(() => {
            document.body.classList.remove('very-angry');
        }, 3000);
    }
});

// Karaktere tıklama (dövme) işlevi
character.addEventListener('click', function(e) {
    hitCount++;
    updateHitCount();
    
    // Vuruş animasyonu
    character.classList.add('hit');
    setTimeout(() => {
        character.classList.remove('hit');
    }, 300);
    
    // Hasar seviyesini güncelle
    updateDamageLevel();
    
    // Vuruş efekti göster
    const damageTexts = ['BAM!', 'POW!', 'OUCH!', 'AÇÇ!', 'VURDU!', 'AĞĞĞ!'];
    const randomText = damageTexts[Math.floor(Math.random() * damageTexts.length)];
    showDamageEffect(e.target, randomText, '#f44336');
    
    // Çok fazla vuruş varsa özel efektler
    if (hitCount > 50) {
        showDamageEffect(character, '💀 YETER! ÖLDÜ!', '#9c27b0');
        character.style.transform = 'rotate(90deg)';
    } else if (hitCount > 30) {
        showDamageEffect(character, '😵 Bayıldı!', '#ff5722');
    } else if (hitCount > 15) {
        showDamageEffect(character, '😫 Ağlıyor!', '#ff9800');
    }
});

// Vuruş sayısını güncelle
function updateHitCount() {
    hitCountElement.textContent = hitCount;
}

// Hasar seviyesini güncelle
function updateDamageLevel() {
    if (hitCount === 0) {
        damageLevelElement.textContent = 'Sağlıklı';
        damageLevelElement.style.color = '#4caf50';
    } else if (hitCount < 5) {
        damageLevelElement.textContent = 'Hafif Yaralı';
        damageLevelElement.style.color = '#ff9800';
    } else if (hitCount < 15) {
        damageLevelElement.textContent = 'Yaralı';
        damageLevelElement.style.color = '#ff5722';
    } else if (hitCount < 30) {
        damageLevelElement.textContent = 'Ağır Yaralı';
        damageLevelElement.style.color = '#f44336';
    } else if (hitCount < 50) {
        damageLevelElement.textContent = 'Ölümcül Yaralı';
        damageLevelElement.style.color = '#9c27b0';
    } else {
        damageLevelElement.textContent = 'ÖLDÜ 💀';
        damageLevelElement.style.color = '#000000';
    }
}

// Hasar efekti göster
function showDamageEffect(target, text, color) {
    const effect = document.createElement('div');
    effect.className = 'damage-effect';
    effect.textContent = text;
    effect.style.color = color;
    effect.style.left = (Math.random() * 200 - 100) + 'px';
    effect.style.top = (Math.random() * 100 - 50) + 'px';
    
    target.style.position = 'relative';
    target.appendChild(effect);
    
    // Efekti 1 saniye sonra kaldır
    setTimeout(() => {
        effect.remove();
    }, 1000);
}

// Oyunu sıfırla
resetGameButton.addEventListener('click', function() {
    hitCount = 0;
    damageLevel = 0;
    
    updateHitCount();
    updateDamageLevel();
    
    // Karakteri normale döndür
    character.style.transform = 'rotate(0deg)';
    character.classList.remove('hit');
    
    // Tüm efektleri temizle
    const effects = character.querySelectorAll('.damage-effect');
    effects.forEach(effect => effect.remove());
    
    showDamageEffect(character, '✨ Sıfırlandı!', '#4caf50');
});

// Sayfa yüklendiğinde başlangıç animasyonları
document.addEventListener('DOMContentLoaded', function() {
    // Başlık animasyonu
    const title = document.querySelector('.main-title');
    title.style.opacity = '0';
    title.style.transform = 'translateY(-30px)';
    
    setTimeout(() => {
        title.style.transition = 'all 1s ease';
        title.style.opacity = '1';
        title.style.transform = 'translateY(0)';
    }, 300);
    
    // Kartları sırayla göster
    const cards = document.querySelectorAll('.apology-card, .poll-card, .game-card, .final-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.8s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 500 + (index * 200));
    });
});

// Ek kalp animasyonları
function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.innerHTML = '💖';
    heart.style.position = 'fixed';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.top = '100vh';
    heart.style.fontSize = '2rem';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '-1';
    heart.style.animation = 'floatingHearts 6s linear forwards';
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
        heart.remove();
    }, 6000);
}

// Her 3 saniyede bir kalp oluştur
setInterval(createFloatingHeart, 3000);

// Anket seçeneklerine hover efektleri
const pollOptions = document.querySelectorAll('.poll-option');
pollOptions.forEach(option => {
    option.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(10px) scale(1.02)';
    });
    
    option.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0) scale(1)';
    });
});

// CSS stillerini dinamik olarak ekle
const style = document.createElement('style');
style.textContent = `
    .result-forgiven {
        background: #e8f5e8;
        color: #2e7d32;
        border: 2px solid #4caf50;
    }
    
    .result-light {
        background: #fff3e0;
        color: #ef6c00;
        border: 2px solid #ff9800;
    }
    
    .result-medium {
        background: #ffebee;
        color: #c62828;
        border: 2px solid #f44336;
    }
    
    .result-heavy {
        background: #f3e5f5;
        color: #6a1b9a;
        border: 2px solid #9c27b0;
        animation: angryPulse 1s ease-in-out infinite;
    }
    
    @keyframes angryPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;

document.head.appendChild(style);