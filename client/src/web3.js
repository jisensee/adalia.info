export async function requestTx(targetAddress) {
  if (!window.ethereum) {
    return Promise.reject();
  }
  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    await ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: accounts[0],
          to: targetAddress,
        },
      ],
    });
  } catch (error) {
    return Promise.reject();
  }
}
