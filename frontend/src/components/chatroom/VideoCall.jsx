import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useLocation, useSearchParams } from "react-router-dom";

const VideoCall = () => {
    const [roomId, setRoomId] = useState("");
    const [joined, setJoined] = useState(false);
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [error, setError] = useState(null);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);

    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});
    const client = useRef(null);
    const localTracks = useRef({ videoTrack: null, audioTrack: null });
    const localUid = useRef(null);

    const location = useLocation();
    const role = location.pathname.includes("/worker") ? "worker" : "user";
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const queryRoomId = searchParams.get("roomId");
        if (queryRoomId) {
            setRoomId(queryRoomId);
            joinCall(queryRoomId);
        }
    }, []);

    useEffect(() => {
        client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

        client.current.on("user-published", async (user, mediaType) => {
            await client.current.subscribe(user, mediaType);

            if (mediaType === "video") {
                setRemoteUsers((prevUsers) => {
                    if (!prevUsers.some((u) => u.uid === user.uid)) {
                        return [...prevUsers, { ...user, hasVideo: true }];
                    }
                    return prevUsers.map((u) =>
                        u.uid === user.uid ? { ...u, hasVideo: true } : u
                    );
                });

                setTimeout(() => {
                    if (remoteVideoRefs.current[user.uid] && user.videoTrack) {
                        user.videoTrack.play(remoteVideoRefs.current[user.uid]);
                    }
                }, 500);
            }
        });

        client.current.on("user-unpublished", (user, mediaType) => {
            if (mediaType === "video") {
                setRemoteUsers((prev) =>
                    prev.map((u) =>
                        u.uid === user.uid ? { ...u, hasVideo: false } : u
                    )
                );
            } else {
                setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
            }
        });

        return () => {
            client.current.removeAllListeners();
        };
    }, []);

    const getToken = async (roomId) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/get_token/?channel=${roomId}`);
            return response.data;
        } catch (error) {
            setError("Failed to fetch token. Please try again.");
            return null;
        }
    };

    const joinCall = async (room) => {
        const callRoomId = room || roomId;
        if (!callRoomId) {
            setError("Please enter a Room ID to join.");
            return;
        }
        setRoomId(callRoomId);

        const data = await getToken(callRoomId);
        if (!data || !data.token) return;

        try {
            const { token, uid } = data;
            localUid.current = uid;

            await client.current.join("f10d6d9bb8be4f39a817074843a6a43e", callRoomId, token, uid);

            localTracks.current.videoTrack = await AgoraRTC.createCameraVideoTrack();
            localTracks.current.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

            setTimeout(() => {
                if (localVideoRef.current) {
                    localTracks.current.videoTrack.play(localVideoRef.current);
                }
            }, 500);

            await client.current.publish([localTracks.current.videoTrack, localTracks.current.audioTrack]);

            setJoined(true);
        } catch (err) {
            setError("Error joining the call.");
        }
    };

    const leaveCall = async () => {
        if (localTracks.current.videoTrack) {
            localTracks.current.videoTrack.stop();
            localTracks.current.videoTrack.close();
        }
        if (localTracks.current.audioTrack) {
            localTracks.current.audioTrack.stop();
            localTracks.current.audioTrack.close();
        }

        remoteUsers.forEach(user => {
            if (user.videoTrack) {
                user.videoTrack.stop();
            }
        });

        remoteVideoRefs.current = {};
        await client.current.leave();

        setJoined(false);
        setRemoteUsers([]);
        setRoomId("");
    };

    const toggleCamera = async () => {
        if (localTracks.current.videoTrack) {
            await localTracks.current.videoTrack.setEnabled(!isCameraOn);
            setIsCameraOn(!isCameraOn);
        }
    };

    const toggleMic = async () => {
        if (localTracks.current.audioTrack) {
            await localTracks.current.audioTrack.setEnabled(!isMicOn);
            setIsMicOn(!isMicOn);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            {!joined ? (
                <div className="bg-gray-700 p-6 rounded-lg shadow-lg text-center">
                    <h2 className="text-2xl font-semibold mb-4">{role === "worker" ? "Worker Video Call" : "User Video Call"}</h2>
                    
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Enter Room ID"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="p-3 text-black rounded-md w-64 mb-2"
                        />
                        <button
                            onClick={() => joinCall(roomId)}
                            className="bg-blue-500 px-6 py-2 rounded-md text-lg font-medium hover:bg-blue-600 transition mx-2"
                        >
                            Join Call
                        </button>
                    </div>

                    <button
                        onClick={() => joinCall(Math.floor(100000 + Math.random() * 900000).toString())}
                        className="bg-green-500 px-6 py-2 rounded-md text-lg font-medium hover:bg-green-600 transition"
                    >
                        Start New Call
                    </button>

                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
            ) : (
                <div className="w-full flex flex-col items-center">
                    <h3 className="text-lg font-semibold mt-4">Room ID: <span className="text-yellow-400">{roomId}</span></h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-4/5 mt-4">
                        <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
                            <h3 className="text-lg font-semibold mb-2">Your Video</h3>
                            <div ref={localVideoRef} className="w-80 h-56 bg-black rounded-md"></div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
                            <h3 className="text-lg font-semibold mb-2">Remote Participants</h3>
                            {remoteUsers.length === 0 ? (
                                <p className="text-gray-400">Waiting for users...</p>
                            ) : (
                                remoteUsers.map((user) => (
                                    <div key={user.uid} ref={(el) => (remoteVideoRefs.current[user.uid] = el)} className="w-80 h-56 bg-black rounded-md mt-2">
                                        {!user.hasVideo && <p className="text-gray-400">Camera Off</p>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 mt-4">
                        <button onClick={toggleCamera} className="bg-yellow-500 px-6 py-2 rounded-md">{isCameraOn ? "Turn Off Camera" : "Turn On Camera"}</button>
                        <button onClick={toggleMic} className="bg-purple-500 px-6 py-2 rounded-md">{isMicOn ? "Mute Mic" : "Unmute Mic"}</button>
                        <button onClick={leaveCall} className="bg-red-500 px-6 py-2 rounded-md">Leave Call</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoCall;
