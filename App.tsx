import React, { useState, useEffect } from 'react';
import { Logo } from './components/Logo';
import { MapView } from './components/MapView';
import { AIChat } from './components/AIChat';
import { UserRole, Bus, Route as RouteType } from './types';
import { MOCK_BUSES, ROUTES, DIU_LOCATION } from './constants';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('student');
  const [buses, setBuses] = useState<Bus[]>(MOCK_BUSES);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const [selectedRoute, setSelectedRoute] = useState<string | 'all'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<Partial<Bus>>({});
  const [isNewBus, setIsNewBus] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  // Simulation effect to move buses around
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses(prevBuses => 
        prevBuses.map(bus => {
          if (bus.status !== 'active') return bus;
          // Simple jitter movement simulation
          const moveLat = (Math.random() - 0.5) * 0.001;
          const moveLng = (Math.random() - 0.5) * 0.001;
          
          return {
            ...bus,
            location: {
              lat: bus.location.lat + moveLat,
              lng: bus.location.lng + moveLng,
            },
            speed: Math.max(0, Math.min(60, bus.speed + (Math.random() - 0.5) * 5)),
            lastUpdated: new Date()
          };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Toast Timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const filteredBuses = buses.filter(b => 
    selectedRoute === 'all' ? true : b.routeId === selectedRoute
  );

  const activeBusesCount = buses.filter(b => b.status === 'active').length;

  // CRUD Handlers
  const handleDeleteBus = (id: string) => {
    if (window.confirm('Are you sure you want to remove this bus?')) {
      setBuses(prev => prev.filter(b => b.id !== id));
      showToast('Bus removed successfully', 'info');
    }
  };

  const openAddModal = () => {
    setIsNewBus(true);
    setEditingBus({
      id: '',
      name: '',
      routeId: ROUTES[0].id,
      capacity: 50,
      status: 'inactive',
      passengers: 0,
      speed: 0,
      location: { ...DIU_LOCATION }
    });
    setIsModalOpen(true);
  };

  const openEditModal = (bus: Bus) => {
    setIsNewBus(false);
    // Create a copy of the bus data for the form
    setEditingBus({ ...bus });
    setIsModalOpen(true);
  };

  const handleSaveBus = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isNewBus) {
      // Add new bus
      const newBus = editingBus as Bus;
      // Ensure required fields for simulation are present
      newBus.lastUpdated = new Date();
      if (!newBus.location) newBus.location = { ...DIU_LOCATION };
      
      setBuses(prev => [...prev, newBus]);
      showToast('New bus added to fleet');
    } else {
      // Update existing bus
      // CRITICAL: Only update the fields that are editable in the form.
      // We must NOT overwrite 'location', 'speed', or 'passengers' with the stale data 
      // from 'editingBus' because the background simulation might have updated them.
      setBuses(prev => prev.map(b => {
        if (b.id === editingBus.id) {
          return { 
            ...b, 
            name: editingBus.name || b.name,
            routeId: editingBus.routeId || b.routeId,
            capacity: editingBus.capacity || b.capacity,
            status: editingBus.status || b.status
          };
        }
        return b;
      }));
      showToast('Bus details updated');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">DIU Transport</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">SMART TRACKER</p>
          </div>
        </div>
        
        {/* Role Switcher (For Demo) */}
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="bg-slate-100 text-sm border-none rounded-lg px-3 py-1.5 font-medium text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
        >
          <option value="student">Student View</option>
          <option value="driver">Driver Mode</option>
          <option value="admin">Admin Portal</option>
        </select>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        
        {/* Role: Student & Admin see map, Driver sees dashboard */}
        {role !== 'driver' ? (
          <>
             {/* Filter Bar */}
            <div className="bg-white border-b border-slate-200 px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 z-20">
              <button 
                onClick={() => setSelectedRoute('all')}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedRoute === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                All Routes
              </button>
              {ROUTES.map(r => (
                <button 
                  key={r.id}
                  onClick={() => setSelectedRoute(r.id)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${selectedRoute === r.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: selectedRoute === r.id ? 'white' : r.color}}></span>
                  {r.name}
                </button>
              ))}
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
               <MapView buses={filteredBuses} />
               
               {/* Overlay Info Card (Mobile) */}
               <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200 max-w-xs hidden md:block">
                  <h3 className="font-bold text-slate-800">System Status</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-slate-500">Active Buses</p>
                      <p className="text-xl font-bold text-emerald-600">{activeBusesCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Routes</p>
                      <p className="text-xl font-bold text-blue-600">{ROUTES.length}</p>
                    </div>
                  </div>
                  {role === 'admin' && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <p className="text-xs text-orange-500 font-mono">Backend: PHP (Simulated)</p>
                    </div>
                  )}
               </div>
            </div>
          </>
        ) : (
          /* Driver View */
          <div className="flex-1 bg-slate-100 p-6 flex flex-col items-center justify-center space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-emerald-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Driver Console</h2>
              <p className="text-slate-500 mb-6">Bus-1042 • Route: DSC-Mirpur</p>
              
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all text-lg mb-3">
                START TRIP
              </button>
              <button className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-all">
                REPORT ISSUE
              </button>
            </div>
            <div className="text-center text-slate-400 text-sm max-w-xs">
              GPS Tracking is active. Your location is being shared with students.
            </div>
          </div>
        )}

        {/* AI Chat Button (Always available for Student/Admin) */}
        {role !== 'driver' && <AIChat />}

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-20 right-4 z-[500] px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-slate-700'}`}>
            {toast.message}
          </div>
        )}
        
      </main>

      {/* Admin Quick List (Only in Admin Mode at bottom) */}
      {role === 'admin' && activeTab === 'list' && (
        <div className="absolute inset-0 bg-white z-40 flex flex-col mt-[60px]">
           <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <div>
               <h2 className="font-bold text-lg text-slate-800">Fleet Management</h2>
               <p className="text-xs text-slate-500">Manage buses, routes, and status</p>
             </div>
             <div className="flex gap-2">
               <button 
                  onClick={openAddModal}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                </svg>
                 Add Bus
               </button>
               <button onClick={() => setActiveTab('map')} className="text-slate-600 px-3 py-2 hover:bg-slate-200 rounded-lg text-sm font-medium">Close List</button>
             </div>
           </div>
           <div className="flex-1 overflow-auto p-4">
             <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
               <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="text-slate-500 text-xs uppercase bg-slate-50 border-b border-slate-200">
                      <th className="py-3 px-4 font-semibold">Bus ID</th>
                      <th className="py-3 px-4 font-semibold">Name</th>
                      <th className="py-3 px-4 font-semibold">Route</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Capacity</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {buses.map(bus => (
                      <tr key={bus.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="py-3 px-4 font-medium text-slate-700">{bus.id}</td>
                        <td className="py-3 px-4 text-slate-600">{bus.name}</td>
                        <td className="py-3 px-4 text-slate-500 text-sm">
                           <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-xs">{bus.routeId}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            bus.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                            bus.status === 'inactive' ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                               bus.status === 'active' ? 'bg-emerald-500' : 
                               bus.status === 'inactive' ? 'bg-slate-400' : 'bg-red-500'
                            }`}></span>
                            {bus.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">{bus.capacity}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => openEditModal(bus)}
                              className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteBus(bus.id)}
                              className="text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           </div>
        </div>
      )}

      {/* Add/Edit Bus Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">{isNewBus ? 'Add New Bus' : 'Edit Bus Details'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
             </div>
             
             <form onSubmit={handleSaveBus} className="p-6 space-y-4">
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Bus ID</label>
                   <input 
                      type="text" 
                      required
                      value={editingBus.id || ''}
                      onChange={e => setEditingBus(prev => ({...prev, id: e.target.value}))}
                      disabled={!isNewBus}
                      className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${!isNewBus ? 'bg-slate-100 text-slate-500 border-transparent' : 'bg-white border-slate-200 text-slate-800'}`}
                      placeholder="e.g. B-1061"
                   />
                </div>
                
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Bus Name</label>
                   <input 
                      type="text" 
                      required
                      value={editingBus.name || ''}
                      onChange={e => setEditingBus(prev => ({...prev, name: e.target.value}))}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="e.g. DIU Bus 1061"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Route</label>
                    <select 
                        value={editingBus.routeId || ''}
                        onChange={e => setEditingBus(prev => ({...prev, routeId: e.target.value}))}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                    >
                        {ROUTES.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Capacity</label>
                    <input 
                        type="number" 
                        required
                        min="10"
                        max="100"
                        value={editingBus.capacity || ''}
                        onChange={e => setEditingBus(prev => ({...prev, capacity: parseInt(e.target.value)}))}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Current Status</label>
                   <select 
                      value={editingBus.status || 'inactive'}
                      onChange={e => setEditingBus(prev => ({...prev, status: e.target.value as any}))}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                   >
                      <option value="active">Active (On Route)</option>
                      <option value="inactive">Inactive (Parked)</option>
                      <option value="maintenance">Maintenance</option>
                   </select>
                </div>

                <div className="pt-4 flex gap-3">
                   <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                      type="submit" 
                      className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all transform active:scale-95"
                   >
                     {isNewBus ? 'Create Bus' : 'Save Changes'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Admin Toggle (Mobile friendly) */}
      {role === 'admin' && (
        <div className="bg-white border-t border-slate-200 p-2 flex justify-around md:hidden z-50">
           <button 
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg ${activeTab === 'map' ? 'bg-slate-100 text-emerald-600' : 'text-slate-500'}`}
           >
             Map View
           </button>
           <button 
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg ${activeTab === 'list' ? 'bg-slate-100 text-emerald-600' : 'text-slate-500'}`}
           >
             Fleet List
           </button>
        </div>
      )}

    </div>
  );
};

export default App;