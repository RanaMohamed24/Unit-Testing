jest.mock('../paymentService');
jest.mock('../emailService');

const { placeOrder } = require('../orderService');
const { charge } = require('../paymentService');
const { sendOrderConfirmation } = require('../emailService');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('placeOrder', () => {

  test('valid order returns an object with orderId and transactionId', async () => {
    charge.mockResolvedValue({ success: true, transactionId: 'txn_mock_123' });
    sendOrderConfirmation.mockResolvedValue({ sent: true });

    const result = await placeOrder('user1', 'test@test.com', 100);

    expect(result).toHaveProperty('orderId');
    expect(result).toHaveProperty('transactionId');
    expect(result.transactionId).toBe('txn_mock_123');
    expect(result.orderId).toMatch(/^order_/);
  });

  test('sendOrderConfirmation is called with correct email and transactionId', async () => {
    charge.mockResolvedValue({ success: true, transactionId: 'txn_mock_456' });
    sendOrderConfirmation.mockResolvedValue({ sent: true });

    await placeOrder('user1', 'sara@test.com', 50);

    expect(sendOrderConfirmation).toHaveBeenCalledTimes(1);
    expect(sendOrderConfirmation).toHaveBeenCalledWith('sara@test.com', 'txn_mock_456');
  });

  test('amount of 0 throws "Invalid amount" and charge is never called', async () => {
    await expect(placeOrder('user1', 'test@test.com', 0))
      .rejects.toThrow('Invalid amount');

    expect(charge).not.toHaveBeenCalled();
  });

  test('negative amount throws "Invalid amount" and charge is never called', async () => {
    await expect(placeOrder('user1', 'test@test.com', -10))
      .rejects.toThrow('Invalid amount');

    expect(charge).not.toHaveBeenCalled();
  });

  // BONUS
  test('when charge returns { success: false }, throws "Payment failed" and email is never sent', async () => {
    charge.mockResolvedValue({ success: false });

    await expect(placeOrder('user1', 'test@test.com', 100))
      .rejects.toThrow('Payment failed');

    expect(sendOrderConfirmation).not.toHaveBeenCalled();
  });

});
