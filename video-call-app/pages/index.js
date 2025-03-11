import { useState } from 'react';
import styles from '../styles/lobby.module.css';

export default function Lobby() {
  const [spokenLang, setSpokenLang] = useState('mr-IN');
  const [heardLang, setHeardLang] = useState('es-ES');
  const [roomName, setRoomName] = useState('');

  const handleJoin = () => {
    window.location.href = `/call?room=${roomName}&spoken=${spokenLang}&heard=${heardLang}`;
  };

  return (
    <div className={styles.lobbyContainer}>
      <h1>Video Call App</h1>
      <label>
        Spoken Language:
        <select value={spokenLang} onChange={(e) => setSpokenLang(e.target.value)}>
          <option value="mr-IN">Marathi</option>
          <option value="en-US">English</option>
          <option value="es-ES">Spanish</option>
        </select>
      </label>
      <label>
        Heard Language:
        <select value={heardLang} onChange={(e) => setHeardLang(e.target.value)}>
          <option value="es-ES">Spanish</option>
          <option value="en-US">English</option>
          <option value="mr-IN">Marathi</option>
        </select>
      </label>
      <input
        type="text"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Enter room name"
      />
      <button onClick={handleJoin} disabled={!roomName}>Join Call</button>
    </div>
  );
}
