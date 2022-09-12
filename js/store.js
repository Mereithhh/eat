
export const Store = class extends EventTarget {
  constructor() {
    super();
    
    this._readStorage();
    window.addEventListener("storage", () => {
      this._readStorage();
      this._save();
    }, false)
    this.i = 0;
  }
  check(includeConfig) {
    if (includeConfig) {
      if (!this.maxKa || !this.numDay ) return false
    } else {
      if (this.data.length ==0) return false;
    }
    return true;
  }
  _readStorage() {
    this.data = JSON.parse(localStorage.getItem(`eatItems`) || "[]")
    if (localStorage.getItem(`numDay`)) this.numDay = localStorage.getItem(`numDay`)
    if (localStorage.getItem(`maxKa`))  this.maxKa = localStorage.getItem(`maxKa`)
  }
  _save() {
    localStorage.setItem(`eatItems`, JSON.stringify(this.data));
    if (this.numDay) localStorage.setItem('numDay',Number(this.numDay))
    if (this.maxKa) localStorage.setItem('maxKa',Number(this.maxKa))
    this.dispatchEvent(new CustomEvent('save'))
  }
  load(data) {
    if (data.numDay) this.numDay = parseInt(data.numDay)
    if (data.maxKa) this.maxKa = parseInt(data.maxKa)
    this.data = data.items;
    this._save();
  }
  export() {
    const result = {items: this.data}
    if (this.numDay) result.numDay = this.numDay
    if (this.maxKa) result.maxKa = this.maxKa
    return result
  }
  addItem(item) {
    const cur = this.data.find((each) => each.name === item.name)
    if (cur) {
      alert("不可重复添加！")
      return false;
    }
    this.data.push({ ...item, id: "_id" + Date.now() })
    this._save();
    return true;
  }
  setNumDay(numDay) {
    this.numDay = numDay
    this._save()
  }
  setMaxKa(maxKa) {
    this.maxKa = maxKa
    this._save()
  }
  removeItem({ id }) {
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
  getPlan() {
    const getSumKa = (arr) => {
      let s = 0;
      arr.forEach(a => s = s + parseInt(a.ka))
      return s
    }
    const sortedArr = this.data.sort((a, b) => parseInt(a.ka) - parseInt(b.ka))
    const minArr = new Array(this.numDay).fill(sortedArr[0])
    const minSum = getSumKa(minArr);
    if (minSum > this.maxKa) {
      alert("当前抽取设置下无法生成满足条件的菜单！将展示最小卡的菜单！")
      return {
        plan: minArr,
        sum: minSum
      }
    }
    let thisPlan = this.randomTimes(this.numDay)
    while (getSumKa(thisPlan) > this.maxKa) {
      thisPlan = this.randomTimes(this.numDay)
    }
    return {
      plan: thisPlan,
      sum: getSumKa(thisPlan)
    }
  }
}