const EXTERNAL_API = 'http://172.18.162.217:5000/api/items';

async function test() {
  try {
    const res = await fetch(`${EXTERNAL_API}/teachers`);
    console.log('Status:', res.status);
    const data = await res.text();
    console.log('Data:', data.substring(0, 200) + '...');
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
}

test();
