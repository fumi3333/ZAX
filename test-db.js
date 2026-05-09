const net = require('net');

const host = 'db.sqejheryiyeqqejkmvkb.supabase.co';

function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(5000);
    
    socket.on('connect', () => {
      console.log(`Port ${port} is OPEN!`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`Port ${port} TIMEOUT`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log(`Port ${port} ERROR: ${err.message}`);
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

async function main() {
  console.log(`Testing TCP connectivity to ${host}...`);
  await checkPort(6543);
  await checkPort(5432);
}

main();
