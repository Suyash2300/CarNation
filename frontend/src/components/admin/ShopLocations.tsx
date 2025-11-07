import { useState } from 'react';
import { useGetShopsByCityQuery, useCreateShopMutation, useUpdateShopMutation, useDeleteShopMutation } from '../../services/shopApi';
import { MapPin, Phone, Clock, Plus, Trash2, Save } from 'lucide-react';

const ShopLocations = () => {
  const [cityFilter, setCityFilter] = useState('');
  const { data } = useGetShopsByCityQuery({ city: cityFilter || undefined });
  const [createShop] = useCreateShopMutation();
  const [updateShop] = useUpdateShopMutation();
  const [deleteShop] = useDeleteShopMutation();

  const shops = data?.shops || [];

  const [form, setForm] = useState({ city: '', addressLine: '', landmark: '', pincode: '', hoursStart: '09:00', hoursEnd: '19:00', phone: '' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="w-full sm:w-auto">
          <label className="block text-sm font-medium text-dark-900 mb-1">Filter by city</label>
          <input value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} placeholder="e.g. Mumbai" className="w-full sm:w-64 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition" />
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="font-semibold text-dark-900 mb-3 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Shop Location</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <input className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="px-3 py-2 border rounded-lg sm:col-span-2 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Address line" value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} />
          <input className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Landmark (optional)" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
          <input className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
          <input className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Hours start (HH:MM)" value={form.hoursStart} onChange={(e) => setForm({ ...form, hoursStart: e.target.value })} />
          <input className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Hours end (HH:MM)" value={form.hoursEnd} onChange={(e) => setForm({ ...form, hoursEnd: e.target.value })} />
          <input className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <button onClick={async () => { if (!form.city || !form.addressLine) return; await createShop({ ...form }).unwrap(); setForm({ city: '', addressLine: '', landmark: '', pincode: '', hoursStart: '09:00', hoursEnd: '19:00', phone: '' }); }} className="mt-3 w-full sm:w-auto px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition">Save</button>
      </div>

      <div className="space-y-3">
        {shops.map((s) => (
          <div key={s.id} className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="font-semibold text-dark-900 flex items-center gap-2"><MapPin className="w-4 h-4" /> {s.city}</div>
              <div className="text-sm text-dark-700 break-words">{s.addressLine}{s.landmark ? `, ${s.landmark}` : ''}{s.pincode ? ` - ${s.pincode}` : ''}</div>
              <div className="text-xs text-dark-600 flex flex-wrap items-center gap-3 mt-1">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.hoursStart} - {s.hoursEnd}</span>
                {s.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {s.phone}</span>}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:items-center">
              <button onClick={() => updateShop({ id: s.id, data: { isActive: !s.isActive } })} className="w-full sm:w-auto px-3 py-2 rounded-lg border font-semibold hover:bg-dark-50 transition">{s.isActive ? 'Deactivate' : 'Activate'}</button>
              <button onClick={() => deleteShop(s.id)} className="w-full sm:w-auto px-3 py-2 rounded-lg bg-error-600 hover:bg-error-700 text-white transition flex items-center justify-center gap-1">
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            </div>
          </div>
        ))}
        {shops.length === 0 && <div className="text-dark-600">No shops found.</div>}
      </div>
    </div>
  );
};

export default ShopLocations;


