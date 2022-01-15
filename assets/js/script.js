var spoonKey = "5a7f763992284d77b77935d7425e7be4"
// Autocomplete on searchbar.
$(function () {
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
});

// Going to the search page from the search button.
$(function () {
  $("#search-bar-submit").on("click", function (event) {
    event.preventDefault();
    let searchParameter = $("#search-bar").val();
    if (searchParameter !== "") {
      window.location.href = `./search.html?search=${searchParameter}`;
    }
  })
});

// Favorite Items
var favoritedItems = [];

function pullFavorites() {
  var pulledFavorites = JSON.parse(localStorage.getItem("favorites"));
  pulledFavorites !== null ? favoritedItems = pulledFavorites : null;
  return;
}

function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favoritedItems));
  return;
}

function addFavorite(recipeName, recipeID) {
  favoritedItems.push({
    name: recipeName,
    id: recipeID
  });
  saveFavorites();
  renderFavorites();
}

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

$(function () {
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
})

// ---------------Modal functionality - Cole ---------------------------
document.addEventListener('DOMContentLoaded', () => {
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
    console.log($target);

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
});


// --------- Static boxes ----------

// const wolvesRecommended1 = { title: "Pizza", cost: "$24.99", staticImage: "./assets/img/pizza.jpeg" };

// $("#title1").text(wolvesRecommended1.title);
// $("#totalCost").text(wolvesRecommended1.cost);
// $("#staticImage").attr("src", wolvesRecommended1.staticImage)

// const wolvesRecommended2 = { title: "Burger", cost: "$10.99", staticImage: "https://assets.epicurious.com/photos/57c5c6d9cf9e9ad43de2d96e/master/w_1280,c_limit/the-ultimate-hamburger.jpg" };

// $("#title2").text(wolvesRecommended2.title);
// $("#totalCost2").text(wolvesRecommended2.cost);
// $("#staticImage2").attr("src", wolvesRecommended2.staticImage)

// const wolvesRecommended3 = { title: "Cheese Board", cost: "$30.99", staticImage: "https://cdn.pixabay.com/photo/2016/09/15/19/24/salad-1672505_960_720.jpg" };

// $("#title3").text(wolvesRecommended3.title);
// $("#totalCost3").text(wolvesRecommended3.cost);
// $("#staticImage3").attr("src", wolvesRecommended3.staticImage)

