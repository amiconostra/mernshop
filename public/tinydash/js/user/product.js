const deleteProduct = (btn) => {
    const productId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

    const productElement = btn.closest('tr');
    const dataText = document.getElementById('dataTable-1_info');

    const numbers = dataText.innerText.replace(/[^0-9]/g,'');
    dataText.innerText = `Showing ${numbers[0]} to ${--numbers[1]} of ${--numbers[2]} entries`;

    fetch(`/dashboard/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        productElement.parentNode.removeChild(productElement);
    })
    .catch(err => {
        console.log(err);
    });
};
