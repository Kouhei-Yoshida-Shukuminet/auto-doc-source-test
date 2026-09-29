// 電卓の計算ロジック（DOM非依存）。UIは app.js、テストは tests/ から利用する。

export const OPERATORS = ['+', '-', '*', '/'];

export const initialState = Object.freeze({
  display: '0',
  stored: null,
  operator: null,
  waitingForOperand: false,
});

export function calculate(a, operator, b) {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return a / b;
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}

// 0.1 + 0.2 = 0.30000000000000004 のような浮動小数点誤差を表示上丸める
export function formatNumber(value) {
  return String(Number(value.toPrecision(12)));
}

export function reduce(state, action) {
  switch (action.type) {
    case 'digit':
      return inputDigit(state, action.value);
    case 'decimal':
      return inputDecimal(state);
    case 'operator':
      return inputOperator(state, action.value);
    case 'equals':
      return evaluate(state);
    case 'clear':
      return { ...initialState };
    default:
      return state;
  }
}

function inputDigit(state, digit) {
  if (state.waitingForOperand) {
    return { ...state, display: digit, waitingForOperand: false };
  }
  return { ...state, display: state.display === '0' ? digit : state.display + digit };
}

function inputDecimal(state) {
  if (state.waitingForOperand) {
    return { ...state, display: '0.', waitingForOperand: false };
  }
  if (state.display.includes('.')) return state;
  return { ...state, display: state.display + '.' };
}

function inputOperator(state, operator) {
  const current = Number(state.display);
  // 演算子の連続入力は最後の演算子で上書きする
  if (state.operator && state.waitingForOperand) {
    return { ...state, operator };
  }
  if (state.operator && state.stored !== null) {
    const result = calculate(state.stored, state.operator, current);
    return { display: formatNumber(result), stored: result, operator, waitingForOperand: true };
  }
  return { ...state, stored: current, operator, waitingForOperand: true };
}

function evaluate(state) {
  if (!state.operator || state.stored === null) return state;
  const result = calculate(state.stored, state.operator, Number(state.display));
  return { display: formatNumber(result), stored: null, operator: null, waitingForOperand: true };
}
