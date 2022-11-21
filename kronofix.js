(function() {
    if(!location.hostname.match('mykronos.com')){
        return
    } 
    var d = document,
        id = "localStorageList",
        el = d.getElementById(id),
        i, s, es, k,
        ls = window.localStorage,
        //ss = window.sessionStorage,
        style = ("<style>$ th, $ td {padding:0 1em;text-align:left;}$ th{font-weight:bold}$ pre{max-width:400px;max-height:300px;overflow:auto;white-space:pre-wrap;}$ h1{font:20px/40px sans-serif;}$ input{}$ a.disabled-link{cursor:default;pointer-events: none;text-decoration: none;color: grey;}</style>").replace(/\$/g,"#"+id);
    if (!el) {
        el = d.createElement("table");
        d.body.appendChild(el);
        el.addEventListener("click",handler,!1);
    }
    function read_db(){
        item = ls.getItem('kronosfix')
        if(item){
            db = JSON.parse(item)
        }
        else{
            db = {}
        }
        return db;
    }
    function write_db(db){
        ls.setItem('kronosfix',JSON.stringify(db))
    }
    function set_item(k, v){
        db = read_db()
        db[k] = v
        write_db(db)
    }
    function del_item(k){
        db = read_db()
        delete db[k]
        write_db(db)
    }
    function item_exists(k){
        db = read_db()
        return db[k] ? true : false
    }
    function get_item(k){
        db = read_db()
        if(db[k]){
            return db[k]
        }
        else{
            return ' '
        }

    }
    function delete_db(){
        ls.removeItem('kronosfix');
    }
    function render() {
        db = read_db()
        s = style + "<tr><th colspan=1><h1>kronosfix</h1><th><a href=# class=f>fix descriptions</a><th><a href=# class=x>close</a><tr><th>project<th>description<th><a href=# class=lpa>paste all</a><th><a href=# class=lca>delete all</a>";
        s += db ? "" : "<tr><td>No Data";

        entry = Object.entries(db)
        for(i=0; i< entry.length; i++){
            [k, v] = entry[i]
            s += (`<tr><td>${k}<td>${v}<td><a href=# data-k=${k} class=lv>paste</a><td><a href=# data-k=${k} class=lc>delete</a>`)
        }
        s += "<tr><td> <input type='text' id='prcode'><td> <input type='text' id='prdescr'> <td><a href=# class=sv>create</a>"
        s += "<tr><th><a href=# class=u>update from last payperiod</a>"
        el.innerHTML = s;
    }
    function delayms(ms) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(true);
          }, ms);
        });
      }
    async function sim_delay(){
        await delayms(4000)
        hrefs = d.querySelectorAll('.lv, .lpa')
        hrefs.forEach(element => {
            element.classList.remove('disabled-link')
        });
    }

    async function add_project_code(k){
        hrefs = d.querySelectorAll('.lv, .lpa')
        hrefs.forEach(element => {
            element.classList.add('disabled-link')
        });

        await addProjectCodeToTimesheet(k)

        hrefs = d.querySelectorAll('.lv, .lpa')
        hrefs.forEach(element => {
            element.classList.remove('disabled-link')
        });
    }

    async function add_all_project_codes(){
        hrefs = d.querySelectorAll('.lv, .lpa')
        hrefs.forEach(element => {
            element.classList.add('disabled-link')
        });

        db = read_db()
        for (const k in db) {
            await addProjectCodeToTimesheet(k)
        }

        hrefs = d.querySelectorAll('.lv, .lpa')
        hrefs.forEach(element => {
            element.classList.remove('disabled-link')
        });
    }

    function fix_descriptions(db){
        const nodeList = document.querySelectorAll("timecard-cell[column='project']")

        for(let i = 0; i < nodeList.length; i++){
            const title = nodeList[i].querySelector("span").getAttribute("title")
            for(const [proj, descr] of Object.entries(db)){
                if(title === proj){
                    nodeList[i].querySelector('span.cellText > span').textContent = proj + ' - ' + descr
                }
            }
        }
    }
    async function getLastPayperiodProjectCodes(){          
        document.querySelector("#_timeFrames_dropdownMenu > span.timeframe.btn-link > button").click();
        await delayms(1000);
      
        document.querySelector("#_timeFrames_expandable > div.timeframe-period > div.mid-content > div > ul > li:nth-child(1)").click();
        await delayms(1000);
      
        const nodeList = document.querySelectorAll("timecard-cell[column='project']")
      
        for(let i = 0; i < nodeList.length; i++){
          const title = nodeList[i].querySelector("span").getAttribute("title")
          if(title.includes('/')){
            if(!item_exists(title)){
                set_item(title,' ')
            }
          }
        } 
        render()  

        document.querySelector("#_timeFrames_dropdownMenu > span.timeframe.btn-link > button").click();
        await delayms(1000);
      
        document.querySelector("#_timeFrames_expandable > div.timeframe-period > div.mid-content > div > ul > li:nth-child(2)").click();
        await delayms(1000);

        db = read_db()
        for (const k in db) {
            v = db[k]
            if(v === ' '){
                descr = await getDescrForProjectCode(k)
                if(descr){
                    set_item(k,descr)
                }
                render()
            }
        }
    }

    async function getDescrForProjectCode(fullProjectCode) {
  
        codeArr = fullProjectCode.split('/');
        projCode = codeArr[0];
        subCode = codeArr[1];
        
        document.querySelector("#addActivityEvent > div:nth-child(2) > button").click();
        await delayms(1000);
      
        document.querySelector("#activityQueriesCombo_toggleBtn").click();
        await delayms(500);
        
        document.querySelector("#activityQueriesCombo_li2").click();
        await delayms(500);
      
        document.querySelector("#activitySearchInput").value = fullProjectCode
        await delayms(500);
      
        document.querySelector("#searchActivity > div.form-group.clearfix.row > button").click();
      
        // wait for the search list to come up with relevant results
        for(let attempts=0; attempts < 90; attempts++){
            await delayms(100);
            nodeList = document.querySelectorAll('.hierarchical-search-results-list-item')
            if(nodeList){
                idx = -1;
                for (let i = 0; i < nodeList.length; i++) {
                  if(nodeList[i].querySelector("span").firstChild.nodeValue === projCode){
                    idx = i;
                    break;
                  }
                }
                
                if(idx > -1){
                    break;
                }
            }
        }
        if(idx < 0){
            alert('timed out waiting for results')
            return 0
        }
      
      
        nodeList[idx].querySelector("div.list-item-actions > button.btn.btn-link.icon-k-caret-right").click();
        await delayms(1000);

        nodeList = document.querySelectorAll('.hierarchical-search-results-list-item')
        idx = 0;
        for (let i = 0; i < nodeList.length; i++) {
          if(nodeList[i].querySelector("span").firstChild.nodeValue === fullProjectCode){
            idx = i;
            break;
          }
        }
      
        nodeList[idx].querySelector("div.list-item-body-selector__wrapper > div").click();
        await delayms(100);
      
        nodeList[idx].querySelector("div.list-item-actions > button").click();
        await delayms(100);
      
        str = document.querySelector("div.popover-inner > div > p:nth-child(2)").textContent
        desc = str.split(':')[1]

        document.querySelector('button.btn.btn-default').click()
        await delayms(500);

        return desc
    }

    async function addProjectCodeToTimesheet(fullProjectCode) {
  
        codeArr = fullProjectCode.split('/');
        projCode = codeArr[0];
        subCode = codeArr[1];
        
        document.querySelector("#addActivityEvent > div:nth-child(2) > button").click();
        await delayms(1000);
      
        document.querySelector("#activityQueriesCombo_toggleBtn").click();
        await delayms(500);
        
        document.querySelector("#activityQueriesCombo_li2").click();
        await delayms(500);
      
        document.querySelector("#activitySearchInput").value = fullProjectCode
        await delayms(500);
      
        document.querySelector("#searchActivity > div.form-group.clearfix.row > button").click();
      
        // wait for the search list to come up with relevant results
        for(let attempts=0; attempts < 90; attempts++){
            await delayms(100);
            nodeList = document.querySelectorAll('.hierarchical-search-results-list-item')
            if(nodeList){
                idx = -1;
                for (let i = 0; i < nodeList.length; i++) {
                  if(nodeList[i].querySelector("span").firstChild.nodeValue === projCode){
                    idx = i;
                    break;
                  }
                }
                
                if(idx > -1){
                    break;
                }
            }
        }
        if(idx < 0){
            alert('timed out waiting for results')
            return 0
        }
      
      
        nodeList[idx].querySelector("div.list-item-actions > button.btn.btn-link.icon-k-caret-right").click();
        await delayms(1000);

        nodeList = document.querySelectorAll('.hierarchical-search-results-list-item')
        idx = 0;
        for (let i = 0; i < nodeList.length; i++) {
          if(nodeList[i].querySelector("span").firstChild.nodeValue === fullProjectCode){
            idx = i;
            break;
          }
        }
      
        nodeList[idx].querySelector("div.list-item-body-selector__wrapper > div").click();
        await delayms(100);
      
        nodeList[idx].querySelector("div.list-item-actions > button").click();
        await delayms(100);
      
        str = document.querySelector("div.popover-inner > div > p:nth-child(2)").textContent
        desc = str.split(':')[1]

        document.querySelector("#activitySelectApply").click();
        await delayms(500);

        db = read_db()
        fix_descriptions(db)
    }

    function handler(e, t) {
        t=e.target;
        e.preventDefault();
        var k = t.getAttribute("data-k");
        switch (t.className) {
            case "lc":
                del_item(k)
                render();
                break;
            case "lv":
                add_project_code(k)
                break;
            case "lca":
                delete_db()
                render();
                break;
            case "lpa":
                add_all_project_codes()
                break;
            case 'f':
                db = read_db()
                fix_descriptions(db)
                render();
                break;
            case "sv":
                let key = d.getElementById('prcode').value
                let val = d.getElementById('prdescr').value
                set_item(key, val)
                render()
                break
            case 'u':
                getLastPayperiodProjectCodes()
                break;
            case "x":
                el.style.display="none";
                break;
        };
    }
    el.setAttribute("id", id);
    el.setAttribute("style","position:fixed;top:20px;right:20px;padding:20px;background:#fff;font:12px/20px monospace;z-index:99999;max-height:100%;overflow:auto;border-radius:10px;border:2px solid #000;");
    el.style.display="block";
    render();
})();