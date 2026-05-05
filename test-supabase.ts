import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('training_schedule').insert([{
    id: 'test-sch-1', title: 'Test', date: '2026-05-05', time: '12:00', category: 'U10', coach: 'Coach A', location: 'Field 1', description: 'Desc', status: 'Upcoming', notes: 'Note'
  }]);
  console.log('Insert training_schedule Result:', error);

  const { data: d2, error: e2 } = await supabase.from('upcoming_matches').insert([{
    id: 'test-match-1', tournament: 'T', rival: 'R', date: '2026-05-05', time: '10:00', venue: 'V', category: 'C', result: 'Win'
  }]);
  console.log('Insert upcoming_matches Result:', e2);
}
run();
