import { Suspense } from 'react';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server'; // Check if your path is @/lib/supabase/server
import EquipmentList from './EquipmentList';

export default function EquipmentPage() {
  
  // CREATE: Server Action to add new equipment
  async function addEquipment(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    
    const supabase = await createClient();
    
    // Insert into the 'equipment' table you created in SQL
    const { error } = await supabase
      .from('equipment')
      .insert([{ name, category }]);

    if (error) {
      console.error('Error adding equipment:', error.message);
    }

    revalidatePath('/'); // This triggers the Suspense boundary to refresh
  }

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans text-white bg-slate-900 min-h-screen">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-blue-400">Lab Inventory System</h1>
        <p className="text-slate-400">Cloud Computing Project - Management System</p>
      </header>
      
      {/* 1. CREATE FORM (Loads Instantly) */}
      <section className="mb-10 bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-semibold mb-4 text-slate-200">Add New Equipment</h2>
        <form action={addEquipment} className="flex flex-wrap gap-4">
          <input 
            name="name" 
            placeholder="Item Name (e.g., Raspberry Pi)" 
            className="flex-1 min-w-[200px] bg-slate-700 p-2 rounded border border-slate-600 outline-none focus:border-blue-500" 
            required 
          />
          <input 
            name="category" 
            placeholder="Category (e.g., Microcontroller)" 
            className="flex-1 min-w-[200px] bg-slate-700 p-2 rounded border border-slate-600 outline-none focus:border-blue-500" 
            required 
          />
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded font-bold transition-all shadow-lg active:scale-95"
          >
            Add to Cloud
          </button>
        </form>
      </section>

      {/* 2. READ/DELETE LIST (Deferred via Suspense) */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-slate-200">Current Inventory</h2>
        <Suspense fallback={
          <div className="p-10 text-center bg-slate-800 rounded-lg border border-slate-700 border-dashed">
            <p className="text-slate-400 animate-pulse">Streaming data from PostgreSQL...</p>
          </div>
        }>
          <EquipmentList />
        </Suspense>
      </section>
    </div>
  );
}