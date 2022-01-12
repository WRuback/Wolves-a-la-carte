var spoonKey = "1c81601448cb47bfa0929677d1e9ea44"

function testSpoon(){
    let url = ` https://api.spoonacular.com/recipes/complexSearch?apiKey=${spoonKey}&query=pasta&maxFat=25&number=2`;
    fetch(url)
        .then(function(response){
            if(response.status === 401)
            {
                console.log("You failed!");
            }
            return response.json();
        })
        .then(function(data){
            console.log(data);
        });
}

//testSpoon();