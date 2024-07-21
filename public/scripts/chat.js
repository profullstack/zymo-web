// Global variables
let localPeerConnection;
let websocket;
const signalingServerURL = 'wss://encryptfil.es/signal';
const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }; // STUN server

// Function to start the WebSocket connection and the P2P chat
export function startWebSocketAndPeerConnection() {
  // Establish WebSocket connection
  websocket = new WebSocket(signalingServerURL);

  // WebSocket event listeners
  websocket.onopen = () => {
    console.log('WebSocket connection established');
    setupPeerConnection();
  };

  websocket.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    console.log('Received message:', data);

    if (data.type === 'offer') {
      console.log('Received offer');
      await localPeerConnection.setRemoteDescription(new RTCSessionDescription(data));
      const answer = await localPeerConnection.createAnswer();
      await localPeerConnection.setLocalDescription(answer);
      sendSignal({ type: 'answer', answer });
    } else if (data.type === 'answer') {
      console.log('Received answer');
      await localPeerConnection.setRemoteDescription(new RTCSessionDescription(data));
    } else if (data.type === 'candidate') {
      console.log('Received ICE candidate');
      await localPeerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };

  websocket.onerror = (error) => {
    console.log('WebSocket error:', error);
  };
}

// Function to setup peer connection
function setupPeerConnection() {
  localPeerConnection = new RTCPeerConnection(configuration);

  // Listen for ICE candidates and send them to peer
  localPeerConnection.onicecandidate = ({ candidate }) => {
    if (candidate) {
      console.log('Sending ICE candidate');
      sendSignal({ type: 'candidate', candidate });
    }
  };

  // Create data channel
  const dataChannel = localPeerConnection.createDataChannel('chat');

  dataChannel.onopen = () => console.log('Data channel is open');
  dataChannel.onclose = () => console.log('Data channel is closed');
  dataChannel.onmessage = (event) => {
    console.log('Received message:', event.data);
    // Handle incoming message
  };

  // Create an offer if this is the initiating peer
  createOfferIfNeeded();
}

// Helper function to send signaling data
function sendSignal(data) {
  websocket.send(JSON.stringify(data));
}

// Function to create and send an offer to the peer
async function createOfferIfNeeded() {
  // Condition to decide whether to create an offer could be based on application logic
  if (/* condition to create offer */) {
    const offer = await localPeerConnection.createOffer();
    await localPeerConnection.setLocalDescription(offer);
    console.log('Sending offer');
    sendSignal({ type: 'offer', offer });
  }
}

// Function to send a message through the data channel
export function sendMessage(message) {
  // Assuming a single data channel for simplicity
  const dataChannel = localPeerConnection.dataChannels[0];
  if (dataChannel && dataChannel.readyState === 'open') {
    dataChannel.send(message);
  }
}
