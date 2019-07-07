const net = require('net');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const client = net.createConnection({
  host: 'localhost', // change to IP address
  port: 3000
});

client.setEncoding('utf8'); // interpret data as text

client.on('connect', () => {

  client.on('data', (data) => {
    console.log(data);
    
    rl.question(`> `, (command) => {
      client.write(command);
      rl.close();
    });
  });
});

//Add event listener for close events
client.on('close', () => {
  console.log(`Server disconnected`);
});

//Add listener for error events
client.on('error', error => {
  console.log(`Error : ${error}`);
});