import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import "./scss/Style.scss";

const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [remoteEmail, setRemoteEmail] = useState(null);
    const [myStream, setMyStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const [room, setRoom] = useState('');

    const handleUserJoined = useCallback(({ email, id, room }) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
        setRemoteEmail(email);
        setRoom(room);
    }, []);

    const handleCallUser = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });

            const offer = await peer.getOffer();
            socket.emit("user:call", { to: remoteSocketId, offer });
            setMyStream(stream);
        } catch (error) {
            console.error("Error accessing user media:", error);
        }
    }, [remoteSocketId, socket]);

    const handleIncommingCall = useCallback(
        async ({ from, offer }) => {
            try {
                setRemoteSocketId(from);
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true,
                });
                setMyStream(stream);
                console.log(`Incoming Call`, from, offer);
                const answer = await peer.getAnswer(offer);
                socket.emit("call:accepted", { to: from, answer });
            } catch (error) {
                console.error("Error accessing user media:", error);
            }
        },
        [socket]
    );

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream]);

    const handleCallAccepted = useCallback(
        ({ from, answer }) => {
            peer.setLocalDescription(answer);
            console.log("Call Accepted!");
            sendStreams();
        },
        [sendStreams]
    );

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);


    useEffect(() => {
        setRoom(window.location.pathname.split("/")[2]);    //get the room number from the url  
    }, []);
    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
    }, [handleNegoNeeded]);

    const handleNegoNeedIncomming = useCallback(
        async ({ from, offer }) => {
            const answer = await peer.getAnswer(offer);
            socket.emit("peer:nego:done", { to: from, answer });
        },
        [socket]
    );

    const handleNegoNeedFinal = useCallback(async ({ answer }) => {
        await peer.setLocalDescription(answer);
    }, []);

    useEffect(() => {
        peer.peer.addEventListener("track", async (ev) => {
            const remoteStream = ev.streams;
            console.log("GOT TRACKS!!");
            setRemoteStream(remoteStream[0]);
        });
    }, []);

    const handleEndCall = useCallback(() => {
        setRemoteStream(null);
        setMyStream(null);
        setRemoteSocketId(null);
        setRemoteEmail(null);
        peer.peer.close();
        //redirect the usdr to the lobby page
        window.location.href = "/";
    }, []);

    useEffect(() => {
        socket.on("user:joined", handleUserJoined);
        socket.on("incomming:call", handleIncommingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeedIncomming);
        socket.on("peer:nego:final", handleNegoNeedFinal);

        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incomming:call", handleIncommingCall);
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed", handleNegoNeedIncomming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
        };
    }, [
        socket,
        handleUserJoined,
        handleIncommingCall,
        handleCallAccepted,
        handleNegoNeedIncomming,
        handleNegoNeedFinal,
    ]);

    return (
        <div className="lobby">
            <div className="main">
                <h1 className="title">Welcome to the Room {room}</h1>
                <h4 className="sub-title">{remoteSocketId ?
                    `Connected to ${remoteEmail}`
                    :
                    `Please share your room number ${room} with other user`}
                </h4>
                {remoteSocketId &&
                    <button onClick={handleCallUser}
                        className="btn">
                        Start Calling
                    </button>
                }
                {myStream &&
                    <button onClick={handleEndCall}
                        className="btn">
                        End Calling
                    </button>}
                {myStream && (
                    <>
                        <h1>My Stream</h1>
                        <ReactPlayer
                            playing
                            muted
                            height="100px"
                            width="200px"
                            url={myStream}
                            controls
                        />
                    </>
                )}
                {remoteStream && (
                    <>
                        <h1>Remote Stream</h1>
                        <ReactPlayer
                            playing
                            muted
                            height="100px"
                            width="200px"
                            url={remoteStream}
                            controls
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default RoomPage;
