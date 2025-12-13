import  { useEffect, useState } from "react";
import { getRecentBills } from "../../../../api/admin/admin.api";
import AddStaffModal from "../modals/AddStaffMOdal";
import { getWaiters ,updateWaiters,deleteWaiter } from "../../../../api/admin/add.waiter";
import { CreditCard, Receipt, Clock, CheckCircle } from 'lucide-react';
import { UserPlus, Edit2, Trash2, Users } from 'lucide-react';



export default function MorePageAdminDashboard() {

   const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [billList ,setBillList] = useState([])

 
  const rid=import.meta.env.VITE_RID;
  const fetchStaffList = async () => {
    try {
      const data = await getWaiters(rid);
      setStaffList(data.waiterNames|| []);
    } catch (error) {
      console.error("Error fetching staff list:", error);
    }
  };

  useState(() => {
    fetchStaffList();
  }, [staffList]);


  const handleEdit = (index, name) => {
     if (!name) {
    alert("Please fill in waiter name");
    return;
  }
    const res = updateWaiters(rid);
    const addedName = res.waiterNames?.slice(-1)[0] || name; // last waiter name or input name

    alert(`Waiter ${addedName} added successfully!`); // give user feedback

    setName("");
    setShift("");
    onClose();
  alert(`Edit waiter: ${name} at index ${index}`);
};

const handleDelete = (index, name) => {
  deleteWaiter(name, rid);
  fetchStaffList();
  alert(`Delete waiter: ${name} at index ${index}`);
};

  const [billsSummary] = useState({
    activeBills: 3,
    paidToday: 12,
    revenueToday: 28540,
    avgBillValue: 359,
  });

 
  const [adminPin, setAdminPin] = useState("");
  const [taxRate, setTaxRate] = useState(5);
  const [serviceCharge, setServiceCharge] = useState(10);

  const handleSaveSettings = () => {
    // Perform save logic here
    alert("Settings saved");
  };

  const handleProcessPayment = (billId) => {
    alert(`Processing payment for bill ${billId}`);
  };

  // Fetch recent bills from backend
  const fetchRecentBills = async () => {
    try {
      const data = await getRecentBills(rid);
      if (Array.isArray(data)) {
        // Map raw data into UI-friendly format
        const formattedBills = data.map((bill) => {
          const itemsSummary = bill.items?.map((item, index) => {
  let modNames = "";
  if (item.modifiers && item.modifiers.length) {
    modNames = ` (+${item.modifiers.map((m) => m.name).join(", ")})`;
  }
  return (
    <div key={index}>
      {item.qty} × {item.name}
      {modNames}
    </div>
  );
}) || null;


          return {
            billId: bill._id,
            orderType: bill.tableId ? `Table ${bill.tableId}` : "Takeaway",
            customer: bill.staffAlias || "Customer",
            itemsSummary: itemsSummary || "No items",
            totalAmount: bill.totalAmount?.toFixed(2) || 0,
            status: bill.status || "unknown",
          };
        });
        setBillList(formattedBills);
      } else {
        setBillList([]);
      }
    } catch (error) {
      console.error("Error fetching recent bills:", error);
      setBillList([]);
    }
  };

  useEffect(()=>{
fetchRecentBills();
  },[])

  const handleAddStaff = () => {
  
  };

  

  return (
      <div className="min-h-full bg-white p-6 max-w-7xl mx-auto">
          <AddStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddStaff={handleAddStaff}
      />

      {/* name of each tab group should be unique */}
<div className="tabs tabs-box  mb-5 gap-1  bg-gray-200 text-black">
  {/* Staff Management Tab */}
  <input
    type="radio"
    name="my_tabs_6"
    className="tab    text-black bg-white"
    aria-label="Staff Management"
    defaultChecked
  />
  <div className="tab-content bg-white  border p-6 overflow-auto ">
  <section className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-yellow-400">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-black p-2 rounded-lg">
                  <Users size={28} className="text-yellow-400" />
                </div>
                <h2 className="text-3xl font-bold text-black">Staff Management</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-black hover:bg-gray-900 text-yellow-400 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <UserPlus size={20} />
                Add Staff
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full ">
              <thead>
                <tr className="bg-black">
                  <th className="px-8 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-8 py-4 text-center text-sm font-bold text-yellow-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-yellow-200 overflow-scroll ">
                {staffList.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-8 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users size={48} className="text-gray-300" />
                        <p className="text-gray-500 text-lg">No staff members found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  staffList.map((name, index) => (
                    <tr
                      key={index}
                      className="hover:bg-yellow-50 transition-colors duration-200"
                    >
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center justify-center w-10 h-10 bg-yellow-400 text-black font-bold rounded-full">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-lg font-semibold text-black">{name}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(index, name)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-md"
                            aria-label={`Edit ${name}`}
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(index, name)}
                            className="bg-black hover:bg-gray-900 text-yellow-400 font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-md"
                            aria-label={`Delete ${name}`}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with count */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-8 py-4">
            <div className="flex items-center justify-between">
              <span className="text-black font-semibold">
                Total Staff: <span className="font-bold text-xl">{staffList.length}</span>
              </span>
              <span className="text-black text-sm">
                Manage your team efficiently
              </span>
            </div>
          </div>
        </section>
  </div>

  {/* Bills Overview Tab */}
  <input
    type="radio"
    name="my_tabs_6"
    className="tab  text-black bg-white"
    aria-label="Bills Overview"
  />
  <div className="tab-content bg-white  border p-6 text-black">
    <section className="grid grid-cols-1 sm:grid-cols-4 gap-6">
      {[
        { label: "Active Bills", value: billsSummary.activeBills },
        { label: "Paid Today", value: billsSummary.paidToday },
        {
          label: "Revenue Today",
          value: `₹ ${billsSummary.revenueToday.toLocaleString()}`,
        },
        { label: "Avg Bill Value", value: `₹ ${billsSummary.avgBillValue}` },
      ].map((kpi) => (
        <div
          key={kpi.label}
          className="bg-white  rounded-xl shadow p-6 text-center"
        >
          <div className="text-3xl font-extrabold mb-2">{kpi.value}</div>
          <div className="text-gray-600 font-semibold">{kpi.label}</div>
        </div>
      ))}
    </section>
  </div>

  {/* System Settings Tab */}
  <input
    type="radio"
    name="my_tabs_6"
    className="tab  text-black bg-white"
    aria-label="System Settings"
  />
  <div className="tab-content bg-white  border p-6 text-black">
    <section className="bg-gray-100   rounded-xl shadow p-6 max-w-md mx-auto">
      <div className="flex  flex-col items-center justify-center mb-5">
      <h2 className="text-2xl font-semibold mb-4 text-center">System Settings</h2>
      <div className="bg-[#ffbe00] w-[20%] h-1 text-center items-center " ></div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveSettings();
        }}
        className="space-y-6"
      >
        {/* <div>
          <label className="block mb-2 font-semibold">Restaurant Name</label>
          <input
            type="text"
            className="input input-neutral bg-white w-full rounded border-gray-300 p-2"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
          />
        </div> */}

        <div>
          <label className="block mb-2 font-semibold">Admin PIN</label>
          <input
            type="password"
            className="input input-neutral bg-white  w-full rounded border-gray-300 p-2"
            value={adminPin}
            onChange={(e) => setAdminPin(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Tax Rate (%)</label>
          <input
            type="number"
            step="0.1"
            className="input input-neutral bg-white  w-full rounded border-gray-300 p-2"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value))}
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Service Charge (%)</label>
          <input
            type="number"
            step="0.1"
            className="input input-neutral bg-white  w-full rounded border-gray-300 p-2"
            value={serviceCharge}
            onChange={(e) => setServiceCharge(parseFloat(e.target.value))}
          />
        </div>

        <button
          type="submit"
          className="btn bg-[#ffbe00] hover:bg-amber-600 text-white font-bold py-2 px-4 rounded w-full"
        >
          Save Settings
        </button>
      </form>
    </section>
  </div>

  {/* Top Menu Items Tab */}
  {/* <input
    type="radio"
    name="my_tabs_6"
    className="tab  text-black bg-white"
    aria-label="Top Menu Items"
  />
  <div className="tab-content bg-white  border p-6 text-black">
    <section className="bg-white  rounded-xl shadow p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Top Menu Items</h2>
      {/* <ul>
        {menuItems.map((item) => (
          <li
            
            className="flex justify-between py-3 border-b border-gray-200 last:border-none"
          >
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-xs text-gray-500">{item.orders} orders</div>
            </div>
            <div className="text-right font-semibold">
              ₹ {item.revenue.toLocaleString()}
            </div>
          </li>
        ))}
      </ul> 

      <ul className="list bg-gray-100 rounded-box shadow-md">
  
  <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Most ordred items this week</li>
  {menuItems.map((item) =>(
    <li  key={item.id} className="list-row">
    <div><img className="size-10 rounded-box" src={PBM}/></div>
    <div>
      <div>{item.name}</div>
      <div className="text-xs uppercase font-semibold opacity-60">{item.orders} orders</div>
    </div>
    {/* <button className="btn btn-square btn-ghost">
      <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
    </button>
    <button className="btn btn-square btn-ghost">
      <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></g></svg>
    </button> 
  </li>
  )

  )}
  
  
  
  {/* <li className="list-row">
    <div><img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/4@94.webp"/></div>
    <div>
      <div>Ellie Beilish</div>
      <div className="text-xs uppercase font-semibold opacity-60">Bears of a fever</div>
    </div>
    <button className="btn btn-square btn-ghost">
      <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
    </button>
    <button className="btn btn-square btn-ghost">
      <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></g></svg>
    </button>
  </li>
  
  <li className="list-row">
    <div><img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/3@94.webp"/></div>
    <div>
      <div>Sabrino Gardener</div>
      <div className="text-xs uppercase font-semibold opacity-60">Cappuccino</div>
    </div>
    <button className="btn btn-square btn-ghost">
      <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
    </button>
    <button className="btn btn-square btn-ghost">
      <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></g></svg>
    </button>
  </li> 
  
</ul>
    </section>
  </div> */}

  {/* Recent Bills Tab */}
    <input
        type="radio"
        name="my_tabs_6"
        className="tab text-black bg-white"
        aria-label="Recent Bills"
      />
      <div className="tab-content bg-white border p-6 text-black">
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black text-yellow-400 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center gap-3 justify-center">
            <Receipt size={32} />
            <h2 className="text-3xl font-bold">Recent Bills</h2>
          </div>
        </div>

        <div className="space-y-4">
          {billList.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-gray-400 mb-3">
                <Receipt size={48} className="mx-auto" />
              </div>
              <p className="text-gray-500 text-lg">No recent bills found</p>
            </div>
          ) : (
            billList.map((bill) => (
              <div
                key={bill.billId}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-yellow-400"
              >
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Receipt size={20} className="text-black" />
                      <span className="font-bold text-black text-lg">{bill.billId}</span>
                    </div>
                    <span className="bg-black text-yellow-400 px-4 py-1 rounded-full text-sm font-semibold">
                      {bill.orderType}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <CreditCard size={24} className="text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 font-medium">Customer</div>
                      <div className="text-xl font-bold text-black">{bill.customer}</div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="text-sm text-gray-600 mb-1 font-medium">Items</div>
                    <div className="text-gray-800">{bill.itemsSummary}</div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t-2 border-yellow-200">
                    <div>
                      <div className="text-sm text-gray-500 font-medium mb-1">Total Amount</div>
                      <div className="text-3xl font-bold text-black">₹{bill.totalAmount}</div>
                    </div>
                    <div>
                      {bill.status.toLowerCase() === "paid" ? (
                        <div className="flex items-center gap-2 bg-black text-yellow-400 px-4 py-2 rounded-lg">
                          <CheckCircle size={20} />
                          <span className="font-bold">Paid</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg">
                          <Clock size={20} />
                          <span className="font-bold">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {bill.status.toLowerCase() !== "paid" && (
                    <button
                      onClick={() => handleProcessPayment(bill.billId)}
                      className="w-full bg-black hover:bg-gray-900 text-yellow-400 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <CreditCard size={20} />
                      Process Payment
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
      </div>
    </div>
</div>
  );
}
