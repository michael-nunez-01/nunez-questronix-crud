document.addEventListener("DOMContentLoaded", function() {
    // DOM is completely ready for manipulation
    document.forms.namedItem("search-form").addEventListener("submit", function(event) {
        event.preventDefault();
        const itemName = this.elements.namedItem("name").value;
        const itemQuantity = this.elements.namedItem("quantity").value;
        const itemAmount = this.elements.namedItem("amount").value;
        const qtyCompare = this.elements.namedItem("quantityCompare").value;
        const amtCompare = this.elements.namedItem("amountCompare").value;

        let optionalData = '';
        optionalData = optionalData.concat('&makeMvpElement=true');
        const searchItemURI = ''.concat(
            'name='+itemName,
            '&quantity='+itemQuantity,
            '&amount='+itemAmount,
            '&quantityCompare='+qtyCompare,
            '&amountCompare='+amtCompare,
            optionalData,
        );

        fetch(window.location + 'inventory'.concat('?', searchItemURI), {
            method: 'GET'
        }).then((response)=>{
            if (response.status === 500) {
                let errorResponse = "<p>Sorry, but the inventory could not be searched. Please try again later.</p>";
                response.text().then((responseString) => {
                    if (responseString != null && responseString != '')
                        errorResponse = responseString;
                });
                document.getElementById("inventory-search-results").innerHTML = errorResponse;
            }
            if (response.status === 200) {
                response.text().then((responseString) => {
                    document.getElementById("inventory-search-results").innerHTML = responseString;
                });
            }
            return response;
        });
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
                let errorResponse = "<p>Sorry, but the item could not be added. Please try again later.</p>";
                response.text().then((responseString) => {
                    if (responseString != null && responseString != '')
                        errorResponse = responseString;
                });
                document.getElementById("inventory-add-results").innerHTML = errorResponse;
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
