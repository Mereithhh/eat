export const getURLHash = () => document.location.hash.replace("#", '');
export const sleep = (delay) => new Promise((resolve) => setTimeout(() => resolve(), delay))
export const addEvent = (el,e,fn) => el.addEventListener(e,(ev) => fn(ev))
export const success =(str,d) => Toastify({text: str,duration: d || 2000}).showToast();

