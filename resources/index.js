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
                let errorResponse = '<p>'+'Sorry, but the inventory could not be searched. Please try again later.'+'</p>';
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
        if (containingElement.tagName.toLowerCase() != expectedElementTag.toLowerCase()) return;

        /**
         * Edits the item with the given itemId and allows for further
         * commands when completed. If resulting in error, an error message is
         * placed on the HTML element of choice.
         * 
         * @param {Number} itemId - The id of the item to edit.
         * @param {String} newItemName - The new name for the item.
         * @param {Number} newItemQuantity - The new quantity for the item.
         * @param {Number} newItemAmount - The new amount for the item.
         * @param {function()} successCallback - The function performed when
         * the item has successfully been edited.
         * @param {HTMLElement} errorMessageElement - The element to put error
         * messages onto if failed.
         */
        function editItem(itemId, newItemName, newItemQuantity, newItemAmount, successCallback, errorMessageElement) {
            // console.log('Editing ' + itemId);
            const editItemURI = new String().concat(
                'id='+itemId,
                '&name='+newItemName,
                '&quantity='+newItemQuantity,
                '&amount='+newItemAmount,
            );
            fetch(window.location + 'inventory', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: encodeURI(editItemURI)
            }).then((response)=>{
                if (response.status === 500) {
                    let errorResponse = 'Sorry, but the item details could not be updated. Please try again later.';
                    response.text().then((responseString) => {
                        if (responseString != null && responseString != '')
                            errorResponse = responseString;
                    });
                    errorMessageElement.textContent = errorResponse;
                }
                if (response.status === 204) {
                    successCallback();
                }
                return response;
            });
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
                    errorMessageElement.textContent = errorResponse;
                }
                if (response.status === 204) {
                    successCallback();
                }
                return response;
            });
        }

        /**
         * Removes all elements with class ".open-menu", using a modern function.
         */
        function removeOpenMenus() {
            for(let openMenu of document.querySelectorAll('.open-menu'))
                openMenu.remove();
        }

        /**
         * Removes all programatically added rows.
         * 
         * @param {HTMLElement[]} rowElements - The array of HTMLElements to
         * remove.
         */
        function removeRows(rowElements) {
            for (let rowElement of rowElements)
                rowElement.remove();
        }

        for (let editElement of containingElement.getElementsByClassName('edit'))
            if (editElement.tagName.toLowerCase() == 'a'
                && editElement.parentElement.tagName.toLowerCase() == 'td') {
                editElement.addEventListener('click', (event) => {
                    event.preventDefault();
                    removeOpenMenus();
                    const parentRow = editElement.parentElement.parentElement;
                    const displayName = parentRow.children[0];
                    const displayQuantity = parentRow.children[1];
                    const displayAmount = parentRow.children[2];
                    const oldItemName = displayName.textContent;
                    const oldItemQuantity = displayQuantity.textContent;
                    const oldItemAmount = displayAmount.textContent;
                    const incomingRows = [
                        document.createElement('tr'),
                        document.createElement('tr'),
                        document.createElement('tr'),
                        document.createElement('tr'),
                    ];
                    incomingRows[0].classList.add('open-menu');
                    const incomingCells = [
                        document.createElement('td'),
                        document.createElement('td'),
                        document.createElement('td')
                    ];
                    incomingCells[0].colSpan = 3;
                    const actionMessage = document.createElement('strong');
                    actionMessage.textContent = 'Edit details as needed.';
                    incomingCells[0].append(actionMessage);
                    const saveButton = document.createElement('button');
                    saveButton.type = 'button';
                    saveButton.classList.add('save');
                    saveButton.textContent = 'Save'
                    // Trigger is put later in the code
                    const cancelButton = document.createElement('button');
                    cancelButton.type = 'button';
                    cancelButton.classList.add('link');
                    cancelButton.textContent = 'Cancel'
                    cancelButton.addEventListener('click', () => removeRows(incomingRows));
                    incomingCells[1].append(cancelButton);
                    incomingCells[2].append(saveButton);
                    for (let incomingCell of incomingCells)
                        incomingRows[0].append(incomingCell);
                    
                    incomingRows[1].classList.add('open-menu');
                    const incomingNameFieldCell = document.createElement('td');
                    incomingNameFieldCell.colSpan = 5;
                    const incomingNameFieldLabel = document.createElement('label');
                    incomingNameFieldLabel.for = 'edit-item-name';
                    incomingNameFieldLabel.textContent = 'Name';
                    const incomingNameFieldInput = document.createElement('input');
                    incomingNameFieldInput.type = 'text';
                    incomingNameFieldInput.id = 'edit-item-name';
                    incomingNameFieldInput.name = 'editedName';
                    incomingNameFieldInput.required = true;
                    incomingNameFieldInput.maxlength = 45;
                    incomingNameFieldInput.value = oldItemName;
                    incomingNameFieldCell.append(incomingNameFieldLabel, incomingNameFieldInput);
                    incomingRows[1].append(incomingNameFieldCell);

                    incomingRows[2].classList.add('open-menu');
                    const incomingQtyFieldCell = document.createElement('td');
                    incomingQtyFieldCell.colSpan = 5;
                    const incomingQtyFieldLabel = document.createElement('label');
                    incomingQtyFieldLabel.for = 'edit-item-quantity';
                    incomingQtyFieldLabel.textContent = 'Quantity';
                    const incomingQtyFieldInput = document.createElement('input');
                    incomingQtyFieldInput.type = 'number';
                    incomingQtyFieldInput.id = 'edit-item-quantity';
                    incomingQtyFieldInput.name = 'editedQuantity';
                    incomingQtyFieldInput.required = true;
                    incomingQtyFieldInput.min = 0;
                    incomingQtyFieldInput.step = 1;
                    incomingQtyFieldInput.max = 999999;
                    incomingQtyFieldInput.value = oldItemQuantity;
                    incomingQtyFieldCell.append(incomingQtyFieldLabel, incomingQtyFieldInput);
                    incomingRows[2].append(incomingQtyFieldCell);

                    incomingRows[3].classList.add('open-menu');
                    const incomingAmtFieldCell = document.createElement('td');
                    incomingAmtFieldCell.colSpan = 5;
                    const incomingAmtFieldLabel = document.createElement('label');
                    incomingAmtFieldLabel.for = 'edit-item-amount';
                    incomingAmtFieldLabel.textContent = 'Amount';
                    const incomingAmtFieldInput = document.createElement('input');
                    incomingAmtFieldInput.type = 'number';
                    incomingAmtFieldInput.id = 'edit-item-amount';
                    incomingAmtFieldInput.name = 'editedAmount';
                    incomingAmtFieldInput.required = true;
                    incomingAmtFieldInput.min = 0;
                    incomingAmtFieldInput.step = 0.01;
                    incomingAmtFieldInput.max = 999999999.99;
                    incomingAmtFieldInput.value = oldItemAmount;
                    incomingAmtFieldCell.append(incomingAmtFieldLabel, incomingAmtFieldInput);
                    incomingRows[3].append(incomingAmtFieldCell);

                    saveButton.addEventListener('click', () => {
                        removeRows(incomingRows);
                        editItem(editElement.dataset.id, incomingNameFieldInput.value,
                            incomingQtyFieldInput.value, incomingAmtFieldInput.value,
                            () => {
                                displayName.textContent = incomingNameFieldInput.value;
                                displayQuantity.textContent = incomingQtyFieldInput.value;
                                displayAmount.textContent = incomingAmtFieldInput.value;
                            }, actionMessage);
                    });

                    for (let index = incomingRows.length-1; index >= 0; index--)
                        parentRow.after(incomingRows[index]);
                });
            };
        
        for (let deleteElement of containingElement.getElementsByClassName('delete'))
            if (deleteElement.tagName.toLowerCase() == 'a'
                && deleteElement.parentElement.tagName.toLowerCase() == 'td') {
                deleteElement.addEventListener('click', (event) => {
                    event.preventDefault();
                    removeOpenMenus();
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
                    const deleteButton = document.createElement('button');
                    deleteButton.type = 'button';
                    deleteButton.classList.add('delete');
                    deleteButton.textContent = 'Delete'
                    deleteButton.addEventListener('click', () => {
                        incomingRow.remove();
                        deleteItem(deleteElement.dataset.id, () => {
                            incomingRow.remove();
                            parentRow.remove();
                        }, actionMessage);
                    });
                    const cancelButton = document.createElement('button');
                    cancelButton.type = 'button';
                    cancelButton.classList.add('link');
                    cancelButton.textContent = 'Cancel'
                    cancelButton.addEventListener('click', () => incomingRow.remove());
                    incomingCells[1].append(cancelButton);
                    incomingCells[2].append(deleteButton);
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
                let errorResponse = '<p>'+'Sorry, but the item could not be added. Please try again later.'+'</p>';
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
