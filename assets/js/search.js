var spoonKey = "5a7f763992284d77b77935d7425e7be4"
var previousViewedRecipes = [];

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

function findRecipeInfo(recipeID) {
    let url = ` https://api.spoonacular.com/recipes/${recipeID}/information?apiKey=${spoonKey}&includeNutrition=false`;
    fetch(url)
        .then(function (response) {
            if (response.status === 401) {
                console.log("You failed!");
            }
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            //   renderRecipes(data.results);
            renderModal(data);
        });
}


// ------------------- Modal Render -----------
function renderModal(searchResults) {
    let display = $("#modal-js-example");
    display.empty();
    $("#recipe-Url").attr("href", searchResults.sourceUrl);
    $("#recipe-title").text(searchResults.title);
    $("#recipe-image").attr("src", searchResults.image);
    var ingredients = [];
    
    for (let i = 0; i < searchResults.extendedIngredients.length; i++) {
       $("#ingredientList").append($("<li>").text(searchResults.extendedIngredients[i].original));  
       ingredients.push(searchResults.extendedIngredients[i].name);  
    }

    // krogerOAuth(ingredients);
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
        <div class="card">
            <div class="card-image">
                <img src="${recipe.image}" alt="example-card">
            </div>
            <div class="card-content">
                <div class="content">
                    <p>${recipe.title}</p>
                </div>
                <button class="js-modal-trigger" data-target="modal-js-example" data-recipe-id=${recipe.id}></button>
            </div>
        </div>
    </div>`);
            display.append(card);
        }
        (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
            const modal = $trigger.getAttribute("data-target");
            const $target = document.getElementById(modal);
            console.log($target);

            $trigger.addEventListener('click', () => {
                $target.classList.add('is-active');
            });
        });
    }

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
        if (previousViewedRecipes.length === 0) {
            var savedIndex = 0;
        } else {
            var savedIndex = previousViewedRecipes.length;
        }
        previousViewedRecipes.push(recipe);
        var previousViewed = $("#previous-views");

        var buttonNode = $("<button>").addClass("button is-info is-light is-fullwidth").attr("data-index", savedIndex);
        var iconSpan = $("<span>").addClass("icon");
        var iconNode = $("<i>").addClass("fas fa-utensils");
        var titleSpan = $("<span>").text(/* Added recipe title Here */);

        iconSpan.append(iconNode);
        buttonNode.append(iconSpan);
        buttonNode.append(titleSpan);
        previousViewed.append(buttonNode);

        return;
    }