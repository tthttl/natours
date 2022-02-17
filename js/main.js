const nwaBookingsApiUrl = 'https://nwa-api-booking.azurewebsites.net/api/nwa-api-bookings';
const nwaApiBookingConfigUrl = 'https://nwa-config.azurewebsites.net/api/nwa-config-get';
const tokenValidationUrl = 'https://nwa-api-booking.azurewebsites.net/.auth/login/facebook'

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
    const text = document.querySelector('.toast__text');
    switch (status) {
        case 200:
        case 201:
            header.innerHTML = 'Success';
            text.innerHTML = 'Tour successfully booked!';
            break;
        case 401:
            header.innerHTML = 'Login required';
            text.innerHTML = 'Please login to confirm your booking';
            break;
        default:
            header.innerHTML = 'Error'
            text.innerHTML = 'Oops :( Something went wrong, please try again!';
    }

}

const bookTour = async (authenticationToken, functionKey, authResponse) => {
    if (authenticationToken && authResponse) {
        postForm(functionKey, authenticationToken, authResponse);
    } else {
        const response = await new Promise((resolve) => {
            FB.login(async function (response) {
                resolve(response);
            });
        });
        if (response.authResponse) {
            const validatedToken = await validateToken(response.authResponse.accessToken);
            postForm(functionKey, validatedToken, response.authResponse);
        } else {
            console.log('User cancelled login or did not fully authorize.');
            showMessage();
        }
    }
}

const validateToken = async (accessToken) => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const response = await fetch(tokenValidationUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            access_token: accessToken
        })
    });
    return response.json();
}

const postForm = async (functionKey, authenticationToken, authResponse) => {
    const email = document.getElementById('email');
    const name = document.getElementById('name');
    const button = document.querySelector('.form .btn');

    const radios = document.querySelectorAll('[name=tour-type]');
    const selectedTour = Array.from(radios).find(radio => radio.checked)?.value;
    button.disabled = true;
    const headers = new Headers();
    try {
        headers.append('x-functions-key', functionKey);
        headers.append('X-ZUMO-AUTH', authenticationToken);
        const response = await fetch(nwaBookingsApiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                email: email.value,
                name: name.value,
                selectedTour,
                userId: authResponse.userID
            })
        });
        resetForm(button, email, name);
        showMessage(response.status);
        await loadUserData(functionKey, authenticationToken, authResponse);
    } catch (error) {
        resetForm(button);
        console.log(error);
        showMessage(error.status);
    }
}

const getAuthenticationTokenIfLoggedIn = async () => {
    const response = await new Promise((resolve) => {
        FB.getLoginStatus(function (response) {
            console.log("statusChangeCallback");
            console.log(response.authResponse);
            resolve(response);
        });
    });
    if (response.status === "connected") {
        const { authenticationToken } = await validateToken(response.authResponse.accessToken);
        return {
            authenticationToken,
            authResponse: response.authResponse
        };
    }
    return {
        authenticationToken: undefined,
        authResponse: undefined
    };
}

const getBookings = async (functionKey, authenticationToken, userId) => {
    const headers = new Headers();
    headers.append('x-functions-key', functionKey);
    headers.append('X-ZUMO-AUTH', authenticationToken);
    const bookings = await fetch(`${nwaBookingsApiUrl}?userid=${userId}`, {
        headers,
        method: 'GET'
    });
    return bookings.json();
}

const mapTourType = (tourType) => {
    switch (tourType) {
        case 'tour1':
            return 'See Explorer';
        case 'tour2':
            return 'Forest Hiker';
        case 'tour3':
            return 'Snow Adventurer';
        default:
            throw new Error('Type is not supported');
    }
}

const loadUserData = async (functionKey, authenticationToken, authResponse) => {
    if (authenticationToken && authResponse) {
        const user = await new Promise((resolve) => {
            FB.api(`/${authResponse.userID}?fields=id,picture`, function (user) {
                resolve(user);
            });
        });
        const profilePicture = document.querySelector('.profile-picture');
        profilePicture.src = user?.picture?.data?.url;
        profilePicture.classList.add('profile-picture--visible');

        const bookings = await getBookings(functionKey, authenticationToken, authResponse.userID);
        let bookingTable = document.querySelector('.booking-table');
        bookingTable.remove();
        bookingTable = document.createElement('div');
        bookingTable.classList.add('booking-table');
        bookings[0]?.forEach((booking) => {
            const bookingElement = document.createElement('div');
            bookingElement.innerHTML = `<strong>${mapTourType(booking.tourType)}</strong>  |  ${booking.user.name} 📨 ${booking.user.email}`;
            bookingElement.classList.add('booking-table__element');
            bookingTable.appendChild(bookingElement);
        });
        const section = document.querySelector('.section-booking-table');
        section.classList.add('section-booking-table--visible');
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
    const { authenticationToken, authResponse } = await getAuthenticationTokenIfLoggedIn();
    loadUserData(functionKey, authenticationToken, authResponse);
    const hamburger = document.querySelector('.navigation__checkbox');
    document.querySelectorAll('.navigation__link').forEach((navLink) => {
        navLink.addEventListener('click', closeNavigation(hamburger));
    });
    const bookingForm = document.querySelector('.book__form .form');
    bookingForm.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopPropagation();
        bookTour(authenticationToken, functionKey, authResponse);
    });
    const toastButton = document.querySelector('.toast .btn');
    toastButton.addEventListener('click', () => {
        document.getElementById('toast').classList.remove('toast--visible');
    });
}, false);

