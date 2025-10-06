import 'dotenv/config';

console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ gefunden" : "❌ fehlt");
console.log("Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ gefunden" : "❌ fehlt");
