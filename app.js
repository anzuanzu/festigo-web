// 活動頁的倒數天數在瀏覽器裡算，網站不用每天重新產生
document.querySelectorAll('.countdown[data-start]').forEach(function (el) {
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var start = new Date(el.dataset.start + 'T00:00:00');
  var end = new Date(el.dataset.end + 'T00:00:00');
  var days = Math.round((start - today) / 86400000);
  if (days > 0) { el.textContent = el.dataset.template.replace('{n}', days); }
  else if (today <= end) { el.textContent = el.dataset.now; }
  else { el.hidden = true; }
});
// 篩選按鈕只影響同一個區塊（活動、地標、三星餐廳）的卡片
document.querySelectorAll('.filters button').forEach(function (button) {
  button.addEventListener('click', function () {
    var category = button.dataset.category;
    var section = button.closest('section');
    section.querySelectorAll('.filters button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b === button));
    });
    section.querySelectorAll('.card').forEach(function (card) {
      card.hidden = category !== 'all' && card.dataset.category !== category;
    });
  });
});
