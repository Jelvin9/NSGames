// Function to create a card for each game
function createGameCard(gamesData) {
    const cardContainer = document.getElementById('profile-card');

    gamesData.forEach((game) => {
        const card = document.createElement('div');
        card.classList.add('card', 'custom-card');
        card.setAttribute('data-genre', game.genre.join(' '));
        card.setAttribute('data-release-date', game['release-date']);

        card.innerHTML = `
            <img src="${game.image}" class="card-img-top" alt="${game.name}">
            <div class="card-body">
                <h3 class="card-title mb-4">${game.name}</h3>
                <p class="card-text"><strong>Release Date:</strong> ${game['release-date']}</p>
                <p class="card-text"><strong>Genre:</strong> ${game.genre.join(', ')}</p>
                <p class="card-text"><strong>Play Modes:</strong> ${game.playmode.join(', ')}</p>
                <p class="card-text"><strong>Number of Players:</strong> ${game.players}</p>
                <p class="card-text"><strong>Multiplayer:</strong> ${game.multiplayer[0] ? `Yes (${game.multiplayer[1]} players)` : "No"}</p>
                <p class="card-text"><strong>ESRB Rating:</strong> ${game['esrb-rating']}</p>
                <p class="card-text"><strong>Weekly Rate:</strong> $${game.weeklyrate.toFixed(2)}</p>
                <button type="button" class="btn rentbtn" data-bs-toggle="modal" data-bs-target="#exampleModal">Rent Now</button>
            </div>

                        <!-- Modal -->
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Rental Details</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p class="mb-4" id="modalGameName"><strong>${game.name}</strong></p>
                    <p class="mb-4" id="modalWeeklyRate"><strong>Weekly Rate: $${game.weeklyrate.toFixed(2)}</strong></p>

                    <form id="rental-form">
                        <div class="mb-3">
                            <label for="rental-duration" class="form-label">Rental Duration (week): </label>
                            <input type="number" class="form-control" id="rental-duration" name="rental-duration" value="1" min="1" max="12">
                        </div>
                    </form>

                    <p><strong>Total Cost:</strong> $<span id="modalTotalCost"></span></p>
                    <p><strong>Return Date:</strong> <span id="modalDueDate"></span></p>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary atcbtn" id="addtocartbtn">Add to Cart</button>
                </div>
                </div>
            </div>
            </div>
        `;

        cardContainer.appendChild(card);
    });
}

// Fetch the JSON data from games.json
fetch('games.json')
    .then((response) => response.json())
    .then((gamesData) => {
        createGameCard(gamesData);
    

    // Add event listeners to "Rent Now" buttons
    document.querySelectorAll('.rentbtn').forEach((button, index) => {
        button.addEventListener('click', () => {
            const selectedGame = gamesData[index];
            openRentalModal(selectedGame);
        });
    });
})

    .catch((error) => {
        console.error('Error fetching the JSON:', error);
        displayErrorMessage('Failed to load games data');
    });

// Function to display an error message
function displayErrorMessage(message) {
    const errorMessage = document.createElement('div');
    errorMessage.textContent = message;
    errorMessage.style.color = 'red';
    document.body.appendChild(errorMessage);
}

// Function to filter cards based on a condition
function filterCards(cards, condition) {
    cards.forEach((card) => {
        card.style.display = condition(card) ? 'block' : 'none';
    });
}

// respective filter button labels
const genreMapping = {
    "Role-Playing": "RPG",
    "Action": "Action",
    "Adventure": "Adventure",
    "Platformer": "Platformer",
    "Simulation": "Simulation",
    "Sports":"Sports",
    "Fighting":"Fighting",
    // Add more mappings as needed
};


// Event listener for genre buttons
document.querySelectorAll('.genre-filter').forEach((button) => {
    button.addEventListener('click', (event) => {
        const selectedGenre = event.target.getAttribute('data-genre');
        const cards = document.querySelectorAll('.custom-card');
        filterCards(cards, (card) => {
            const cardGenres = card.getAttribute('data-genre')
                                   .split(' ')
                                   .map(genre => genreMapping[genre] || genre); // Map genres to button labels
            return selectedGenre === 'all' || cardGenres.includes(selectedGenre);
        });
    });
});


// Event listener for new release button
document.querySelector('.new-release-filter').addEventListener('click', () => {
    const cards = document.querySelectorAll('.custom-card');
    const currentDate = new Date();

    filterCards(cards, (card) => {
        const dateParts = card.getAttribute('data-release-date').split('/');
        const releaseDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`); // Reformat to yyyy-mm-dd
        return (currentDate - releaseDate) / (1000 * 60 * 60 * 24) <= 60; // 30 days as new release threshold
    });
});



// Open the modal and populate data
function openRentalModal(game) {
    // Set initial values
    const rentalDurationInput = document.getElementById('rental-duration');
    rentalDurationInput.value = 1; // Default to 1 week
    calculateTotalAndDueDate(1, game.weeklyrate);

    // Remove any previous event listener to avoid duplication
    rentalDurationInput.removeEventListener('input', handleDurationChange);

    // Attach event listener for changes in rental duration
    function handleDurationChange() {
        const weeks = parseInt(rentalDurationInput.value);
        console.log('Rental duration changed:', weeks); // Debugging
        calculateTotalAndDueDate(weeks, game.weeklyrate);
    }

    rentalDurationInput.addEventListener('input', handleDurationChange);
}

// Function to calculate total cost and due date
function calculateTotalAndDueDate(weeks, weeklyRate) {
    const totalCost = weeks * weeklyRate;
    document.getElementById('modalTotalCost').textContent = totalCost.toFixed(2);

    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + (weeks * 7)); // Calculate due date
    document.getElementById('modalDueDate').textContent = currentDate.toLocaleDateString();
}


// shopping cart function
let cart = [];

function addToCart(game, duration, totalCost, dueDate) {
    const cartItem = {
        name: game.name,
        duration: duration,
        totalCost: totalCost,
        dueDate: dueDate
    };
    cart.push(cartItem);
    updateCartDropdown();
}

function updateCartDropdown() {
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalCost = document.getElementById('cart-total-cost');
    cartItemsList.innerHTML = '';
    
    let totalCost = 0;

    cart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name} (x${item.duration} weeks)</span>
            <span>$${item.totalCost.toFixed(2)}</span>
        `;
        cartItemsList.appendChild(li);
        totalCost += item.totalCost;
    });

    cartTotalCost.textContent = totalCost.toFixed(2);
}

// Event listener for Add to Cart button in the modal
document.querySelector('.atcbtn').addEventListener('click', function () {
    const duration = parseInt(document.getElementById('rental-duration').value);
    const totalCost = parseFloat(document.getElementById('modalTotalCost').textContent);
    const dueDate = document.getElementById('modalDueDate').textContent;
    
    // Assume `currentGame` is the game object you passed to `openRentalModal`
    addToCart(currentGame, duration, totalCost, dueDate);
    
    // Close the modal after adding to cart (optional)
    const modalElement = document.querySelector('#rentalModal'); // Adjust selector if needed
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
});
