import { addEvent, getURLHash,  success} from "./helper.js";
import { Store } from "./store.js";


class App {
  
  init(config) {
    this.store = new Store()
    this.config = config
    this.els = {
      pages: document.querySelectorAll(`.page`),
      routerBtns: document.querySelector(`[data-role="router"]`),
      page: (name) => document.querySelector(`[data-page="${name}"]`),
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
      importBtn: document.querySelector("#importBtn"),
      exportBtn: document.querySelector("#exportBtn"),
      inputNumDay: document.querySelector("#numDay"),
      fileInput: document.querySelector("#fileInput")
    }
    this.bindEvent();
    this.render();
  }
  bindEvent() {
    addEvent(this.els.addBtn,'click',()=> this.addItem())
    addEvent(this.els.importBtn,'click',() => this.els.fileInput.click())
    addEvent(this.els.fileInput,'change',() => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = JSON.parse(reader.result)
        this.store.load(data);
        success("导入成功！")
        this.els.fileInput.value = ''
      }
      reader.readAsText(this.els.fileInput.files[0]);
    })
    addEvent(this.els.exportBtn,'click',() => {
      const data = new Blob([JSON.stringify(this.store.export(),null,2)]);
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export-${new Date().toLocaleTimeString()}.json`;
      link.click();
    })
    addEvent(this.els.saveSettingBtn,'click',() => {
      const numDay  = Number(this.els.inputNumDay.value)
      const maxKa = Number(this.els.inputMaxKa.value)
      if (maxKa && maxKa > 0) this.store.setMaxKa(maxKa)
      if (numDay && numDay > 0) this.store.setNumDay(numDay)
      success("保存成功！")
    })
    addEvent(this.els.getOneBtn,'click',()=>this.getOne())
    addEvent(this.els.getDayBtn,'click',()=>this.getDay())
    this.store.addEventListener('save', ()=>this.render());
    window.onhashchange = ()=>{this.render()};
  }
  getOne() {
    if (!this.store.check()) alert("请先添加菜单！")
    const result = this.store.randomOne()
    this.els.answer.innerHTML = `<p>${result.name}(${result.ka}大卡)</p>`
    success("抽取完成！",700)
  }
  getDay() {
    if (!this.store.check()) alert("请先添加菜单！")
    if (!this.store.check(true)) alert("请先设置抽取配置！")
    this.rendPlan(this.store.getPlan())
    success("抽取完成！",700)
  }

  addItem() {
    if (isNaN(Number(this.els.inputKa.value))) {
      alert("能量必须填数字！")
      return 
    }
    const r = this.store.addItem({ name: this.els.inputName.value, ka: Number(this.els.inputKa.value) })
    this.els.inputKa.value = "";
    this.els.inputName.value = ""
    if (r) success("添加成功！")
  }
  rendPlan({plan,sum}) {
    const rendFn = () => {
      let s = ``;
      plan.forEach(item => {
        s = s + `<tr>
            <th scope="col">${item.name}</th>
            <td>${item.ka}</td>
          </tr>`
      })
      return s
    }
    this.els.answer.innerHTML = `
    <table>
        <thead>
          <tr>
            <th scope="col">名称</th>
            <th scope="col">能量(大卡)</th>
          </tr>
        </thead>
        <tbody id="table-body">
          ${rendFn()}
          <tr>
            <th scope="col">总计</th>
            <td>${sum}</td>
          </tr>
        </tbody>
      </table>
    `
  }
  rendList() {
    this.els.listBody.innerHTML = "";
    this.store.data.forEach(item => {
      const tr = document.createElement('tr')
      const th = document.createElement('th')
      const td = document.createElement('td')
      const tdKa = document.createElement('td')
      const btn = document.createElement('a')
      tdKa.innerHTML = item.ka;
      th.scope = "row"
      th.innerHTML = item.name;
      btn.onclick = () => {
        this.store.removeItem(item)
        success("删除成功！")
      }
      btn.innerText = '删除'
      td.appendChild(btn)
      tr.appendChild(th)
      tr.appendChild(tdKa)
      tr.appendChild(td)
      this.els.listBody.appendChild(tr)
    })
  }
  renderConfig() {
    if (this.store.maxKa) this.els.inputMaxKa.value = this.store.maxKa
    if (this.store.numDay) this.els.inputNumDay.value = this.store.numDay
  }
  rendPage(name) {
    this.els.pages.forEach(p => p.classList.remove("active"))
    this.els.page(name).classList.add('active')
    if (name == 'setting-data') this.rendList()
    if (name == "setting-get") this.renderConfig()
    this.els.title.innerHTML = this.els.page(name).getAttribute('data-title')
  }
  render() {
    this.rendPage(getURLHash() || "main")
  }
}
const eatApp = new App();
eatApp.init()
