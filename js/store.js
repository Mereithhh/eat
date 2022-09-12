export const Store = class extends EventTarget {
  constructor(localStorageKey) {
    super();
    this.localStorageKey = localStorageKey;
    this._readStorage();
    window.addEventListener("storage", () => {
      this._readStorage();
      this._save();
    }, false)
    this.i = 0;
  }
  _readStorage() {
    this.data = JSON.parse(localStorage.getItem(this.localStorageKey) || "[]")
  }
  _save() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.data));
    this.dispatchEvent(new CustomEvent('save'))
  }
  add(item) {

    const cur = this.data.find((each) => each.name === item.name)
    if (cur) {
      alert("不可重复添加！")
      return;
    }
    this.data.push({ ...item, id: "_id" + Date.now() })
    this._save();
  }
  remove({ id }) {
    this.data = this.data.filter(item => item.id !== id);
    this._save();
  }
  randomOne() {
    return this.data[Math.floor(Math.random() * this.data.length)]
  }
  randomTimes(times) {
    const result = [];
    new Array(times).fill(0).forEach(() => result.push(this.randomOne()))
    return result;
  }
  getCircle(restart) {
    if (restart) this.i = 0;
    const result = this.data[this.i % this.data.length]
    this.i += 1
    return result
  }
  getDay(times, maxKa) {

    const getSumKa = (arr) => {
      let s = 0;
      arr.forEach(a => s = s + parseInt(a.ka))
      return s
    }
    const sortedArr = this.data.sort((a, b) => parseInt(a.ka) - parseInt(b.ka))
    const minArr = new Array(times).fill(sortedArr[0])
    const minSum = getSumKa(minArr);
    if (minSum > maxKa) {
      alert("当前抽取设置下无法生成满足条件的菜单！将展示最小卡的菜单！")
      return {
        plan: minArr,
        sum: minSum
      }
    }
    let thisPlan = this.randomTimes(times)
    while (getSumKa(thisPlan) > maxKa) {
      thisPlan = this.randomTimes(times)
    }
    return {
      plan: thisPlan,
      sum: getSumKa(thisPlan)
    }
  }
}