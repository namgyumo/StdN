document.addEventListener('DOMContentLoaded', () => {
    const selectors = [
        '.nav a', '.logo', '.box', '.contact-box', '.about-box',
        '.info-box', '.port-date', '.port-inner', '.skill-card',
        '.contact-card', '.boj-api', '.sub-pro', '.btntext', '.rec-card'
    ];

    document.querySelectorAll(selectors.join(', ')).forEach(el => {
        el.addEventListener('touchstart', () => {
            el.classList.add('touch-active');
        }, { passive: true });

        el.addEventListener('touchend', () => {
            setTimeout(() => el.classList.remove('touch-active'), 300);
        });

        el.addEventListener('touchcancel', () => {
            el.classList.remove('touch-active');
        });
    });
});
