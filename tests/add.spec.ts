import { add } from '../src/utils/add';

function hey(a: number) {
  console.log('hello');
  
}

it('adds 1 + 2 equal to 3', () => {
  expect(add(1, 2)).toBe(3);
});
