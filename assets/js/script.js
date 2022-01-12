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

