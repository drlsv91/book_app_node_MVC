const deleteProduct = async (btn) => {
  const productId = btn.parentNode.querySelector('[name=id]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
  const productElement = btn.closest('tr');
  let result = await fetch('/admin/product/' + productId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf,
    },
  });
  result = await result.json();
  productElement.parentNode.removeChild(productElement);
  console.log(result);
};
