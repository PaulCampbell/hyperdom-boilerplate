var div;

module.exports = function() {
  if (div) {
    div.parentNode.removeChild(div);
  }

  div = document.createElement('div');
  div.className = 'test';

  document.body.appendChild(div);

  return div;
};

