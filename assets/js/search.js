var spoonKey = "5a7f763992284d77b77935d7425e7be4"
var previousViewedRecipes = [];
var totalPrice = 0;

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

function testSpoon() {
    let url = ` https://api.spoonacular.com/recipes/complexSearch?apiKey=${spoonKey}&query=pasta&maxFat=25&number=2`;
    fetch(url)
        .then(function (response) {
            if (response.status === 401) {
                console.log("You failed!");
            }
            return response.json();
        })
        .then(function (data) {
            console.log(data);
        });
}
// --------------- SpoonApi Calls --------------- //
function searchRecipes(searchText) {
    let url = ` https://api.spoonacular.com/recipes/complexSearch?apiKey=${spoonKey}&query=${searchText}&number=4`;
    fetch(url)
        .then(function (response) {
            if (response.status === 401) {
                console.log("You failed!");
            }
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            renderRecipes(data.results);
            // Call card render function.
        });
}

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
            console.log(data);
            //   renderRecipes(data.results);
            return data;
        });
    return output;
}



// ------------------- Modal Render -----------
function renderModal(searchResults) {
    $("#recipe-Url").attr("href", searchResults.sourceUrl);
    $("#recipe-title").text(searchResults.title);
    $("#recipe-image").attr("src", searchResults.image);
    $("#favorite-button").attr("data-recipe-id", searchResults.id);
    $("#favorite-button").attr("data-title", searchResults.title);
    $("#favorite-button").removeClass("has-text-danger");
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


        ingredients.push({
            name: searchResults.extendedIngredients[i].name,
            aisle: ingredientSection
        });
    }
    console.log(ingredients);
    getIngredients(ingredients);
    $("#recipe-display").removeClass("is-hidden");
    $("#loading-display").addClass("is-hidden");
    //calls render to previous divs button
    renderPreviousViewed(searchResults);
    return;
}
function displayModalLoading() {
    $("#recipe-display").addClass("is-hidden");
    $("#loading-display").removeClass("is-hidden");
    return;
}
// --------------- Load Modal -------------------
async function loadRecipeModal(buttonTarget) {
    displayModalLoading();
    let recipeInfo = await findRecipeInfo(buttonTarget.getAttribute("data-recipe-id"));
    renderModal(recipeInfo);
}
// --------------- favorite Recipe functionality ------------------------
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
    $("#favorites-dropdown").on("click", ".navbar-item", async function (event) {
        event.preventDefault();
        //console.log(event.target.getAttribute("recipe-id"));
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
})

// --------------- Kroger API Calls | Ezequiel -----------------------
async function getIngredients(productsArray) {
    $("#ingredientCostList").empty();
    totalPrice = 0;
    productsArray.forEach(element => {
        $("#ingredientCostList").append("<li>...</li>");
    });
    let key = await krogerOAuth();
    console.log(key);
    for (var i = 0; i < productsArray.length; i++) {
        if(i%6 === 0){
            key = await new Promise(resolve => setTimeout(resolve, 500));
            key = await krogerOAuth();
        }
        krogerProductSearch(productsArray[i], key.access_token, i);
    }
    $("#ingredientCost").append($("<span>").text(`Total Cost: ${totalPrice}`));
}

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
        console.log("OAuth \n -----------");
        console.log(response);
        return response.access_token;
    });
    return output;
}

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
    $.ajax(settings).done(function (response) {
        console.log(response);
        let productPrice = 0;
        let productName = "Could not be found";
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
                }
            }
        }
        renderKrogerIngredientCost(productPrice, productName, index)
        totalPrice += productPrice;
        $("#ingredientCost").text(`Total Cost: ${totalPrice.toFixed(2)}`);
    }).fail(function () {
        let productPrice = 0;
        let productName = "Could not be found";
        renderKrogerIngredientCost(productPrice, productName, index)
    });

    return;
}

// --------------- Render Ingredient Cost List | Ezequiel --------------------

function renderKrogerIngredientCost(price, product, index) {
    var listNode = `${product} - ${price}`;
    $("#ingredientCostList").children().eq(index).text(listNode);


    return;
}

// --------------- Recipe call on submit click - Billy ------------------
$(function () {
    // Load recipe search.
    let loadSearch = document.location.search;
    if (loadSearch) {
        let recipeSearch = loadSearch.split("=");
        if (recipeSearch[0] === "?search") {
            searchRecipes(recipeSearch[1]);
        }
        else if (recipeSearch[0] === "?find") {
            findRecipeInfo(recipeSearch[1]);
        }
    }
})
// --------------- Recipe call on submit click - Billy ------------------
$(async function () {
    // Load recipe search.
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
});

// --------------- Recipe Render ---------------------
function renderRecipes(searchResults) {
    let display = $("#search-result-display");
    display.empty();
    for (let i = 0; i < searchResults.length; i++) {
        let recipe = searchResults[i];
        console.log(recipe);
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
            <a href="#" class="card-footer-item js-modal-trigger"
                data-target="modal-js-example" data-recipe-id=${recipe.id}>View</a>
        </footer>
    </div>
    </div>`);
        display.append(card);
    }
    (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
        const modal = $trigger.getAttribute("data-target");
        const $target = document.getElementById(modal);
        console.log($target);

        $trigger.addEventListener('click', (event) => {
            $target.classList.add('is-active');
            loadRecipeModal(event.target);
        });
    });
}
{/* <div class="column is-half">

<div class="card">
    <div class="card-image">
        <img src="${recipe.image}" alt="example-card">
    </div>
    <div class="card-content">
        <div class="content">
            <p>${recipe.title}</p>
        </div>
        <button class="js-modal-trigger button mx-auto" data-target="modal-js-example" data-recipe-id=${recipe.id}>view</button>
    </div>
</div>
</div> */}
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
//testSpoon();

// ---------------- Render Buttons for Previously Viewed Recipes | Ezequiel ---------------------
function renderPreviousViewed(recipe) {
    var numButtons = document.querySelectorAll(".previousRecipe");
    if (numButtons.length === 6) {
        numButtons[0].remove();
        previousViewedRecipes.shift();
    }

    var previousViewed = $("#previous-views");
    var buttonNode = $("<button>").addClass("button is-info is-light is-fullwidth previousRecipe");
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

// ---------------------- View History Event Listener | Ezequiel --------------------------
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
    console.log(recipePreviousIndex);
    if (node === "BUTTON" || node === "SPAN" || node === "I") {
        renderModal(previousViewedRecipes[recipePreviousIndex]);
        $("#modal-js-example").addClass("is-active");

    }

    return;
})