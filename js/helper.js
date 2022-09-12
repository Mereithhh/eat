export const getURLHash = () => document.location.hash.replace("#", '');
export const setHash = (str) => {
  location.hash = str
}
export const sleep = (delay) => new Promise((resolve) => setTimeout(() => resolve(), delay))