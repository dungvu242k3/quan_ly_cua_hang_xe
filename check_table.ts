import { supabase } from './src/lib/supabase';

async function checkTable() {
  const { data, error } = await supabase.from('ung_vien').select('*').limit(1);
  if (error) {
    console.log('Error or table does not exist:', error.message);
  } else {
    console.log('Table exists, records found:', data.length);
  }
}

checkTable();
