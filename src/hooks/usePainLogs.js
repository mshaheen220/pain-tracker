import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function usePainLogs() {
  const [painLogs, setPainLogs] = useState([]);

  useEffect(() => {
    const fetchPainLogs = async () => {
      const { data, error } = await supabase
        .from('pain_entries')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching pain logs:', error);
      } else {
        setPainLogs(data || []);
      }
    };

    fetchPainLogs();
  }, []);

  const addPainLog = async (logData) => {
    const { error } = await supabase.from('pain_entries').insert(logData);
    if (error) {
      console.error('Error adding pain log:', error);
    } else {
      const { data } = await supabase.from('pain_entries').select('*').order('timestamp', { ascending: false });
      setPainLogs(data || []);
    }
  };

  const updatePainLog = async (logData) => {
    const { error } = await supabase
      .from('pain_entries')
      .update(logData)
      .eq('id', logData.id);
    if (error) {
      console.error('Error updating pain log:', error);
    } else {
      const { data } = await supabase.from('pain_entries').select('*').order('timestamp', { ascending: false });
      setPainLogs(data || []);
    }
  };

  const deletePainLog = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const { error } = await supabase
        .from('pain_entries')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Error deleting pain log:', error);
      } else {
        const { data } = await supabase.from('pain_entries').select('*').order('timestamp', { ascending: false });
        setPainLogs(data || []);
      }
    }
  };

  return { painLogs, addPainLog, updatePainLog, deletePainLog };
}
