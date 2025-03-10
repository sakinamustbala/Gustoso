// Function to add item to cart
function addToCart(itemId) {
    fetch('/add-to-cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId, quantity: 1 })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        updateCartCount(data.cartCount);
    })
    .catch(error => console.error('Error:', error));
}

// Function to update cart count in header
function updateCartCount(count) {
    document.getElementById('cart-count').innerText = count;
}