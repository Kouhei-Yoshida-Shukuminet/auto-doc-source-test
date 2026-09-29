import { initialState, reduce } from './calculator.js';

let state = { ...initialState };

const display = document.querySelector('#display');
const keys = document.querySelector('.keys');

function render() {
  display.textContent = state.display;
}

function dispatch(action) {
  state = reduce(state, action);
  render();
}

keys.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const { type, value } = button.dataset;
  dispatch({ type, value });
});

// キーボード操作（数字・演算子・Enter・Escape）
document.addEventListener('keydown', (event) => {
  const { key } = event;
  if (/^[0-9]$/.test(key)) dispatch({ type: 'digit', value: key });
  else if (key === '.') dispatch({ type: 'decimal' });
  else if (['+', '-', '*', '/'].includes(key)) dispatch({ type: 'operator', value: key });
  else if (key === 'Enter' || key === '=') dispatch({ type: 'equals' });
  else if (key === 'Escape') dispatch({ type: 'clear' });
});

render();
