import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import "../../styles/expense.css";

interface Expense {
  id: number;
  category: { name: string };
  amount: number;
  description: string;
  expense_date: string;
  payment_mode: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  creator: { name: string; role: string };
  approver?: { name: string };
  remarks?: string;
}

interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
}

interface ExpenseSummary {
  total_amount: number;
  total_count: number;
  by_category: Record<string, { count: number; amount: number }>;
  by_status: Record<string, { count: number; amount: number }>;
  by_payment_mode: Record<string, { count: number; amount: number }>;
}

const ExpenseManagement: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [showNewExpenseForm, setShowNewExpenseForm] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    category_id: "",
    status: "",
    payment_mode: "",
  });

  // Form states
  const [newExpense, setNewExpense] = useState({
    category_id: "",
    amount: "",
    description: "",
    expense_date: "",
    payment_mode: "CASH",
    transaction_id: "",
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/expenses?${queryParams}`);
      setExpenses(response.data.expenses);
      setSummary(response.data.summary);
    } catch (error) {
      toast.error("Failed to fetch expenses");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/expenses/categories");
      setCategories(response.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/expenses", newExpense);
      toast.success("Expense created successfully");
      setShowNewExpenseForm(false);
      setNewExpense({
        category_id: "",
        amount: "",
        description: "",
        expense_date: "",
        payment_mode: "CASH",
        transaction_id: "",
      });
      fetchExpenses();
    } catch (error) {
      toast.error("Failed to create expense");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/expenses/categories", newCategory);
      toast.success("Category created successfully");
      setShowNewCategoryForm(false);
      setNewCategory({ name: "", description: "" });
      fetchCategories();
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  const handleExpenseAction = async (
    id: number,
    action: "APPROVED" | "REJECTED",
    remarks?: string
  ) => {
    try {
      await api.patch(`/expenses/${id}/status`, { status: action, remarks });
      toast.success(`Expense ${action.toLowerCase()} successfully`);
      fetchExpenses();
    } catch (error) {
      toast.error(`Failed to ${action.toLowerCase()} expense`);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Expense deleted successfully");
      fetchExpenses();
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };

  return (
    <div className="expense-management">
      <h1>Expense Management</h1>

      <div className="expense-actions">
        <button onClick={() => setShowNewExpenseForm(!showNewExpenseForm)}>
          {showNewExpenseForm ? "Cancel" : "New Expense"}
        </button>
        <button onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}>
          {showNewCategoryForm ? "Cancel" : "New Category"}
        </button>
      </div>

      {showNewExpenseForm && (
        <form className="expense-form" onSubmit={handleCreateExpense}>
          <h2>New Expense</h2>
          <select
            required
            value={newExpense.category_id}
            onChange={(e) =>
              setNewExpense({ ...newExpense, category_id: e.target.value })
            }
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount"
            required
            value={newExpense.amount}
            onChange={(e) =>
              setNewExpense({ ...newExpense, amount: e.target.value })
            }
          />

          <textarea
            placeholder="Description"
            required
            value={newExpense.description}
            onChange={(e) =>
              setNewExpense({ ...newExpense, description: e.target.value })
            }
          />

          <input
            type="date"
            required
            value={newExpense.expense_date}
            onChange={(e) =>
              setNewExpense({ ...newExpense, expense_date: e.target.value })
            }
          />

          <select
            value={newExpense.payment_mode}
            onChange={(e) =>
              setNewExpense({ ...newExpense, payment_mode: e.target.value })
            }
          >
            <option value="CASH">Cash</option>
            <option value="CHEQUE">Cheque</option>
            <option value="ONLINE">Online</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="UPI">UPI</option>
          </select>

          <input
            type="text"
            placeholder="Transaction ID (optional)"
            value={newExpense.transaction_id}
            onChange={(e) =>
              setNewExpense({ ...newExpense, transaction_id: e.target.value })
            }
          />

          <button type="submit">Create Expense</button>
        </form>
      )}

      {showNewCategoryForm && (
        <form className="category-form" onSubmit={handleCreateCategory}>
          <h2>New Category</h2>
          <input
            type="text"
            placeholder="Category Name"
            required
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
          />
          <textarea
            placeholder="Description (optional)"
            value={newCategory.description}
            onChange={(e) =>
              setNewCategory({ ...newCategory, description: e.target.value })
            }
          />
          <button type="submit">Create Category</button>
        </form>
      )}

      <div className="expense-filters">
        <input
          type="date"
          placeholder="Start Date"
          value={filters.start_date}
          onChange={(e) =>
            setFilters({ ...filters, start_date: e.target.value })
          }
        />
        <input
          type="date"
          placeholder="End Date"
          value={filters.end_date}
          onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
        />
        <select
          value={filters.category_id}
          onChange={(e) =>
            setFilters({ ...filters, category_id: e.target.value })
          }
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select
          value={filters.payment_mode}
          onChange={(e) =>
            setFilters({ ...filters, payment_mode: e.target.value })
          }
        >
          <option value="">All Payment Modes</option>
          <option value="CASH">Cash</option>
          <option value="CHEQUE">Cheque</option>
          <option value="ONLINE">Online</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="UPI">UPI</option>
        </select>
        <button onClick={fetchExpenses}>Apply Filters</button>
      </div>

      {summary && (
        <div className="expense-summary">
          <h2>Summary</h2>
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Total</h3>
              <p>Amount: ₹{summary.total_amount}</p>
              <p>Count: {summary.total_count}</p>
            </div>
            <div className="summary-card">
              <h3>By Category</h3>
              {Object.entries(summary.by_category).map(([cat, data]) => (
                <div key={cat}>
                  <p>
                    {cat}: ₹{data.amount} ({data.count} items)
                  </p>
                </div>
              ))}
            </div>
            <div className="summary-card">
              <h3>By Status</h3>
              {Object.entries(summary.by_status).map(([status, data]) => (
                <div key={status}>
                  <p>
                    {status}: ₹{data.amount} ({data.count} items)
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="expense-list">
        <h2>Expenses</h2>
        <div className="expense-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Payment Mode</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr
                  key={expense.id}
                  className={`status-${expense.status.toLowerCase()}`}
                >
                  <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
                  <td>{expense.category.name}</td>
                  <td>₹{expense.amount}</td>
                  <td>{expense.description}</td>
                  <td>{expense.payment_mode}</td>
                  <td>{expense.status}</td>
                  <td>{expense.creator.name}</td>
                  <td className="expense-actions">
                    {expense.status === "PENDING" && (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() =>
                            handleExpenseAction(expense.id, "APPROVED")
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => {
                            const remarks = window.prompt(
                              "Enter rejection remarks:"
                            );
                            if (remarks !== null) {
                              handleExpenseAction(
                                expense.id,
                                "REJECTED",
                                remarks
                              );
                            }
                          }}
                        >
                          Reject
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {expense.remarks && (
                      <div className="remarks">Remarks: {expense.remarks}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseManagement;
