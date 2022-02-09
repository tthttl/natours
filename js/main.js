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

const showMessage = (status) => {
    button.disabled = false;
    alert(status);
}

const postForm = async (url) => {
    const email = document.getElementById('email');
    const name = document.getElementById('name');
    const button = document.querySelector('.form .btn');
    const toast = document.getElementById('toast');
    const radios = document.querySelectorAll('[name=tour-type]');
    const selectedTour =  Array.from(radios).find(radio => radio.checked)?.value;
    button.disabled = true;

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                email: email.value,
                name: name.value,
                selectedTour
            })
        });

        showMessage(response.status);

    } catch (error) {
        console.log(error);
        button.disabled = false;
        toast.classList.add('toast--visible');
    }
    //handle response => show success pop-up, reset form
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
    const bookingForm = document.querySelector('.book__form .form');
    bookingForm.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopPropagation();
        postForm('https://naturs-api.azurewebsites.net/booking');
    });
    const toastButton = document.querySelector('.toast .btn');
    toastButton.addEventListener('click', () => {
        document.getElementById('toast').classList.remove('toast--visible');
    });


}, false);

