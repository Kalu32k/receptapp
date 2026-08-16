let counter = 0;
export const resetCounter = () => { counter = 0; };
const v4 = jest.fn(() => `mock-uuid-${++counter}`);
export { v4 };
export default { v4 };
