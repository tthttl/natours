const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target?.classList.add('flipping-teaser');
        } else {
            entry.target?.classList.remove('flipping-teaser');
        }
    });
});

const toggleClickedOnCard = (card) => {
    return () => {
        if (!card.classList.contains('clicked')) {
            card.classList.add('clicked');
        } else {
            card.classList.remove('clicked');
        }
    }
}

const closeNavigation = (hamburger) => {
    return () => {
        if (hamburger.checked) {
            hamburger.checked = false;
        }
    }
}

window.addEventListener("load", (event) => {
    if (window.matchMedia('(max-width:600px), (hover:none)').matches) {
        document.querySelectorAll('.flipping-card').forEach((card) => {
            observer.observe(card);
            card.addEventListener('click', toggleClickedOnCard(card));
        });
    }
    const hamburger = document.querySelector('.navigation__checkbox');
    document.querySelectorAll('.navigation__link').forEach((navLink) => {
        navLink.addEventListener('click', closeNavigation(hamburger));
    });
}, false);

