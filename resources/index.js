document.addEventListener('DOMContentLoaded', function() {
    // DOM is completely ready for manipulation
    document.forms.namedItem('search-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const itemName = this.elements.namedItem('name').value;
        const itemQuantity = this.elements.namedItem('quantity').value;
        const itemAmount = this.elements.namedItem('amount').value;
        const qtyCompare = this.elements.namedItem('quantityCompare').value;
        const amtCompare = this.elements.namedItem('amountCompare').value;

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
                let errorResponse = '<p>Sorry, but the inventory could not be searched. Please try again later.</p>';
                response.text().then((responseString) => {
                    if (responseString != null && responseString != '')
                        errorResponse = responseString;
                });
                document.getElementById('inventory-search-results').innerHTML = errorResponse;
            }
            if (response.status === 200) {
                response.text().then((responseString) => {
                    document.getElementById('inventory-search-results').innerHTML = responseString;
                    enableAppendedFunctions(
                        document.getElementById('inventory-search-results').firstElementChild,
                        'table'
                    );
                });
            }
            return response;
        });
    });

    /**
     * This enables any functionality provided by additional triggers, like
     * buttons. This is designed for tables with repeating buttons activating
     * different items.
     * 
     * @param {HTMLElement} containingElement - The element to find appendable
     * functionality in.
     * @param {String} expectedElementTag - The element tag name to perform
     * appended functionality to. If not matching, nothing will be done.
     */
    function enableAppendedFunctions(containingElement, expectedElementTag) {
        console.log(containingElement.tagName.toLowerCase());
        console.log(expectedElementTag.toLowerCase());
        if (containingElement.tagName.toLowerCase() != expectedElementTag.toLowerCase()) return;

        function editItem(event) {
            // TODO Perform function here
        }

        /**
         * Deletes the item with the given itemId, and allows for further
         * commands when completed. If resulting in error, an error message is
         * placed on the HTML element of choice.
         * 
         * @param {Number} itemId - The id number of the item to remove.
         * @param {function()} successCallback - The function to call when deletion is successful.
         * @param {HTMLElement} errorMessageElement - The HTML element to place any error messages onto.
         */
        function deleteItem(itemId, successCallback, errorMessageElement) {
            // console.log('Deleting ' + itemId);
            fetch(window.location + 'inventory', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: encodeURI('id=' + itemId)
            }).then((response)=>{
                if (response.status === 500) {
                    let errorResponse = 'Sorry, but the item could not be removed. Please try again later.';
                    response.text().then((responseString) => {
                        if (responseString != null && responseString != '')
                            errorResponse = responseString;
                    });
                    errorMessageElement.innerHTML = errorResponse;
                }
                if (response.status === 204) {
                    successCallback();
                }
                return response;
            });
        }

        /**
         * Removes a row and lets you do something else.
         * 
         * @param {HTMLElement} incomingRow - The menu row to be removed.
         * @param {function()?} callback - Allows for additional instructions after closing, when needed.
         */
        function closeRow(incomingRow, callback = null) {
            incomingRow.remove();
            if (callback != null) callback();
        }

        /**
         * Removes all elements with the class "open-menu".
         * 
         * @param {HTMLElement} containingElement - The container to look for
         * "open menus".
         */
        function preClick(containingElement) {
            for (let openMenus of containingElement.getElementsByClassName('open-menu'))
                openMenus.remove();
        }

        for (let editElement of containingElement.getElementsByClassName('edit'))
            if (editElement.tagName.toLowerCase() == 'a'
                && editElement.parentElement.tagName.toLowerCase() == 'td') {
                editElement.addEventListener('click', editItem);
            };
        
        for (let deleteElement of containingElement.getElementsByClassName('delete'))
            if (deleteElement.tagName.toLowerCase() == 'a'
                && deleteElement.parentElement.tagName.toLowerCase() == 'td') {
                deleteElement.addEventListener('click', (event) => {
                    event.preventDefault();
                    preClick(containingElement);
                    const parentRow = deleteElement.parentElement.parentElement;
                    const incomingRow = document.createElement('tr');
                    incomingRow.classList.add('open-menu');
                    const incomingCells = [
                        document.createElement('td'),
                        document.createElement('td'),
                        document.createElement('td')
                    ];
                    incomingCells[0].colSpan = 3;
                    const actionMessage = document.createElement('strong');
                    actionMessage.textContent = 'Delete this item?';
                    incomingCells[0].append(actionMessage);
                    const yesButton = document.createElement('button');
                    yesButton.type = 'button';
                    yesButton.classList.add('yes');
                    yesButton.textContent = 'Yes'
                    yesButton.addEventListener('click', () => {
                        incomingRow.remove();
                        deleteItem(deleteElement.dataset.id, () => {
                            closeRow(incomingRow, () => parentRow.remove());
                        }, actionMessage);
                    });
                    const noButton = document.createElement('button');
                    noButton.type = 'button';
                    noButton.classList.add('no');
                    noButton.textContent = 'No'
                    noButton.addEventListener('click', () => closeRow(incomingRow));
                    incomingCells[1].append(noButton);
                    incomingCells[2].append(yesButton);
                    for (let incomingCell of incomingCells)
                        incomingRow.append(incomingCell);
                    parentRow.after(incomingRow);
                });
            };
    }

    document.forms.namedItem('add-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const itemName = this.elements.namedItem('name').value;
        const itemQuantity = this.elements.namedItem('quantity').value;
        const itemAmount = this.elements.namedItem('amount').value;

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
                let errorResponse = '<p>Sorry, but the item could not be added. Please try again later.</p>';
                response.text().then((responseString) => {
                    if (responseString != null && responseString != '')
                        errorResponse = responseString;
                });
                document.getElementById('inventory-add-results').innerHTML = errorResponse;
            }
            if (response.status === 201) {
                response.text().then((responseString) => {
                    document.getElementById('inventory-add-results').innerHTML = responseString;
                });
            }
            return response;
        });
    });
})
