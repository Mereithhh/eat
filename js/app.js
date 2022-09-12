import { getURLHash, setHash, sleep } from "./helper.js";
import { Store } from "./store.js";

const Data = new Store('eatItems');

const App = {
  $: {
    page: (name) => document.querySelector(`[data-page="${name}"]`),
    routerBtns: document.querySelectorAll(`[data-role="router"]`),
    pages: document.querySelectorAll('.page'),
    title: document.querySelector('#title'),
    addBtn: document.querySelector("#addBtn"),
    inputName: document.querySelector("#name"),
    inputKa: document.querySelector("#ka"),
    inputMaxKa: document.querySelector("#maxKa"),
    listBody: document.querySelector("#table-body"),
    getOneBtn: document.querySelector("#getOneBtn"),
    saveSettingBtn: document.querySelector("#saveSettingBtn"),
    answer: document.querySelector("#answer"),
    getDayBtn: document.querySelector("#getDayBtn"),
    inputNumDay: document.querySelector("#numDay"),
  },
  bindEvent(event, el, handler) {
    el.addEventListener(event, (e) => { handler(e) })
  },
  init(times) {
    Data.addEventListener('save', App.render);
    window.onhashchange = App.render;
    App.bindEvent('click', App.$.addBtn, () => {
      const r = Data.add({ name: App.$.inputName.value, ka: Number(App.$.inputKa.value) })
      App.$.inputKa.value = "";
      App.$.inputName.value = ""
      if (r) {
        Toastify({
          text: "添加成功！",
        }).showToast();
      }
    })
    App.$.routerBtns.forEach(btn => {
      const path = btn.getAttribute("data-path")
      btn.addEventListener('click', () => {
        if (path == 'back') {
          history.go(-1)
        } else {
          setHash(path)
        }
      })
    })
    App.$.saveSettingBtn.addEventListener('click', () => {
      localStorage.setItem("maxKa", Number(App.$.inputMaxKa.value))
      localStorage.setItem("numDay", Number(App.$.inputNumDay.value))
      Toastify({
        text: "保存成功！",
      }).showToast();
      history.go(-1)
    })
    App.$.getDayBtn.addEventListener('click', async () => {
      if (Data.data.length == 0) {
        alert("请先添加菜单！")
        return;
      }
      const maxKa = parseInt(localStorage.getItem("maxKa"))
      const numDay = parseInt(localStorage.getItem("numDay"))

      const ok = [maxKa, numDay].every(e => !isNaN(e))
      if (!ok) {
        alert("请先在设置中设置抽取信息！")
        return;
      }
      App.renderDayResult(Data.getDay(numDay, maxKa))
    })
    App.bindEvent('click', App.$.getOneBtn, async () => {
      if (Data.data.length == 0) {
        alert("请先添加菜单！")
        return;
      }
      for (let i = 0; i < times; i++) {
        await sleep(50);
        const temp = Data.getCircle()
        App.$.answer.innerHTML = `<p>${temp.name}</p>`
      }
      const result = Data.randomOne()
      App.$.answer.innerHTML = `<p>${result.name}(${result.ka}大卡)</p>`
    })
    App.render();
  },
  renderDayResult({ plan, sum }) {
    const renderFn = () => {
      let s = ``;
      plan.forEach(item => {
        s = s + `<tr>
            <th scope="col">${item.name}</th>
            <td>${item.ka}</td>
          </tr>`
      })
      return s
    }
    App.$.answer.innerHTML = `
    <table>
        <thead>
          <tr>
            <th scope="col">名称</th>
            <th scope="col">能量(大卡)</th>
          </tr>
        </thead>
        <tbody id="table-body">
          ${renderFn()}
          <tr>
            <th scope="col">总计</th>
            <td>${sum}</td>
          </tr>
        </tbody>
      </table>
    `
  },
  renderList() {
    App.$.listBody.innerHTML = "";
    Data.data.forEach(item => {
      const tr = document.createElement('tr')
      const th = document.createElement('th')
      const td = document.createElement('td')
      const tdKa = document.createElement('td')
      const btn = document.createElement('a')
      tdKa.innerHTML = item.ka;
      th.scope = "raw"
      th.innerHTML = item.name;
      btn.style.outline = 'none'
      btn.onclick = () => {
        Data.remove(item)
        Toastify({
          text: "删除成功！",
        }).showToast();
      }
      btn.innerText = '删除'
      td.appendChild(btn)
      tr.appendChild(th)
      tr.appendChild(tdKa)
      tr.appendChild(td)
      App.$.listBody.appendChild(tr)
    })
  },
  togglePage(pageName) {
    App.$.pages.forEach(p => {
      p.classList.remove("active")
    })
    App.$.page(pageName).classList.add("active")
    if (pageName == "setting-data") {
      App.renderList();
    }
    if (pageName == "setting-get") {
      const maxKa = parseInt(localStorage.getItem("maxKa"))
      const numDay = parseInt(localStorage.getItem("numDay"))
      if (!isNaN(maxKa)) {
        App.$.inputMaxKa.value = maxKa
      }
      if (!isNaN(numDay)) {
        App.$.inputNumDay.value = numDay
      }
    }
    App.$.title.innerHTML = App.$.page(pageName).getAttribute("data-title")
  },
  render() {
    App.togglePage(getURLHash() || 'main')
  }
}

App.init(10);