function delayms(ms) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, ms);
    });
  }
  
  let projects=[]
  let projects_object={}
  //let firstTimeSearch = true;
  
  async function getLastPayperiodProjectCodes(){
    projects = []
      
    document.querySelector("#_timeFrames_dropdownMenu > span.timeframe.btn-link > button").click();
    await delayms(1000);
  
    document.querySelector("#_timeFrames_expandable > div.timeframe-period > div.mid-content > div > ul > li:nth-child(1)").click();
    await delayms(1000);
  
    const nodeList = document.querySelectorAll("timecard-cell[column='project']")
  
    for(let i = 0; i < nodeList.length; i++){
      const title = nodeList[i].querySelector("span").getAttribute("title")
      if(title.includes('/')){
        
        projects.push(title)
        
      }
    }
    await delayms(100)
    setCurrentPayPeriodProjectCodes() 
    await delayms(100)
    setProjectDescriptions()
    
  }
  
  async function setCurrentPayPeriodProjectCodes(){
    document.querySelector("#_timeFrames_dropdownMenu > span.timeframe.btn-link > button").click();
    await delayms(100);
  
    document.querySelector("#_timeFrames_expandable > div.timeframe-period > div.mid-content > div > ul > li:nth-child(2)").click();
    await delayms(1000);
  
    projects_object = {}
    for(let i = 0; i < projects.length; i++){
      await addProjectCode(projects[i])
    }
  
    setProjectDescriptions()
    
    prompt("Done\n\Ctrl-A Ctrl-C to copy projects and descriptions", JSON.stringify(projects_object, null, 2))
  }
  
  async function addProjectCode(fullProjectCode) {
  
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
    //if(firstTimeSearch){
    //   await delayms(5000);  
    //}
    //else{
    //  firstTimeSearch = false;
    //  await delayms(2000);    
    //}
  
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
  
    //document.querySelector("#hierarchical-search-list-item-0 > div.list-item-body > div.list-item-body-selector__wrapper > div").click()
    //await delayms(1000);
  
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
    projects_object[fullProjectCode] = desc
  
    document.querySelector("#activitySelectApply").click();
    await delayms(500);
  
    return 0;
  }
  
  //getLastPayperiodProjectCodes()
  
  //setCurrentPayPeriodProjectCodes()
  
  function setProjectDescriptions(){
    const nodeList = document.querySelectorAll("timecard-cell[column='project']")
  
    for(let i = 0; i < nodeList.length; i++){
      const title = nodeList[i].querySelector("span").getAttribute("title")
      for(const [proj, descr] of Object.entries(projects_object)){
        if(title === proj){
          nodeList[i].querySelector('span.cellText > span').textContent = proj + ' - ' + descr
        }
      }
    }
  }
  
  
  
  getLastPayperiodProjectCodes() 
  //setCurrentPayPeriodProjectCodes() 
  //setProjectDescriptions()
  
  
  