import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useLocation, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faVideoSlash, faMicrophone, faMicrophoneSlash, faPhoneSlash } from '@fortawesome/free-solid-svg-icons';
import { motion } from "framer-motion";
import apiInstance from "../../utils/apiInstance";




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

  // Fetch usernames from Redux
  const user = useSelector((state) => state.user.user);
  const worker = useSelector((state) => state.worker.worker);
  const localUsername = role === "worker" ? (worker?.username || "Worker") : (user?.username || "User");
  const remoteUsername = role === "worker" ? (user?.username || "User") : (worker?.username || "Worker");

  const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID;

  useEffect(() => {
    const queryRoomId = searchParams.get("roomId");
    if (queryRoomId) {
      setRoomId(queryRoomId);
      joinCall(queryRoomId);
    }
  }, [searchParams]);

  useEffect(() => {
    client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    client.current.on("user-published", async (user, mediaType) => {
      await client.current.subscribe(user, mediaType);
      console.log(`User ${user.uid} published ${mediaType}`);

      const fetchedUsername = await fetchUsername(user.uid, roomId);

      if (mediaType === "video") {
        setRemoteUsers((prevUsers) => {
          if (!prevUsers.some((u) => u.uid === user.uid)) {
            return [...prevUsers, { ...user, hasVideo: true, hasAudio: !!user.audioTrack, username: fetchedUsername }];
          }
          return prevUsers.map((u) =>
            u.uid === user.uid ? { ...u, hasVideo: true, hasAudio: !!user.audioTrack, username: fetchedUsername } : u
          );
        });
        setTimeout(() => {
          if (remoteVideoRefs.current[user.uid] && user.videoTrack) {
            user.videoTrack.play(remoteVideoRefs.current[user.uid]);
          }
        }, 500);
      }
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
        setRemoteUsers((prev) =>
          prev.map((u) =>
            u.uid === user.uid ? { ...u, hasAudio: true, username: fetchedUsername } : u
          )
        );
      }
    });

    client.current.on("user-unpublished", (user, mediaType) => {
      console.log(`User ${user.uid} unpublished ${mediaType}`);
      if (mediaType === "video") {
        setRemoteUsers((prev) =>
          prev.map((u) => (u.uid === user.uid ? { ...u, hasVideo: false } : u))
        );
      }
      if (mediaType === "audio") {
        setRemoteUsers((prev) =>
          prev.map((u) => (u.uid === user.uid ? { ...u, hasAudio: false } : u))
        );
      }
      if (!user.hasVideo && !user.hasAudio) {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      }
    });

    return () => client.current.removeAllListeners();
  }, [roomId]);

  const fetchUsername = async (uid, roomName) => {
    try {
      const response = await apiInstance.get(`/api/get_member/?UID=${uid}&room_name=${roomName}`);
      return response.data.name;
    } catch (error) {
      console.error(`Failed to fetch username for UID ${uid}:`, error);
      return remoteUsername; // Fallback to opposite role's username
    }
  };

  // ${apiInstance.defaults.baseURL}

  const getToken = async (roomId) => {
    try {
      const response = await apiInstance.get(`/api/get_token/?channel=${roomId}`);
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
      
      await client.current.join(AGORA_APP_ID, callRoomId, token, uid);

      localTracks.current.videoTrack = await AgoraRTC.createCameraVideoTrack();
      localTracks.current.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      console.log("Local tracks created:", localTracks.current);

      setTimeout(() => {
        if (localVideoRef.current && localTracks.current.videoTrack) {
          localTracks.current.videoTrack.play(localVideoRef.current);
        }
      }, 500);

      await client.current.publish([localTracks.current.videoTrack, localTracks.current.audioTrack]);
      setJoined(true);

      await apiInstance.post(`/api/create_member/`, {
        name: localUsername,
        UID: uid,
        room_name: callRoomId,
      });
    } catch (err) {
      console.error("Join error:", err);
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
      if (user.videoTrack) user.videoTrack.stop();
    });
    remoteVideoRefs.current = {};
    await client.current.leave();

    await apiInstance.delete(`/api/delete_member/`, {
      data: { name: localUsername, UID: localUid.current, room_name: roomId },
    });

    setJoined(false);
    setRemoteUsers([]);
    setRoomId("");
    setIsCameraOn(true);
    setIsMicOn(true);
    setError(null);
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
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-sans">
      {!joined ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-8 rounded-2xl shadow-2xl text-center w-full max-w-md mt-20"
        >
          <h2 className="text-3xl font-bold mb-6 text-blue-400">
            {role === "worker" ? "Worker Video Call" : "User Video Call"}
          </h2>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full p-4 rounded-lg text-gray-800 bg-gray-100 focus:ring-2 focus:ring-blue-500 transition duration-300 shadow-inner"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => joinCall(roomId)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition duration-300 shadow-md"
            >
              Join Call
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => joinCall(Math.floor(100000 + Math.random() * 900000).toString())}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl transition duration-300 shadow-md"
          >
            Start New Call
          </motion.button>
          {error && <p className="text-red-400 mt-4">{error}</p>}
        </motion.div>
      ) : (
        <div className="w-full flex flex-col items-center py-8">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-semibold text-blue-300 mb-6"
          >
            Room ID: <span className="text-yellow-300 font-mono">{roomId}</span>
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-11/12 max-w-6xl">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-2xl shadow-xl flex flex-col items-center"
            >
              <h3 className="text-lg font-bold mb-2 text-teal-300">Your Video</h3>
              <p className="text-sm text-gray-300 mb-4">{localUsername}</p>
              <div className="w-full max-w-lg h-80 bg-black rounded-xl overflow-hidden relative shadow-inner">
                <video ref={localVideoRef} className="absolute w-full h-full object-cover" autoPlay playsInline />
                {!isCameraOn && (
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-70">
                    <p className="text-gray-300 text-lg font-semibold">Camera Off</p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-2xl shadow-xl flex flex-col items-center"
            >
              <h3 className="text-lg font-bold mb-4 text-teal-300">Remote Participants</h3>
              {remoteUsers.length === 0 ? (
                <p className="text-gray-400 italic">Waiting for participants...</p>
              ) : (
                remoteUsers.map((user) => (
                  <div key={user.uid} className="w-full max-w-lg mb-4 last:mb-0">
                    <p className="text-sm text-gray-300 mb-2">{user.username || remoteUsername}</p>
                    <div className="w-full h-80 bg-black rounded-xl overflow-hidden relative shadow-inner">
                      <video
                        ref={(el) => (remoteVideoRefs.current[user.uid] = el)}
                        className="absolute w-full h-full object-cover"
                        autoPlay
                        playsInline
                      />
                      {!user.hasVideo && (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-70">
                          <p className="text-gray-300 text-lg font-semibold">Camera Off</p>
                        </div>
                      )}
                      {!user.hasAudio && (
                        <div className="absolute bottom-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Muted
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-6 mt-10"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleCamera}
              className={`bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-xl transition duration-300 flex items-center shadow-md ${!isCameraOn && "opacity-75"}`}
            >
              <FontAwesomeIcon icon={isCameraOn ? faVideo : faVideoSlash} className="mr-2" />
              {isCameraOn ? "Turn Off" : "Turn On"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMic}
              className={`bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl transition duration-300 flex items-center shadow-md ${!isMicOn && "opacity-75"}`}
            >
              <FontAwesomeIcon icon={isMicOn ? faMicrophone : faMicrophoneSlash} className="mr-2" />
              {isMicOn ? "Mute" : "Unmute"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={leaveCall}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition duration-300 flex items-center shadow-md"
            >
              <FontAwesomeIcon icon={faPhoneSlash} className="mr-2" />
              Leave Call
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;