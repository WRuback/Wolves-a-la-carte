// Used to access the Spoonacular API.
var spoonKey = "65e87ba760274dc0a6aa192e36144aac"
// Stores the favorited items from local storage.
var favoritedItems = [];
// Stores the recipes previously view in the session, from session storage.
var previousViewedRecipes = [];
// Stores the result of the Spoonacular Recipe search.
var recipeSearch = [];
// Stores the first index of the currently displayed search results.
var currentRecipeIndex = 0;
// Stores the total price of the current modal recipe display.
var totalPrice = 0;


// --------------- SpoonApi Calls --------------- //
// Gets the recipe search information, and calls the search render on success.
function searchRecipes(searchText) {
    let url = ` https://api.spoonacular.com/recipes/complexSearch?apiKey=${spoonKey}&query=${searchText}&number=20`;
    fetch(url)
        .then(function (response) {
            if (response.status === 401) {
                console.log("You failed!");
            }
            return response.json();
        })
        .then(function (data) {
            recipeSearch = data.results;
            currentRecipeIndex = 0;
            renderRecipes(recipeSearch,currentRecipeIndex);
            // Call card render function.
        });
}

// Gets the detailed recipe information, and returns it.
async function findRecipeInfo(recipeID) {
    let url = ` https://api.spoonacular.com/recipes/${recipeID}/information?apiKey=${spoonKey}&includeNutrition=false`;
    let output = await fetch(url)
        .then(function (response) {
            if (response.status === 401) {
                console.log("You failed!");
            }
            return response.json();
        })
        .then(function (data) {
            //   renderRecipes(data.results);
            return data;
        });
    return output;
}

// --------------- Kroger API Calls | Ezequiel -----------------------
// Loops through the given recipe list, gets the OAuthKey, and call the kroger search.
async function getIngredients(productsArray) {
    $("#ingredientCostList").empty();
    totalPrice = 0;
    productsArray.forEach(element => {
        $("#ingredientCostList").append("<li>...</li>");
    });
    let key = await krogerOAuth();
    // Spaces out the kroger search calls to not overload them, getting a new key every few products.
    for (var i = 0; i < productsArray.length; i++) {
        if(i%6 === 0 && i !== 0){
            key = await new Promise(resolve => setTimeout(resolve, 1000));
            key = await krogerOAuth();
        }
        krogerProductSearch(productsArray[i], key.access_token, i);
    }
    $("#ingredientCost").append($("<span>").text(`Approx. Total Cost: ${totalPrice}`));
}

// Gets the authorization key from Kroger. Needed to access there list.
async function krogerOAuth() {
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

    let output = await $.ajax(settings).done(function (response) {
        return response.access_token;
    });
    return output;
}

// Grabs search result from Kroger, searches through the results, and calls the render on the correct one.
function krogerProductSearch(product, token, index) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": `https://floating-headland-95050.herokuapp.com/https://api.kroger.com/v1/products?filter.brand=Kroger&filter.term=${product.name}&filter.locationId=01400943`,
        "method": "GET",
        "headers": {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
    let productPrice = 0;
    let productName = "Could not be found";
    $.ajax(settings).done(function (response) {

        if (response.data.length !== 0) {
            if (product.aisle === "") {
                productPrice = response.data[0].items[0].price.regular;
                productName = response.data[0].description;
            } else {
                for (const item in response.data) {
                    if (product.aisle == response.data[item].categories[0]) {
                        productPrice = response.data[item].items[0].price.regular;
                        productName = response.data[item].description;
                        break;
                    }
                    productPrice = response.data[0].items[0].price.regular;
                    productName = response.data[0].description;
                }
                
            }
        }
        renderKrogerIngredientCost(productPrice, productName, index)
        totalPrice += productPrice;
        $("#ingredientCost").text(`Approx. Total Cost: ${totalPrice.toFixed(2)}`);
    }).fail(function () {
        renderKrogerIngredientCost(productPrice, productName, index)
    });

    return;
}

// --------------- Render Ingredient Cost List | Ezequiel --------------------
// Renders the ingredient and price in the speific list section it belongs too.
function renderKrogerIngredientCost(price, product, index) {
    var listNode = `${product} - ${price}`;
    $("#ingredientCostList").children().eq(index).text(listNode);


    return;
}

// --------------- Recipe Render ---------------------
// Renders the search results, staggering the items being added so they fade in.
async function renderRecipes(searchResults, startIndex) {
    let display = $("#search-result-display");
    display.empty();
    renderScrollPosition();
    $("#scroll-buttons-bottom").addClass("is-hidden");
    $("#scroll-buttons-top").addClass("is-hidden");
    if (searchResults.length === 0){
        display.append(`<div class="column box"> 
        <div class = "content">
            <p class = "p-3"> Sorry, we could not find anything </p> </div> </div>`);
        return;
    }
    $("#scroll-buttons-top").removeClass("is-hidden");
    for (let i = startIndex; i < startIndex+4 && i < searchResults.length; i++) {
        let recipe = searchResults[i];
        let card = $(`<div class="column is-half">
        <div class="card recipe-card">
        <div class="card-image is-1by1 is-fullwidth">
            <img class="recipe-img is-fullwidth"
                src="${recipe.image}" alt="${recipe.title}">
        </div>
        <div class="card-content">
            <div class="content has-text-centered">${recipe.title}</div>
        </div>
        <footer class="card-footer">
            <a href="#" disabled class="card-footer-item js-modal-trigger"
                data-target="modal-js-example" data-recipe-id=${recipe.id}>View (Disabled)</a>
        </footer>
    </div>
    </div>`);
        display.append(card);
        card = await new Promise(resolve => setTimeout(resolve, 150));
    }
    $("#scroll-buttons-bottom").removeClass("is-hidden");
    // (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
    //     const modal = $trigger.getAttribute("data-target");
    //     const $target = document.getElementById(modal);

    //     $trigger.addEventListener('click', (event) => {
    //         $target.classList.add('is-active');
    //         loadRecipeModal(event.target);
    //     });
    // });
}

// Changes the scroll page display.
function renderScrollPosition(){
    $(".scroll-position").each(function(){
        $(this).text("Page " + Math.floor(((currentRecipeIndex + 1)/4)+1) + " of " + Math.ceil(recipeSearch.length/4));
    })
}

// --------------- Load Modal -------------------
// Renders the information for the modal, and finds the recipe.
async function loadRecipeModal(buttonTarget) {
    displayModalLoading();
    let recipeInfo = await findRecipeInfo(buttonTarget.getAttribute("data-recipe-id"));
    renderModal(recipeInfo);
}

// ------------------- Modal Render -----------
// Populates the modal with the recipe information, and calls for the kroger search, setting up the list section they will be placed in.
function renderModal(searchResults) {
    $("#recipe-Url").attr("href", searchResults.sourceUrl);
    $("#recipe-title").text(searchResults.title);
    $("#recipe-image").attr("src", searchResults.image);
    $("#favorite-button").attr("data-recipe-id", searchResults.id);
    $("#favorite-button").attr("data-title", searchResults.title);
    $("#favorite-button").removeClass("has-text-danger");
    $("#ingredientCost").text("Approx. Total Cost: Calc...")
    for (let i = 0; i < favoritedItems.length; i++) {
        if (favoritedItems[i].id == searchResults.id) {
            $("#favorite-button").addClass("has-text-danger");
        };
    }
    var ingredients = [];
    $("#ingredientList").empty();
    for (let i = 0; i < searchResults.extendedIngredients.length; i++) {
        $("#ingredientList").append($("<li>").text(searchResults.extendedIngredients[i].original));

        // Improve Search
        let ingredientSection = "";
        switch (searchResults.extendedIngredients[i].aisle) {
            case "Baking":
                ingredientSection = "Baking Goods";
                break;
            case "Milk, Eggs, Other Dairy":
                ingredientSection = "Dairy";
                break;
            case "Produce":
                ingredientSection = "Produce";
                break;
            default:
                ingredientSection = "";
        }
        if (searchResults.extendedIngredients[i].name === "eggs" || searchResults.extendedIngredients[i].name === "cream cheese") {
            ingredientSection = "Breakfast";
        }
        if (searchResults.extendedIngredients[i].name === "salt") {
            searchResults.extendedIngredients[i].name = "Iodized Salt";
        }
        if (searchResults.extendedIngredients[i].name === "baking soda") {
            searchResults.extendedIngredients[i].name = "pure baking soda";
        }


        ingredients.push({
            name: searchResults.extendedIngredients[i].name,
            aisle: ingredientSection
        });
    }
    getIngredients(ingredients);
    $("#recipe-display").removeClass("is-hidden");
    $("#loading-display").addClass("is-hidden");
    //calls render to previous divs button
    renderPreviousViewed(searchResults);
    sessionStorage.setItem("previousViewedRecipes",JSON.stringify(previousViewedRecipes));
    return;
}

// Puts up the loading screen for the modal.
function displayModalLoading() {
    $("#recipe-display").addClass("is-hidden");
    $("#loading-display").removeClass("is-hidden");
    return;
}

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

// Removes a favorite, then saves the removal and re-renders the list. 
function removeFavorite(recipeID) {
    let newFav = favoritedItems;
    for (let i = 0; i < newFav.length; i++) {
        if (newFav[i].id == recipeID) {
            newFav.splice(i, 1);
            break;
        }
    }
    favoritedItems = newFav;
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

// ---------------- Render Buttons for Previously Viewed Recipes | Ezequiel ---------------------
// Renders a new previous view button, and adds the item to the list.
function renderPreviousViewed(recipe) {
    var numButtons = document.querySelectorAll(".previousRecipe");
    if (numButtons.length === 6) {
        numButtons[0].remove();
        previousViewedRecipes.shift();
    }

    var previousViewed = $("#previous-views");
    var buttonNode = $("<button>").addClass("button is-info is-light is-fullwidth  content previousRecipe mx-5");
    var iconSpan = $("<span>").addClass("icon");
    var iconNode = $("<i>").addClass("fas fa-utensils");
    var titleSpan = $("<span>").text(recipe.title);

    iconSpan.append(iconNode);
    buttonNode.append(iconSpan);
    buttonNode.append(titleSpan);

    //checks if we already have the button
    for (var i = 0; i < numButtons.length; i++) {
        if (recipe.title === numButtons[i].innerText) {
            return;
        }
    }

    previousViewed.append(buttonNode);
    previousViewedRecipes.push(recipe);
    return;
}

// Setup Functions

// Sets up the autocomplete on the search bar.
function searchbarSetUp(){
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
}

// Sets up the favorite dropdown with the local storage items, 
// and on click events.
function favoritesSetUp(){
    pullFavorites();
    renderFavorites();
    $("#favorites-dropdown").on("click", ".navbar-item", async function (event) {
        event.preventDefault();
        let target = "";
        if (event.target.nodeName === "SPAN") {
            target = event.target.parentElement;
        } else if (event.target.nodeName === "I") {
            target = event.target.parentElement.parentElement;
        } else {
            target = event.target;
        }
        let recipeInfo = await findRecipeInfo(target.getAttribute("recipe-id"));
        const $target = document.getElementById("modal-js-example");
        $target.classList.add('is-active');
        renderModal(recipeInfo);

    });
}

// Sets up the like button on the modal.
function favoriteButtonSetUp(){
    $("#favorite-button").on("click", function (event) {
        let target = "";
        if (event.target.nodeName === "I") {
            target = event.target.parentElement;
        } else {
            target = event.target;
        }
        let button = $(target);
        if (button.hasClass("has-text-danger")) {
            button.removeClass("has-text-danger");
            removeFavorite(button.attr("data-recipe-id"));
        }
        else {
            button.addClass("has-text-danger");
            addFavorite(button.attr("data-title"), button.attr("data-recipe-id"));
        }
    });
}

// Sets up scroll buttons to scroll through lists when displayed.
function scrollButtonSetup(){
    $(".scroll-left").each(function(){
        $(this).on("click", function(){
            if(currentRecipeIndex !== 0){
                currentRecipeIndex = currentRecipeIndex-4;
                renderRecipes(recipeSearch, currentRecipeIndex);

            }
        });
    });
    $(".scroll-right").each(function(){
        $(this).on("click", function(){
            if(recipeSearch !== [] && currentRecipeIndex < recipeSearch.length-4){
                currentRecipeIndex = currentRecipeIndex+4;
                renderRecipes(recipeSearch, currentRecipeIndex);
            }
        });
    });
}

// Sets up the previous recipe aside, using session storage data.
function previousRecipeSetUp(){
    let storedViewedRecipes = JSON.parse(sessionStorage.getItem("previousViewedRecipes"));
    if(storedViewedRecipes !== null){
        for (const i in storedViewedRecipes) {
            renderPreviousViewed(storedViewedRecipes[i]);
        }
    }

    $("#previous-views").on("click", function (event) {
        var node = event.target.nodeName;
        var buttonList = document.querySelectorAll(".previousRecipe");
        if (node === "BUTTON") {
            for (var i = 0; i < buttonList.length; i++) {
                if (event.target === buttonList[i]) {
                    var recipePreviousIndex = i;
                    break;
                }
            }
        } else if (node === "SPAN") {
            for (var i = 0; i < buttonList.length; i++) {
                if (event.target.parentElement === buttonList[i]) {
                    var recipePreviousIndex = i;
                    break;
                }
            }
        } else if (node === "I") {
            for (var i = 0; i < buttonList.length; i++) {
                if (event.target.parentElement.parentElement === buttonList[i]) {
                    var recipePreviousIndex = i;
                    break;
                }
            }
        }
        if (node === "BUTTON" || node === "SPAN" || node === "I") {
            renderModal(previousViewedRecipes[recipePreviousIndex]);
            $("#modal-js-example").addClass("is-active");
    
        }
    
        return;
    });
}

// If given search or find in the url, preform the search or the find.
async function landingPageSearchCheckSetup(){
    let loadSearch = document.location.search;
    if (loadSearch) {
        let recipeSearch = loadSearch.split("=");
        if (recipeSearch[0] === "?search") {
            searchRecipes(recipeSearch[1]);
        }
        else if (recipeSearch[0] === "?find") {
            let recipeInfo = await findRecipeInfo(recipeSearch[1]);
            const $target = document.getElementById("modal-js-example");
            $target.classList.add('is-active');
            renderModal(recipeInfo);
        }
    }

    $("#search-bar-submit").on("click", function (event) {
        event.preventDefault();
        let searchParameter = $("#search-bar").val();
        searchRecipes(searchParameter);
        $("#search-bar").val("");
    })
}

// The functionality of the bulma modal. Code is from the Bulma Docs.
function bulmaModal(){
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
$(function(){
    searchbarSetUp();
    favoritesSetUp();
    favoriteButtonSetUp();
    previousRecipeSetUp();
    scrollButtonSetup();
    landingPageSearchCheckSetup();
    bulmaModal();
});