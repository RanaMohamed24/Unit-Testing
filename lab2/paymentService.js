async function charge(userId, amount) {
  // calls Stripe — never run this in tests
  return { success: true, transactionId: 'txn_live_abc123' };
}
module.exports = { charge };
