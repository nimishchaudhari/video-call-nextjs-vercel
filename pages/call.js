import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import styles from '../styles/call.module.css';

export default function Call({ room, spoken, heard }) {
  console.log('Room:', room);
  console.log('Spoken:', spoken);
  console.log('Heard:', heard);
  const [mutedAudio, setMutedAudio] = useState(false);
  const [mutedVideo, setMutedVideo] = useState(false);
  const [spokenLang, setSpokenLang] = useState(spoken);
  const [heardLang, setHeardLang] = useState(heard);
  const [transcription, setTranscription] = useState('');
  const selfVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    const socket = io('/api/signal'); // Vercel serverless signaling
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      selfVideoRef.current.srcObject = stream;
      const peer = new SimplePeer({
        initiator: true,
        stream,
        config: { iceServers: [{ urls: 'turn:your-turn-server.com:3478', username: 'your-username', credential: 'your-credential' }] },
      });
      peer.on('signal', (data) => socket.emit('signal', { room, data }));
      socket.on('signal', (data) => peer.signal(data));
      peer.on('stream', (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });



      const request = {
        config: { encoding: 'LINEAR16', sampleRateHertz: 16000, languageCode: spokenLang },
        interimResults: true,
      };
      const recognizeStream = client.streamingRecognize(request)
        .on('data', (data) => {
          const text = data.results[0]?.alternatives[0]?.transcript;
          if (text) socket.emit('text', { room, text });
        });
      // Stream audio here (implementation omitted for brevity)

      socket.on('audio', (audioBytes) => {
        const audioBlob = new Blob([audioBytes], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        new Audio(audioUrl).play();
      });
    });
  }, [room, spokenLang]);

  return (
    <div className={styles.callContainer}>
      <div className={styles.videoGrid}>
        <video ref={selfVideoRef} autoPlay muted />
        <video ref={remoteVideoRef} autoPlay />
      </div>
      <div className={styles.controls}>
        <label>
          Spoken:
          <select value={spokenLang} onChange={(e) => setSpokenLang(e.target.value)}>
            <option value="mr-IN">Marathi</option>
            <option value="en-US">English</option>
            <option value="es-ES">Spanish</option>
          </select>
        </label>
        <label>
          Heard:
          <select value={heardLang} onChange={(e) => setHeardLang(e.target.value)}>
            <option value="es-ES">Spanish</option>
            <option value="en-US">English</option>
            <option value="mr-IN">Marathi</option>
          </select>
        </label>
        <button onClick={() => setMutedAudio(!mutedAudio)}>
          {mutedAudio ? 'Unmute Mic' : 'Mute Mic'}
        </button>
        <button onClick={() => setMutedVideo(!mutedVideo)}>
          {mutedVideo ? 'Unmute Cam' : 'Mute Cam'}
        </button>
        <button onClick={() => window.location.href = '/'}>End Call</button>
      </div>
      <div className={styles.transcription}>Transcription: {transcription}</div>
    </div>
  );
}

export async function getServerSideProps({ query }) {
  return { props: { room: query.room, spoken: query.spoken, heard: query.heard } };
}
