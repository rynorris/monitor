import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Client, newStream, StreamConsumer, StreamProducer } from './clients';

function App() {
  React.useEffect(() => {
    (async () => {
      const client = new Client();
      client.connect("ws://localhost:8080/ws")

      const producer: StreamProducer = await newStream("Test");
      const consumer: StreamConsumer = { ...producer, signingPublicKey: producer.signingKeyPair.publicKey! };

      client.registerProducer(producer);
      client.registerConsumer(consumer);

      const dec = new TextDecoder();
      const enc = new TextEncoder();

      client.subscribe(producer.streamId, msg => console.log("RECEIVED MSG", dec.decode(msg)));

      setInterval(() => {
        console.log("BROADCASTING");
        client.broadcast(producer.streamId, enc.encode("Hello World!"));
      }, 1000);

      const otherProducer = await newStream("Other");
      client.registerProducer(otherProducer);

      setInterval(() => {
        console.log("BROADCASTING");
        client.broadcast(otherProducer.streamId, enc.encode("Shouldn't receive this!"));
      }, 1000);

      return () => {
        client.close();
      };
    })()
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
