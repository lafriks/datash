const globalStates = window.globalStates = {
  publicKey: null,
  privateKey: null,
  symmetricEncKey: null,
  ws: null,
  clientId: null
};

export const updateGlobalStates = (newStates) => {
  Object.assign(globalStates, newStates);
};

export default globalStates;
