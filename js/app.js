import { addEvent, getURLHash,  success} from "./helper.js";
import { en, zh } from "./language.js";
import { Store } from "./store.js";


class App {
  
  init(config) {
    this.store = new Store()
    this.config = config
    this.lang = window.localStorage.getItem("lang")
    if (!this.lang) {
      window.localStorage.setItem('lang','en')
      this.lang = 'en'
    }
    this.langMap = this.lang == 'en' ? en : zh;
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
      fileInput: document.querySelector("#fileInput"),
      languageBtn: document.querySelector("#language"),
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
        success(this.langMap['importSuccess'])
        this.els.fileInput.value = ''
      }
      reader.readAsText(this.els.fileInput.files[0]);
    })
    addEvent(this.els.languageBtn,'click' ,() => {
      if (this.lang == 'zh') {
        this.lang = 'en'
        localStorage.setItem('lang','en')
        this.els.languageBtn.innerHTML = "中文"
      } else {
        this.lang = 'zh'
        localStorage.setItem('lang','zh')
        this.els.languageBtn.innerHTML = "English"
      }
      this.langMap = this.lang == 'en' ? en : zh;
      this.render();
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
      success(this.langMap['saveSuccess'])
    })
    addEvent(this.els.getOneBtn,'click',()=>this.getOne())
    addEvent(this.els.getDayBtn,'click',()=>this.getDay())
    this.store.addEventListener('save', ()=>this.render());
    window.onhashchange = ()=>{this.render()};
  }
  getOne() {
    if (!this.store.check()) alert(this.langMap['pleaseAddMenu'])
    const result = this.store.randomOne()
    this.els.answer.innerHTML = `<p>${result.name}(${result.ka}${this.langMap['ka']})</p>`
    success(this.langMap['pickSuccess'],700)
  }
  getDay() {
    if (!this.store.check()) alert(this.langMap['pleaseAddMenu'])
    if (!this.store.check(true)) alert(this.langMap['pleaseSetPickConfig'])
    this.rendPlan(this.store.getPlan())
    success(this.langMap['pickSuccess'],700)
  }
  rendLanguage() {
    document.querySelectorAll(`[data-type="text"]`).forEach(el => {
      el.innerHTML = this.langMap[el.getAttribute('data-text-key')]
    })
    document.querySelectorAll(`[data-type="placeholder"]`).forEach(el => {
      el.placeholder = this.langMap[el.getAttribute('data-text-key')]
    })
    document.querySelector("title").innerHTML = this.langMap['title']
  }

  addItem() {
    if (isNaN(Number(this.els.inputKa.value))) {
      alert(this.langMap['mustBeNumber'])
      return 
    }
    const r = this.store.addItem({ name: this.els.inputName.value, ka: Number(this.els.inputKa.value) })
    this.els.inputKa.value = "";
    this.els.inputName.value = ""
    if (r) success(this.langMap['addSuccess'])
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
            <th scope="col">${this.langMap['name']}</th>
            <th scope="col">${this.langMap['energy']}</th>
          </tr>
        </thead>
        <tbody id="table-body">
          ${rendFn()}
          <tr>
            <th scope="col">${this.langMap['total']}</th>
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
        success(this.langMap['delSuccess'])
      }
      btn.innerText = this.langMap['remove']
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
    this.els.title.innerHTML = this.langMap[this.els.page(name).getAttribute('data-title-key')]
  }
  render() {
    this.rendPage(getURLHash() || "main")
    this.rendLanguage();
  }
}
const eatApp = new App();
eatApp.init()
