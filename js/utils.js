const Utils = {
    random: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    randomFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    clamp: function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    distance: function(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    
    collision: function(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    circleCollision: function(x1, y1, r1, x2, y2, r2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < r1 + r2;
    },
    
    lerp: function(start, end, amount) {
        return start + (end - start) * amount;
    },
    
    formatNumber: function(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },
    
    getPercentage: function(current, max) {
        return Math.floor((current / max) * 100);
    },
    
    deepClone: function(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },
    
    arrayShuffle: function(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    pickRandom: function(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    weightedRandom: function(choices) {
        const totalWeight = choices.reduce((sum, choice) => sum + choice.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const choice of choices) {
            random -= choice.weight;
            if (random <= 0) {
                return choice.value;
            }
        }
        return choices[choices.length - 1].value;
    },
    
    drawTextWithOutline: function(ctx, text, x, y, color, outlineColor, fontSize = 16, fontFamily = 'Arial') {
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillStyle = outlineColor;
        ctx.fillText(text, x - 1, y - 1);
        ctx.fillText(text, x + 1, y - 1);
        ctx.fillText(text, x - 1, y + 1);
        ctx.fillText(text, x + 1, y + 1);
        
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    },
    
    drawHealthBar: function(ctx, x, y, width, height, currentHp, maxHp, showText = true) {
        const percentage = currentHp / maxHp;
        const barWidth = width * percentage;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, width, height);
        
        let hpColor;
        if (percentage > 0.6) {
            hpColor = '#4caf50';
        } else if (percentage > 0.3) {
            hpColor = '#ff9800';
        } else {
            hpColor = '#f44336';
        }
        
        ctx.fillStyle = hpColor;
        ctx.fillRect(x, y, barWidth, height);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        if (showText) {
            this.drawTextWithOutline(
                ctx,
                `${Math.max(0, Math.floor(currentHp))}/${maxHp}`,
                x + width / 2,
                y + height / 2,
                '#fff',
                '#000',
                12
            );
        }
    },
    
    drawExpBar: function(ctx, x, y, width, height, currentExp, expToLevel, showText = true) {
        const percentage = currentExp / expToLevel;
        const barWidth = width * percentage;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, width, height);
        
        ctx.fillStyle = '#9c27b0';
        ctx.fillRect(x, y, barWidth, height);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        if (showText) {
            this.drawTextWithOutline(
                ctx,
                `${currentExp}/${expToLevel}`,
                x + width / 2,
                y + height / 2,
                '#fff',
                '#000',
                10
            );
        }
    },
    
    showMessage: function(text, duration = 2000) {
        const messageBox = document.getElementById('messageBox');
        messageBox.innerHTML = `<p>${text}</p>`;
        messageBox.classList.remove('hidden');
        
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, duration);
    },
    
    formatTime: function(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

Object.freeze(Utils);
