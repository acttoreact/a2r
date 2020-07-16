import checkDependencies from '../../utils/checkDependencies';

/**
 * Check dependencies should return a boolean
 */
test('checkDependencies should return true or false', async (): Promise<void> => {
  const check = await checkDependencies();
  expect(check === true || check === false).toBeTruthy();
});

/**
 * Check dependencies should return a boolean
 */
test('checkDependencies should return false when checking missing library', async (): Promise<void> => {
  const check = await checkDependencies(['winrar']);
  expect(check).toEqual(false);
});