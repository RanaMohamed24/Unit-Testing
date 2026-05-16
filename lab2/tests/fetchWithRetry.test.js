jest.mock('../apiClient');

const { fetchWithRetry } = require('../fetchWithRetry');
const { getData } = require('../apiClient');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('fetchWithRetry', () => {

  test('first attempt succeeds — getData called once, data returned', async () => {
    getData.mockResolvedValueOnce({ id: 1, name: 'Test' });

    const result = await fetchWithRetry('https://api.example.com/data');

    expect(result).toEqual({ id: 1, name: 'Test' });
    expect(getData).toHaveBeenCalledTimes(1);
  });

  test('first attempt fails, second succeeds — getData called twice', async () => {
    getData
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce({ id: 2, name: 'Retry Success' });

    const result = await fetchWithRetry('https://api.example.com/data');

    expect(result).toEqual({ id: 2, name: 'Retry Success' });
    expect(getData).toHaveBeenCalledTimes(2);
  });

  test('all 3 attempts fail — throws "Failed after 3 attempts" and getData called 3 times', async () => {
    getData
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockRejectedValueOnce(new Error('fail 3'));

    await expect(fetchWithRetry('https://api.example.com/data'))
      .rejects.toThrow('Failed after 3 attempts: fail 3');

    expect(getData).toHaveBeenCalledTimes(3);
  });

  // BONUS
  test('maxRetries = 1 with failing mock throws after exactly 1 call', async () => {
    getData.mockRejectedValueOnce(new Error('single fail'));

    await expect(fetchWithRetry('https://api.example.com/data', 1))
      .rejects.toThrow('Failed after 1 attempts: single fail');

    expect(getData).toHaveBeenCalledTimes(1);
  });

});
