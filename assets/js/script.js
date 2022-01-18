// Used to access the Spoonacular API.
var spoonKey = "65e87ba760274dc0a6aa192e36144aac"
// Stores the favorited items from local storage.
var favoritedItems = [];

// --------------- favorite Recipe functionality ------------------------
// Pulls favorites from local storage.
function pullFavorites() {
  var pulledFavorites = JSON.parse(localStorage.getItem("favorites"));
  pulledFavorites !== null ? favoritedItems = pulledFavorites : null;
  return;
}

// Saves the favorites to local storage.
function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favoritedItems));
  return;
}

// Adds a new favorite, renders and saves it.
function addFavorite(recipeName, recipeID) {
  favoritedItems.push({
    name: recipeName,
    id: recipeID
  });
  saveFavorites();
  renderFavorites();
}

// Renders the favorite list into the dropdown.
function renderFavorites() {
  let favoriteList = $("#favorites-dropdown");
  favoriteList.empty()
  for (let i = 0; i < favoritedItems.length; i++) {
    let item = favoritedItems[i];
    let card = `<a class="navbar-item" recipe-id=${item.id}>
      <span class="icon">
          <i class="fas fa-utensils"></i>
      </span>
      <span>${item.name}</span>
      </a>`;
    favoriteList.append(card);

  }
};

// Setup Functions

// Sets up the autocomplete on the search bar, 
// and sets the search to go to the main page.
function searchbarSetUp() {
  $("#search-bar").autocomplete({
    source: function (request, response) {
      $.ajax({
        url: `https://api.spoonacular.com/recipes/autocomplete?apiKey=${spoonKey}&number=5&query=${request.term}`,
        dataType: "json",
        success: function (data) {
          response($.map(data, function (item) {
            return {
              value: item.title
            };
          }));
        }
      });
    }
  });

  $("#search-bar-submit").on("click", function (event) {
    event.preventDefault();
    let searchParameter = $("#search-bar").val();
    if (searchParameter !== "") {
      window.location.href = `./search.html?search=${searchParameter}`;
    }
  })
}

// Sets up the favorite dropdown with the local storage items.
function favoritesSetUp() {
  pullFavorites();
  renderFavorites();
  $("#favorites-dropdown").on("click", ".navbar-item", function (event) {
    event.preventDefault();
    let target = "";
    if (event.target.nodeName === "SPAN") {
      target = event.target.parentElement;
    } else if (event.target.nodeName === "I") {
      target = event.target.parentElement.parentElement;
    } else {
      target = event.target;
    }
    window.location.href = `./search.html?find=${target.getAttribute("recipe-id")}`;
  });
}

// The functionality of the bulma modal. Code is from the Bulma Docs.
function buildModal() {

  // Functions to open and close a modal
  function openModal($el) {
    $el.classList.add('is-active');
  }

  function closeModal($el) {
    $el.classList.remove('is-active');
  }

  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener('click', () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => {
      closeModal($target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    const e = event || window.event;

    if (e.keyCode === 27) { // Escape key
      closeAllModals();
    }
  });

  $(".navbar-burger").click(function() {

    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");

});
}

// The Init Function to set up things on page load.
$(function () {
  searchbarSetUp();
  favoritesSetUp();
  buildModal();
});