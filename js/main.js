const nwaApiBookingPostUrl = 'https://nwa-api-booking.azurewebsites.net/api/nwa-api-booking-post';
const nwaApiBookingConfigUrl = 'https://nwa-api-booking.azurewebsites.net/api/nwa-api-config';

const getConfig = async (url) => {
    const response = await fetch(url, {
        method: 'GET'
    });
    return await response.json();
}

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

const resetForm = (button, email, name) => {
    button.disabled = false;
    if (email) {
        email.value = '';
    }
    if (name) {
        name.value = '';
    }
}

const showMessage = (status = 500) => {
    const toast = document.getElementById('toast');
    toast.classList.add('toast--visible');
    const header = document.querySelector('.toast__content h2');
    header.innerHTML = `${status === 201 ? 'Success' : 'Error'}`;
    const text = document.querySelector('.toast__text');
    text.innerHTML = `${status === 201 ? 'Tour successfully booked!' : 'Oops :( Something went wrong, please try again!'}`;
}

const postForm = async (url, functionKey) => {
    const email = document.getElementById('email');
    const name = document.getElementById('name');
    const button = document.querySelector('.form .btn');

    const radios = document.querySelectorAll('[name=tour-type]');
    const selectedTour = Array.from(radios).find(radio => radio.checked)?.value;
    button.disabled = true;
    const headers = new Headers();
    try {
        headers.append('x-functions-key', functionKey);
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                email: email.value,
                name: name.value,
                selectedTour
            })
        });
        resetForm(button, email, name);
        showMessage(response.status);
    } catch (error) {
        resetForm(button);
        console.log(error);
        showMessage(error.status);
    }
}

window.addEventListener("load", async (event) => {
    const { functionKey } = await getConfig(nwaApiBookingConfigUrl);
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
        postForm(nwaApiBookingPostUrl, functionKey);
    });
    const toastButton = document.querySelector('.toast .btn');
    toastButton.addEventListener('click', () => {
        document.getElementById('toast').classList.remove('toast--visible');
    });
}, false);

