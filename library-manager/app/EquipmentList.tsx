import { createClient } from '@/lib/supabase/server'; // Ensure this path matches your project
import { revalidatePath } from 'next/cache';

export default async function EquipmentList() {
  const supabase = await createClient();
  
  // READ: Fetching equipment from PostgreSQL
  const { data: equipment } = await supabase
    .from('equipment')
    .select('*')
    .order('created_at', { ascending: false });

  // DELETE: Server Action to remove item
  async function deleteItem(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const supabase = await createClient();
    
    await supabase.from('equipment').delete().eq('id', id);
    
    revalidatePath('/'); // Refresh the page to show the item is gone
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700">
      <table className="w-full text-left bg-slate-800">
        <thead className="bg-slate-700 text-slate-300">
          <tr>
            <th className="p-4">Name</th>
            <th className="p-4">Category</th>
            <th className="p-4">Status</th>
            <th className="p-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {equipment?.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-8 text-center text-slate-500 italic">
                No equipment found in the cloud database.
              </td>
            </tr>
          ) : (
            equipment?.map((item) => (
              <tr key={item.id} className="border-t border-slate-700 hover:bg-slate-750">
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.category}</td>
                <td className="p-4">
                  {item.is_available ? '🟢 Available' : '🔴 In Use'}
                </td>
                <td className="p-4">
                  <form action={deleteItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <button 
                      type="submit" 
                      className="text-red-400 hover:text-red-300 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}