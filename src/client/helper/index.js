import JSZip from 'jszip';

const charSet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz*&-%/!?*+=()';

export const generateRandomKey = (length) => {
  const ln = charSet.length;
  let key = '';

  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * (ln - 1));
    key += charSet.substring(idx, idx + 1);
  }

  return key;
};

export const sendWS = (wsConn, data) => {
  wsConn.send(JSON.stringify(data));
};

export const displayThis = (condition, display = 'block') => (condition ? display : 'none');

export const displayStyle = (condition, display) => ({ display: displayThis(condition, display) });

export const formatRecipientId = val => val.trim().replace(/[^\d]+/, '');

export const blobToArrayBuffer = blob => new Promise((res, rej) => {
  const fileReader = new FileReader();

  fileReader.addEventListener('loadend', (evt) => {
    res(evt.target.result);
  });

  fileReader.addEventListener('error', (err) => {
    rej(err);
  });

  fileReader.readAsArrayBuffer(blob);
});

export const arrayBufferToBlob = (arrayBuffer, mimeType = 'octet/stream') => new Blob(
  [arrayBuffer],
  { type: mimeType }
);

export const extractFileExt = fileName => /(?:\.([^.]+))?$/.exec(fileName)[1] || '';

export const extractFileNameWithoutExt = (fileName) => {
  const ext = extractFileExt(fileName);
  if (!ext) {
    return fileName;
  }

  return fileName.replace(new RegExp(`\\.${ext}$`), '');
};

export const bytesToHumanReadableString = (bytes) => {
  const thresh = 1024;
  const units = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let unitIdx = -1;

  if (bytes < thresh) {
    return `${bytes} B`;
  }

  do {
    bytes /= thresh;
    unitIdx++;
  } while (Math.abs(bytes) >= thresh && unitIdx < units.length - 1);

  return `${Number.parseFloat(bytes.toFixed(1))} ${units[unitIdx]}`;
};

export const makeZip = async (fileList, outFileName = 'Archive.zip') => {
  const fileNameSet = new Set();
  const zip = new JSZip();

  fileList.forEach((file) => {
    const fileName = getResolvedFileName(file.name, fileNameSet);
    zip.file(fileName, file);
    fileNameSet.add(fileName);
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  zipBlob.name = outFileName;

  return zipBlob;
};

const getResolvedFileName = (fileName, fileNameSet) => {
  let i = 1;
  const ext = extractFileExt(fileName);
  const nameWithoutExt = extractFileNameWithoutExt(fileName);

  while (fileNameSet.has(fileName)) {
    fileName = ext ? `${nameWithoutExt}-${i++}.${ext}` : `${nameWithoutExt}-${i++}`;
  }

  return fileName;
};
