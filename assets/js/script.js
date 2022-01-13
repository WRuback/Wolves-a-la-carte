var spoonKey = "1c81601448cb47bfa0929677d1e9ea44"
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
    $("#search-bar-submit").on("click", function(event){
        event.preventDefault();
        let searchParameter = $("#search-bar").val();
        if(searchParameter !== ""){
          window.location.href = `./assets/html/search.html?search=${searchParameter}`;
        }
    })
});

var favoritedItems = [];

function pullFavorites() {
    var pulledFavorites = JSON.parse(localStorage.getItem("favorites"));
    pulledFavorites !== null? favoritedItems = pulledFavorites : null;

    //render favorites dropdown items
    return;
}

function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favoritedItems));
    return;
}

var render = function (template, node) {
	
};


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

function krogerOAuth(productsArray) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.kroger.com/v1/connect/oauth2/token",
        "method": "POST",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${btoa("alacarte-5eeec0e7609a3bd05dd6a26e58bf693c8345549143926607028:lVV6pPI3QIkf7Uy_oc71cuVIVSxeV5MSMDoUBgZH")}`
        },
        "data": {
          "grant_type": "client_credentials",
          "scope": "product.compact"
        }
    }
    
    $.ajax(settings).done(function (response) {
        console.log("OAuth \n -----------");
        console.log(response);
        for (var i=0; i<productsArray.length; i++){
            krogerProductSearch(productsArray[i], response.access_token);
        }
    });
    return;
}

function krogerProductSearch(product, token) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": `https://api.kroger.com/v1/products?filter.brand=Kroger&filter.term=${product}&filter.locationId=01400943`,
        "method": "GET",
        "headers": {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
    }
      
    $.ajax(settings).done(function (response) {
      console.log(response);
    });
    
    return;
}

