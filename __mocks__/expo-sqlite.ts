const makeTx = () => ({
  executeSql: jest.fn((_sql: string, _args: unknown[], success?: (...args: unknown[]) => void) => {
    success?.({} as unknown, { rows: { _array: [], length: 0 } } as unknown);
  }),
});

export const openDatabase = jest.fn(() => ({
  transaction: jest.fn((callback: (tx: ReturnType<typeof makeTx>) => void) => {
    callback(makeTx());
  }),
  readTransaction: jest.fn((callback: (tx: ReturnType<typeof makeTx>) => void) => {
    callback(makeTx());
  }),
}));

export const openDatabaseSync = jest.fn(() => ({
  execSync: jest.fn(),
  runSync: jest.fn(),
  getAllSync: jest.fn(() => []),
  getFirstSync: jest.fn(() => null),
  closeSync: jest.fn(),
}));
