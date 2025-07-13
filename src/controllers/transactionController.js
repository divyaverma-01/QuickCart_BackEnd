import Transaction from "../models/transaction.js";

// ✅ Create a new transaction
export const createTransaction = async (req, res) => {
  try {
    const { orderId, userId, amount, currency, status, paymentMethod } =
      req.body;

    const transaction = new Transaction({
      orderId,
      userId,
      amount,
      currency: currency || "INR",
      status: status || "pending",
      paymentMethod,
    });

    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Failed to create transaction" });
  }
};

// ✅ Get all transactions (admin use)
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("orderId", "total status")
      .populate("userId", "firstName lastName email");

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to retrieve transactions" });
  }
};

// ✅ Get a single transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id)
      .populate("orderId", "total status")
      .populate("userId", "firstName lastName email");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ message: "Failed to retrieve transaction" });
  }
};

// ✅ (Optional) Delete a transaction by ID
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Transaction.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Failed to delete transaction" });
  }
};

// ✅ Update transaction (admin only)
export const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedTx = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Return the updated document
    );

    if (!updatedTx) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(updatedTx);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};