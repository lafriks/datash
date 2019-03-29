import { webRTCIceServers, WebRTCDataChunkSize } from '../constants';
import globalStates from '../global-states';
import { sendWS, printError } from '../helper';

export const openRTCPeerConnection = recipientId => new Promise((res, rej) => {
  const { rtcPeerConns } = globalStates;

  if (rtcPeerConns.has(recipientId)) {
    const existingRTCPeerConn = rtcPeerConns.get(recipientId);
    if (existingRTCPeerConn.peerConn.connectionState === 'connected'
      && existingRTCPeerConn.dataChannel && existingRTCPeerConn.dataChannel.readyState === 'open') {
      res(existingRTCPeerConn);
      return;
    }
    disposePeerConn(recipientId);
  }

  const config = {
    iceServers: webRTCIceServers
  };

  const peerConn = new RTCPeerConnection(config);

  peerConn.addEventListener('icecandidate', (evt) => {
    const { candidate } = evt;
    console.log('Candidate found: ', candidate);

    if (candidate) {
      sendWS(globalStates.ws, {
        type: 'webrtc-candidate',
        data: { to: recipientId, candidate },
      });
    }
  });

  peerConn.addEventListener('connectionstatechange', () => {
    const { connectionState: connState } = peerConn;

    if (connState === 'failed') {
      rej(new Error('PeerConnection is failed to connect'));
    }

    if (connState === 'failed' || connState === 'closed' || connState === 'disconnected') {
      disposePeerConn(recipientId);
    }
  });

  const dataChannel = peerConn.createDataChannel('datashDataChannel', { ordered: true });
  dataChannel.binaryType = 'arraybuffer';
  dataChannel.remoteClientId = recipientId;
  dataChannel.dataReadStates = dataChannelInitialStates();

  dataChannel.addEventListener('open', () => {
    console.log('Data Channel is opened');
    res(rtcPeerConns.get(recipientId));
  });

  dataChannel.addEventListener('message', (evt) => {
    handleDataChannelMessage(dataChannel, evt.data);
  });

  dataChannel.addEventListener('close', () => {
    disposePeerConn(recipientId);
  });

  dataChannel.addEventListener('error', (err) => {
    printError(err);
    rej(err);
    disposePeerConn(recipientId);
  });

  peerConn.createOffer()
    .then(offer => peerConn.setLocalDescription(offer))
    .then(() => {
      sendWS(globalStates.ws, {
        type: 'webrtc-offer',
        data: { to: recipientId, offer: peerConn.localDescription },
      });
    })
    .catch((err) => {
      rej(err);
    });

  rtcPeerConns.set(recipientId, {
    peerConn,
    dataChannel,
    meta: {
      rejPromise: rej
    }
  });
});

export const respondToOffer = (recipientId, offer) => new Promise((res, rej) => {
  const { rtcPeerConns } = globalStates;

  if (rtcPeerConns.has(recipientId)) {
    disposePeerConn(recipientId);
  }

  const config = {
    iceServers: webRTCIceServers
  };

  const peerConn = new RTCPeerConnection(config);

  peerConn.addEventListener('icecandidate', (evt) => {
    const { candidate } = evt;
    console.log('Candidate found: ', candidate);

    if (candidate) {
      sendWS(globalStates.ws, {
        type: 'webrtc-candidate',
        data: { to: recipientId, candidate },
      });
    }
  });

  peerConn.addEventListener('connectionstatechange', () => {
    const { connectionState: connState } = peerConn;

    if (connState === 'failed') {
      rej(new Error('PeerConnection is failed to connect'));
    }

    if (connState === 'failed' || connState === 'closed' || connState === 'disconnected') {
      disposePeerConn(recipientId);
    }
  });

  peerConn.addEventListener('datachannel', (evt) => {
    const { channel } = evt;
    console.log('Data channel received: ', channel);

    channel.binaryType = 'arraybuffer';
    channel.remoteClientId = recipientId;
    channel.dataReadStates = dataChannelInitialStates();

    channel.addEventListener('message', (evt2) => {
      handleDataChannelMessage(channel, evt2.data);
    });

    channel.addEventListener('close', () => {
      disposePeerConn(recipientId);
    });

    channel.addEventListener('error', (err) => {
      printError(err);
      rej(err);
      disposePeerConn(recipientId);
    });

    const rtcPeerConn = rtcPeerConns.get(recipientId);
    rtcPeerConn.dataChannel = channel;
    res(rtcPeerConn);
  });

  peerConn.setRemoteDescription(new RTCSessionDescription(offer))
    .then(() => peerConn.createAnswer())
    .then(answer => peerConn.setLocalDescription(answer))
    .then(() => {
      sendWS(globalStates.ws, {
        type: 'webrtc-answer',
        data: { to: recipientId, answer: peerConn.localDescription }
      });
    })
    .catch((err) => {
      rej(err);
    });

  rtcPeerConns.set(recipientId, {
    peerConn,
    dataChannel: null,
    meta: {
      rejPromise: rej
    }
  });
});

export const respondToAnswer = async (recipientId, answer) => {
  const { rtcPeerConns } = globalStates;

  if (!rtcPeerConns.has(recipientId)) {
    return;
  }

  await rtcPeerConns.get(recipientId).peerConn.setRemoteDescription(new RTCSessionDescription(answer));
};

export const respondToCandidate = async (recipientId, candidate) => {
  const { rtcPeerConns } = globalStates;

  if (!rtcPeerConns.has(recipientId)) {
    return;
  }

  await rtcPeerConns.get(recipientId).peerConn.addIceCandidate(new RTCIceCandidate(candidate));
};

export const disposePeerConn = (recipientId) => {
  const { rtcPeerConns } = globalStates;

  if (!rtcPeerConns.has(recipientId)) {
    return;
  }

  const { peerConn, dataChannel } = rtcPeerConns.get(recipientId);

  if (dataChannel.readyState !== 'closed' && dataChannel.readyState !== 'closing') {
    dataChannel.close();
  }
  peerConn.close();

  rtcPeerConns.delete(recipientId);
};

const dataChannelInitialStates = () => ({
  fileGroupReadStarted: false,
  fileGroupReadStatus: null,
  fileReadStarted: false,
  filesRead: [],
  currentFile: null
});

export const handleDataChannelMessage = (dataChannel, data) => {
  const { dataReadStates } = dataChannel;

  if (!dataReadStates.fileGroupReadStarted) {
    data = JSON.parse(data);
    dataReadStates.fileGroupReadStatus = {
      progressId: data.progressId,
      size: data.fileGroupSize,
      filesReadCount: 0
    };
    dataReadStates.fileGroupReadStarted = true;
    return;
  }

  if (!dataReadStates.fileReadStarted) {
    data = JSON.parse(data);
    dataReadStates.currentFile = {
      meta: data,
      content: new Blob([], { type: 'octet/stream' }),
      receivedSize: 0
    };
    dataReadStates.fileReadStarted = true;
    return;
  }

  dataReadStates.currentFile.content = new Blob([dataReadStates.currentFile.content, data], { type: 'octet/stream' });
  dataReadStates.currentFile.receivedSize += data.byteLength;

  if (dataReadStates.currentFile.receivedSize >= dataReadStates.currentFile.meta.size) {
    dataReadStates.fileGroupReadStatus.filesReadCount++;
    dataReadStates.filesRead.push(Object.assign(dataReadStates.currentFile.meta, { content: dataReadStates.currentFile }));
    dataReadStates.currentFile = null;
    dataReadStates.fileReadStarted = false;

    if (dataReadStates.fileGroupReadStatus.filesReadCount >= dataReadStates.fileGroupReadStatus.size) {
      dataReadStates.fileGroupReadStarted = false;
      console.log(dataReadStates.filesRead);
    }
  }
};

export const sendToDataChannel = async (progressId, dataChannel, data) => {
  dataChannel.send(JSON.stringify({
    progressId,
    fileGroupSize: data.length
  }));

  for (let i = 0; i < data.length; i++) {
    const fileData = data[i];
    await sendSingleFileToDataChannel(dataChannel, fileData);
  }
};

const sendSingleFileToDataChannel = (dataChannel, fileData) => new Promise((res, rej) => {
  const { meta, content: fileBlob } = fileData;

  // meta should be <= 16Kb
  dataChannel.send(JSON.stringify(meta));

  const fileReader = new FileReader();
  let byteOffset = 0;

  fileReader.addEventListener('error', err => rej(err));
  fileReader.addEventListener('abort', () => rej(new Error('File reading aborted')));

  fileReader.addEventListener('load', (evt) => {
    const abData = evt.target.result;

    dataChannel.send(abData);
    byteOffset += abData.byteLength;

    if (byteOffset < fileBlob.size) {
      readBlobSlice(fileBlob, fileReader, byteOffset);
    } else {
      res();
    }
  });

  readBlobSlice(fileBlob, fileReader, byteOffset);
});

const readBlobSlice = (fileBlob, fileReader, byteOffset) => {
  const slice = fileBlob.slice(byteOffset, byteOffset + WebRTCDataChunkSize);
  fileReader.readAsArrayBuffer(slice);
};
