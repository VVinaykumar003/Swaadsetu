import { useEffect, useState } from "react";
import { addMenuItem, fetchMenu } from "../../../../api/admin/menu.api";
import ModalWrapper from "./ModalWrapper";

export default function AddMenuItemModal({
  isOpen,
  onClose,
  rid,
  onItemAdded,
}) {
  const [item, setItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    isVegetarian: false,
    preparationTime: "",
  });
  const [categories, setCategories] = useState([]);
  const [existingItems, setExistingItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* ---------------------------------------------------------------------- */
  // Fetch categories and existing items from backend
  useEffect(() => {
    async function loadMenuData() {
      try {
        const data = await fetchMenu(rid);
        if (data) {
          setCategories(data.categories || []);
          setExistingItems(data.menu || []);
        }
      } catch (err) {
        console.warn("⚠️ Failed to fetch menu:", err);
      }
    }
    if (isOpen) loadMenuData();
  }, [isOpen, rid]);

  /* ---------------------------------------------------------------------- */
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const itemData = {
        ...item,
        price: Number(item.price),
        preparationTime: item.preparationTime
          ? Number(item.preparationTime)
          : undefined,
      };

      const result = await addMenuItem(rid, itemData);
      if (typeof onItemAdded === "function") onItemAdded(result.item);

      setItem({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        isVegetarian: false,
        preparationTime: "",
      });
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || "❌ Failed to add menu item.");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  return (
    <ModalWrapper title="Add Menu Item" isOpen={isOpen} onClose={onClose}>
      {success && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 bg-white rounded-xl shadow-lg px-6 py-8 flex flex-col items-center">
            <div className="text-4xl mb-2 text-green-500">✅</div>
            <div className="font-bold text-lg text-green-700 mb-1">
              Menu Item Added!
            </div>
            <div className="text-slate-600 text-sm">
              Your new menu item has been saved.
            </div>
          </div>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-5 text-black">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-sm font-medium">Item Name</label>
            <input
              type="text"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Paneer Tikka"
              value={item.name}
              onChange={(e) => setItem({ ...item, name: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Grilled paneer cubes marinated in Indian spices."
              rows={3}
              value={item.description}
              onChange={(e) =>
                setItem({ ...item, description: e.target.value })
              }
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-sm font-medium">Price (₹)</label>
            <input
              type="number"
              min="0"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Enter price"
              value={item.price}
              onChange={(e) => setItem({ ...item, price: e.target.value })}
              required
            />
          </div>

          {/* Image */}
          <div>
            <label className="text-sm font-medium">Image URL</label>
            <input
              type="url"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="https://example.com/images/paneer.jpg"
              value={item.image}
              onChange={(e) => setItem({ ...item, image: e.target.value })}
            />
          </div>

          {/* Vegetarian */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={item.isVegetarian}
              onChange={(e) =>
                setItem({ ...item, isVegetarian: e.target.checked })
              }
              className="w-5 h-5 accent-green-500"
            />
            <label className="font-medium text-sm">Vegetarian</label>
          </div>

          {/* Preparation Time */}
          <div>
            <label className="text-sm font-medium">
              Preparation Time (mins)
            </label>
            <input
              type="number"
              min="0"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., 20"
              value={item.preparationTime}
              onChange={(e) =>
                setItem({ ...item, preparationTime: e.target.value })
              }
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
              value={item.category}
              onChange={(e) => setItem({ ...item, category: e.target.value })}
              required
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Existing Items Display */}
          {existingItems.length > 0 && (
            <div className="mt-6 bg-gray-50 p-3 rounded-md border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2">
                Existing Menu Items ({existingItems.length})
              </h4>
              <div className="max-h-[160px] overflow-y-auto space-y-1">
                {existingItems.map((it) => (
                  <div
                    key={it.itemId}
                    className="text-sm text-gray-600 flex justify-between"
                  >
                    <span>{it.name}</span>
                    <span className="text-gray-400">₹{it.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-yellow-400 text-black font-semibold hover:bg-yellow-500 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      )}
    </ModalWrapper>
  );
}
