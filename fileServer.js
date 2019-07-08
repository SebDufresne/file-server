'use strict;';

const net = require('net');
const fs = require('fs');

const server = net.createServer();

const FILE_PATH = './data/';
const MESSAGES = [
  `-=-=- Welcome to the File Server -=-=-\n`,
  `Command list:\n` +
  `list: list all available files\n` +
  `get <file_name>: get the content of a file\n` +
  `quit: exits the file server\n` +
  `What would you like to do?`,
  'You can retrieve a file with the command get <file_name>',
  
];

//Store the clients in an object
const clients = {};

//Declaring an iterator for our clients (should use a randomizer)
let clientId = 0;

server.on('connection', connection => {
  //Logging the fact that we have a client & add it to the object
  clients[clientId] = connection;
  clientId++;

  console.log(connection.remoteAddress + " : " + connection.remotePort + " just connected.\n");


  const listFiles = (callback) => {
    const listOfFiles = [];
    fs.readdir(FILE_PATH, (error, files) =>  {
      for (let i = 0; i < files.length; i++) {
        if (/[.]txt/.test(files[i])) {
          listOfFiles.push(files[i]);
        }
      }
      listOfFiles.push(MESSAGES[2]);
      callback(null,listOfFiles.join('\n'));
    });
  };

  const readFile = (fileName, callback) => {
    const fullFile = FILE_PATH + fileName;
    console.log(fullFile);
    fs.readFile(fullFile, 'utf8', (err, fileContent) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, fileContent);
      }
    });
  };

  connection.setEncoding('utf8'); // interpret data as text

  connection.write(`${MESSAGES[0]}\n${MESSAGES[1]}`);

  connection.on('data', (data) => {
    if (/list/.test(data)) {
      listFiles((error,list) => {
        if (error) {
          return error;
        } else {
          return connection.write(list);
        }
      });
    }

    if (/get/.test(data)) {
      const fileName = data.split(' ')[1];
      console.log(fileName);
      readFile(fileName,(error,fileContent) => {
        if (error) {
          return error;
        } else {
          return connection.write(fileContent);
        }
      });
    }
    if (/quit/.test(data)) {
      connection.end();
    }
  });

  connection.on('end', () => {
    console.log("Connection ended by client");
    for (const key in clients) {
      if (clients[key] === connection) {
        delete clients[key];
      }
    }
  });
});

//Add event listener for close events
server.on('close', () => {
  console.log(`Server disconnected`);
  process.exit();
});

//Add listener for error events
server.on('error', error => {
  console.log(`Error : ${error}`);
});

server.listen(3001, () => {
  console.log('Server listening on port 3000!');
});