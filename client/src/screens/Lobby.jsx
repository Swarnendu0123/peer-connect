import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketProvider';
import './scss/Style.scss';

const Lobby = () => {

    const [email, setEmail] = useState('');
    const [room, setRoom] = useState('');
    const socket = useSocket();
    const navigate = useNavigate();

    const handleConnect = useCallback((e) => {
        e.preventDefault();
        socket.emit('room:join', { email, room })
    }, [email, room, socket]);

    const handleJoinRoom = useCallback((data) => {
        const { room, email } = data;
        navigate(`/room/${room}`, { state: { email } })
    }, [navigate]);

    useEffect(() => {
        socket.on('room:join', handleJoinRoom);
        return () => socket.off('room:join', handleJoinRoom); //deregestering the event
    }, [handleJoinRoom, socket]);



    return <div className='lobby'>
        <div className='main'>
            <h1 className='title'>
                Welcome to Peer Connect!
            </h1>
            <p className='sub-title'>Server Less Video Calling</p>
            <form onSubmit={handleConnect}>
                <div className="inputs">
                    <label htmlFor="email" className='label'>E-Mail Id:</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        id='email'
                        placeholder='example@company.com'
                        className='email input'
                        required
                    />
                    <br />
                    <label htmlFor="room" className='label' >Room Number:</label>
                    <input
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        type="number"
                        id='room'
                        placeholder='123456'
                        className='room input'
                        required
                    />
                </div>
                <button className='btn'>Connect</button>
            </form>
        </div>
    </div>;
}

export default Lobby;