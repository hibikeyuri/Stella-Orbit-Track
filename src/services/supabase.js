import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://huyyxirnkphjevrhsumk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1eXl4aXJua3BoamV2cmhzdW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxODI5NjgsImV4cCI6MjA2NDc1ODk2OH0.XHrOZZmvaKRT72aRz3tXlGk79RzAfSsppgOFAGwdY-g";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
