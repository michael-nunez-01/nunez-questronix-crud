document.addEventListener("DOMContentLoaded", function() {
    // DOM is completely ready for manipulation
    document.forms.namedItem("search-form").addEventListener("submit", function(event) {
        event.preventDefault();
    });
    document.forms.namedItem("add-form").addEventListener("submit", function(event) {
        event.preventDefault();
        const itemName = this.elements.namedItem("name").value;
        const itemQuantity = this.elements.namedItem("quantity").value;
        const itemAmount = this.elements.namedItem("amount").value;

        let optionalData = '';
        optionalData = optionalData.concat('&makeMvpElement=true');
        const addItemURI = ''.concat(
            'name='+itemName,
            '&quantity='+itemQuantity,
            '&amount='+itemAmount,
            optionalData,
        );

        fetch(window.location + 'inventory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: encodeURI(addItemURI)
        }).then((response)=>{
            if (response.status === 500) {
                document.getElementById("inventory-add-results").innerHTML =
                    "<p>Sorry, but the item could not be added. Please try again later.</p>";
            }
            if (response.status === 201) {
                response.text().then((responseString) => {
                    document.getElementById("inventory-add-results").innerHTML = responseString;
                });
            }
            return response;
        });
    });
})
