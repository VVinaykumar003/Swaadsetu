import { useState } from "react";
import { addWaiter } from "../../../../api/admin/add.waiter";
export default function AddStaffModal({ isOpen, onClose, onAddStaff }) {
  // Local form state
  const [name, setName] = useState("");
  const [shift, setShift] = useState("");
  const [loading, setLoading] = useState(false);
  const rid=import.meta.env.VITE_RID;

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!name) {
    alert("Please fill in waiter name");
    return;
  }
  if (!rid) {
    alert("Restaurant ID missing");
    return;
  }

  setLoading(true);
  try {
    const res = await addWaiter({ name, shift }, rid);
    const addedName = res.waiterNames?.slice(-1)[0] || name; // last waiter name or input name

    alert(`Waiter ${addedName} added successfully!`); // give user feedback

    setName("");
    setShift("");
    onClose();
  } catch (error) {
    console.error("Add waiter error caught:", error);

    if (error?.response?.status === 429) {
      alert("Too many requests. Please wait and try again.");
    } else if (error.message) {
      alert("Failed to add waiter: " + error.message);
    } else {
      alert("Failed to add waiter due to unknown error.");
    }
  } finally {
    setLoading(false);
  }
};




  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50">
      <div className="bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Add Staff</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-primary bg-white w-full rounded border-gray-300 p-2"
              placeholder="Staff full name"
              required
            />
          </div>
         
          <div>
            <label className="block mb-1 font-semibold">Shift</label>
            <input
              type="text"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="input input-primary bg-white  w-full rounded border-gray-300 p-2"
              placeholder="Staff shift"
              
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline px-4 py-2 rounded"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50`}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Waiter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
