// FETCH DATA ⬇
/**
 * Check the response status
 * @param {object} response - response from fetch
 * @return {object} Promise object resolved or rejected based on response.ok
 */
function checkStatus(response) {
  if (response.ok === true) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
}

/**
 * Fetch All Data - Asynchronous Function
 * @return {object} Promise resolved to a JavaScript JSON object
 */
async function fetchAllData() {
  return await fetch('https://randomuser.me/api/?results=12&nat=us,dk,fr,gb&noinfo')
    .then(checkStatus)
    .then(response => response.json())
    .catch(error => console.log('Problem:', error));
}

// ADD ELEMENTS ⬇
/**
 * Generate All Cards
 * @param {object} data - person's data
 * @return {array} Array of card HTML for each person
 */
function generateCards(data) {
  return data.map(person => {
    return `<div class="card" data-uuid="${person.login.uuid}">
        <div class="card-img-container">
            <img class="card-img" src="${person.picture.large}" alt="profile picture">
        </div>
        <div class="card-info-container">
            <h3 id="name" class="card-name cap">${person.name.first} ${person.name.last}</h3>
            <p class="card-text">${person.email}</p>
            <p class="card-text cap">${person.location.city}, ${person.location.state}</p>
        </div>
      </div>`
  }).join('');
}

/**
 * Add Cards to Page
 * @param {object} data - person's data
 */
function addCards(data) {
  const gallery = document.getElementById('gallery');

  gallery.textContent = '';
  gallery.insertAdjacentHTML('beforeend', generateCards(data));
}

/**
 * Generate Modal for Card
 * @param {object} person - person's data
 * @return {string} HTML for Modal
 */
function generateModal(person) {
  var date = new Date(person.dob.date);
  var month = (date.getMonth() + 1);
  month = month < 10 ? '0' + month : month;
  var birthdate = `${month}/${date.getDate()}/${date.getFullYear()}`;

  return `<div class="modal-container" data-uuid="${person.login.uuid}">
        <div class="modal">
            <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
            <div class="modal-info-container">
                <img class="modal-img" src="${person.picture.large}" alt="profile picture">
                <h3 id="name" class="modal-name cap">${person.name.first} ${person.name.last}</h3>
                <p class="modal-text">${person.email}</p>
                <p class="modal-text cap">${person.location.city}</p>
                <hr>
                <p class="modal-text">${person.phone}</p>
                <p class="modal-text">${person.location.street.number} ${person.location.street.name}, ${person.location.city}, ${person.location.state} ${person.location.postcode}</p>
                <p class="modal-text">Birthday: ${birthdate}</p>
            </div>
        </div>

        <div class="modal-btn-container">
            <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
            <button type="button" id="modal-next" class="modal-next btn">Next</button>
        </div>
    </div>`;
}

/**
 * Generate Search Form
 * @param {object} container - the element container where the search form goes
 */
function displayForm(container) {
  const form = `<form action="#" method="get">
        <input type="search" id="search-input" class="search-input" placeholder="Search...">
        <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
    </form>`;

  container.innerHTML = form;
}

/**
 * Generate Search Form
 * @param {object} e - click event
 * @return {object} card container
 */
function getCard(e) {
  const el = e.target;
  let card = "";

  if (el.classList.contains('card')) {
    card = el;
  } else if (el.parentNode.classList.contains('card')) {
    card = el.parentNode;
  } else if (el.parentNode.parentNode.classList.contains('card')) {
    card = el.parentNode.parentNode;
  }

  return card;
}

// REMOVE ELEMENTS ⬇
/**
 * Generate Search Form
 * @param {object} e - click event
 */
function removeModal(e) {
  const el = e.target;

  if (el.classList.contains('modal-close-btn')) {
    el.parentNode.parentNode.remove();
    return;
  }

  if (el.parentNode.classList.contains('modal-close-btn')) {
    el.parentNode.parentNode.parentNode.remove();
    return;
  }

  if (
    el.disabled !== true &&
    (
      el.classList.contains('modal-prev') ||
      el.classList.contains('modal-next')
    )
  ) {
    el.parentNode.parentNode.remove();
    return;
  }
}

/**
 * Search for value in list of students.
 * @param {object} searchInput - Input field with the value to search for
 * @param {array} list - Array of student data we are working with
 */
function searchList(searchInput, data) {
  let filteredData = [];

  if (searchInput.value.length === 0) {
    filteredData = data;
  }

  filteredData = data.filter(person => {
    const name = `${person.name.first.toLowerCase()} ${person.name.last.toLowerCase()}`;
    return name.includes(searchInput.value.toLowerCase());
  });

  if (filteredData.length) {
    addCards(filteredData);
  }
}

// EVENTS ⬇
/**
 * Modal Pagination
 * @param {object} e - click event
 * @param {object} data - all response data
 */
function modalPagination(e, data) {

}

// After the DOM loads, fetch data for cards and display
document.addEventListener('DOMContentLoaded', async () => {
  // Add search form
  const searchContainer = document.querySelector('.search-container');
  displayForm(searchContainer);

  // Fetch card data and add cards to page
  const items = await fetchAllData();
  await addCards(items.results);

  // Search List Event Handlers
  const search = document.getElementById('search-input');
  const submit = document.getElementById('search-submit');

  /* submit listener */
  submit.addEventListener('click', (e) => {
    e.preventDefault();
    searchList(search, items.results);
  });

  /* submit listener */
  search.addEventListener('keyup', () => {
    searchList(search, items.results);
  });

  // Pop open a modal on card click
  gallery.addEventListener('click', (e) => {
    const card = getCard(e);
    if (!card) {
      return;
    }

    const uuid = card.getAttribute('data-uuid');
    const person = items.results.find(item => item.login.uuid === uuid);

    gallery.insertAdjacentHTML('afterend', generateModal(person));
  });

  // Modal pagination click events
  document.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') {
      return;
    }

    // get the button type
    const btn = e.target;
    const btnClass = e.target.getAttribute('id');

    // get all the cards
    const cards = [...document.querySelectorAll('.card')];

    // get the uuid from the modal
    const modalUuid = e.target.parentNode.parentNode.getAttribute('data-uuid');

    // look for the card with the matching uuid
    const currentCard = cards.find(card => card.getAttribute('data-uuid') === modalUuid);
    const currentCardIndex = cards.indexOf(currentCard);
    console.log(currentCardIndex);
    console.log(btnClass);

    // get the next or prev item, depending on the button type
    // display new modal

    if (btn.classList.contains('modal-next')) {
      if (currentCardIndex > 10) {
        btn.disabled = true;
        console.log('STOP');
      } else {
        console.log(e.target);

        // remove current modal
        document.addEventListener('click', removeModal);

        const person = items.results.find(item => item.login.uuid === cards[currentCardIndex + 1].getAttribute('data-uuid'));
        gallery.insertAdjacentHTML('afterend', generateModal(person));
      }
    }

    if (btn.classList.contains('modal-prev') && currentCardIndex !== 1) {

      // remove current modal
      document.addEventListener('click', removeModal);

      const person = items.results.find(item => item.login.uuid === cards[currentCardIndex - 1].getAttribute('data-uuid'));
      gallery.insertAdjacentHTML('afterend', generateModal(person));

    }
  });

});

document.addEventListener('click', removeModal);
