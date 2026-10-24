document.querySelectorAll('.filters button').forEach(function (button) {
  button.addEventListener('click', function () {
    var category = button.dataset.category;
    document.querySelectorAll('.filters button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b === button));
    });
    document.querySelectorAll('.card').forEach(function (card) {
      card.hidden = category !== 'all' && card.dataset.category !== category;
    });
  });
});
