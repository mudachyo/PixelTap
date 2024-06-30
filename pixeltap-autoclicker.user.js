// ==UserScript==
// @grant        none
// @version      1.3
// @author       mudachyo
// @name         PixelTap Autoclicker
// @description  21.06.2024, 21:31:29
// @match        *://sexyzbot.pxlvrs.io/*
// @homepage     https://github.com/mudachyo/PixelTap
// @icon         https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ8fIh36hOYyMEv7XiDsX0EMOP2MC18Trptg&s
// @downloadURL  https://github.com/mudachyo/PixelTap/raw/main/pixeltap-autoclicker.user.js
// @updateURL    https://github.com/mudachyo/PixelTap/raw/main/pixeltap-autoclicker.user.js
// ==/UserScript==

const styles = {
    success: 'background: #28a745; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
    starting: 'background: #8640ff; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
    error: 'background: #dc3545; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
    info: 'background: #007bff; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
    left: 'background: #b54b00; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
}, logPrefix = '%c[PixelTapBot] ';

console.originalLog = console.log.bind(console);
console.log = function () {
    if (typeof arguments[0] === 'string' && arguments[0].includes('[PixelTapBot]')) {
        console.originalLog.apply(console, arguments);
    }
};
console.error = console.warn = console.info = console.debug = () => { };

console.clear();
console.log(`${logPrefix}Starting`, styles.starting);
console.log(`${logPrefix}Create by https://t.me/mudachyo`, styles.starting);
console.log(`${logPrefix}Telegram Channel https://t.me/shopalenka`, styles.starting);

const randomDelay = (min, max) => Math.random() * (max - min) + min;
const randomOffset = range => Math.random() * range * 2 - range;
const randomPressure = () => Math.random() * 0.5 + 0.5;
let wins = 0, losses = 0, totalPoints = 0, abandoned = 0, gameEnded = false, enemyLeftFight = false, isGamePaused = false, isClicking = false;

function createEvent(type, target, options) {
    target.dispatchEvent(new PointerEvent(type, {
        bubbles: true, cancelable: true, view: window, detail: 1, pointerId: 1, width: 1, height: 1,
        tangentialPressure: 0, tiltX: 0, tiltY: 0, pointerType: 'touch', isPrimary: true, ...options
    }));
}

function getCoords(element) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    return { clientX: x, clientY: y, screenX: window.screenX + x, screenY: window.screenY + y };
}

function clickElement(target) {
    if (isGamePaused) return;
    const { clientX, clientY, screenX, screenY } = getCoords(target);
    const options = { clientX: clientX + randomOffset(10), clientY: clientY + randomOffset(10), screenX: screenX + randomOffset(10), screenY: screenY + randomOffset(10), pressure: randomPressure() };
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(type => createEvent(type, target, options));
}

function clickRandomCard() {
    if (isGamePaused) return;
    const cards = document.querySelectorAll('._card_x3e7v_1:not(._active_x3e7v_21)');
    if (cards.length) clickElement(cards[Math.floor(Math.random() * cards.length)]);
}

function handleEndGame() {
    if (isGamePaused) return;
    const endGameElement = document.querySelector('div._resultContainer_1ief9_1');
    if (endGameElement && !gameEnded) {
        gameEnded = true;
        const restartBtn = document.querySelector('button._button_18h6r_1._purple_18h6r_31._textUppercase_18h6r_28 span');
        const gameResult = document.querySelector('div._reward_15p38_1 > span').innerText;
        const points = parseInt(gameResult.replace(/[^0-9]/g, ''), 10);

        gameResult.includes('-') ? (losses++, totalPoints -= points) : (wins++, totalPoints += points);

        console.originalLog(`${logPrefix}${gameResult.includes('-') ? 'Defeat' : 'Victory'} (${gameResult})`, gameResult.includes('-') ? styles.error : styles.success);
        console.originalLog(`${logPrefix}Stats: Wins: ${wins} | Losses: ${losses} | Abandoned: ${abandoned} | Total Points: ${totalPoints}`, styles.info);

        setTimeout(() => { gameEnded = false; restartBtn.click(); }, randomDelay(1000, 3000));
    }
}

function clickAfterClose() {
    if (isGamePaused || isClicking) return;
    enemyLeftFight = false;
    const targetButton = document.querySelector('button._button_18h6r_1._purple_18h6r_31._outlined_fe4eh_65._textUppercase_18h6r_28');
    if (targetButton) {
        isClicking = true;
        clickElement(targetButton);
        console.originalLog(`${logPrefix}The enemy has left the fight`, styles.left);
        abandoned++;
        console.originalLog(`${logPrefix}Stats: Wins: ${wins} | Losses: ${losses} | Abandoned: ${abandoned} | Total Points: ${totalPoints}`, styles.info);
        setTimeout(() => { isClicking = false; }, randomDelay(1000, 3000));
    }
}

function closeModal() {
    if (isGamePaused) return;
    const modalCloseButton = document.querySelector('.modalTopIcon .modalCross');
    if (modalCloseButton) {
        setTimeout(() => {
            if (isGamePaused) return;
            clickElement(modalCloseButton);
            setTimeout(() => { clickAfterClose(); clickUntilGone(); }, 500);
        }, randomDelay(1000, 3000));
    }
}

function clickUntilGone() {
    const targetButton = document.querySelector('button._button_18h6r_1._purple_18h6r_31._outlined_fe4eh_65._textUppercase_fe4eh_28');
    if (targetButton && !isClicking) {
        isClicking = true;
        clickElement(targetButton);
        setTimeout(() => { isClicking = false; clickUntilGone(); }, randomDelay(1000, 3000));
    }
}

function toggleGamePause() {
    isGamePaused = !isGamePaused;
    pauseButton.textContent = isGamePaused ? 'Resume' : 'Pause';
}

function autoClick() {
    if (!isGamePaused) {
        try {
            const modal = document.querySelector('.modalWrapper');
            if (modal) closeModal();
            else {
                const targetArea = document.querySelector('.clickableArea');
                if (targetArea) {
                    clickElement(targetArea);
                    if (window.Telegram?.WebView?.postEvent) {
                        Telegram.WebView.postEvent('web_app_trigger_haptic_feedback', { type: 'impact', impact_style: 'medium' });
                    }
                } else handleEndGame();
                if (!document.querySelectorAll('._card_1ymyk_1._active_1ymyk_21').length) clickRandomCard();
            }
        } catch (error) { }
    }
    setTimeout(autoClick, randomDelay(60, 140));
}

const pauseButton = document.createElement('button');
pauseButton.textContent = 'Pause';
Object.assign(pauseButton.style, {
    position: 'fixed', bottom: '20px', right: '20px', zIndex: '9999',
    padding: '4px 8px', backgroundColor: '#5d5abd', color: 'white',
    border: 'none', borderRadius: '10px', cursor: 'pointer'
});
pauseButton.onclick = toggleGamePause;
document.body.appendChild(pauseButton);

autoClick();