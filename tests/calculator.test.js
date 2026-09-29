import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculate, formatNumber, initialState, reduce } from '../src/calculator.js';

function press(...keys) {
  return keys.reduce((state, key) => {
    if (/^[0-9]$/.test(key)) return reduce(state, { type: 'digit', value: key });
    if (key === '.') return reduce(state, { type: 'decimal' });
    if (key === '=') return reduce(state, { type: 'equals' });
    if (key === 'C') return reduce(state, { type: 'clear' });
    return reduce(state, { type: 'operator', value: key });
  }, { ...initialState });
}

test('四則演算', () => {
  assert.equal(calculate(2, '+', 3), 5);
  assert.equal(calculate(2, '-', 3), -1);
  assert.equal(calculate(2, '*', 3), 6);
  assert.equal(calculate(6, '/', 3), 2);
});

test('キー入力で加算できる', () => {
  assert.equal(press('1', '2', '+', '3', '=').display, '15');
});

test('キー入力で減算・乗算・除算できる', () => {
  assert.equal(press('9', '-', '4', '=').display, '5');
  assert.equal(press('7', '*', '6', '=').display, '42');
  assert.equal(press('8', '/', '2', '=').display, '4');
});

test('連続計算は左から順に評価する', () => {
  assert.equal(press('2', '+', '3', '*', '4', '=').display, '20');
});

test('小数を扱える', () => {
  assert.equal(press('0', '.', '1', '+', '0', '.', '2', '=').display, '0.3');
  assert.equal(formatNumber(0.1 + 0.2), '0.3');
});

test('クリアで初期状態に戻る', () => {
  assert.deepEqual(press('1', '+', '2', 'C'), { ...initialState });
});
