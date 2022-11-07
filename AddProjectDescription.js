let projects = 

{
  "2.01411/4003849": "IR&D ADROIT MK4 Core Tech",
  "2.01412/4003850": "IR&D ADROIT Small Arm Tech",
  "2.01414/4003855": "IR&D WOLF Prod Improvements",
  "2.01448/4003935": "CDC PPE Testing System",
  "2.01480/4003994": "AGES (Arctic Grid Energy Solution)"
}


const nodeList = document.querySelectorAll("timecard-cell[column='project']")

for(let i = 0; i < nodeList.length; i++){
  const title = nodeList[i].querySelector("span").getAttribute("title")
  for(const [proj, descr] of Object.entries(projects)){
    if(title === proj){
      nodeList[i].querySelector('span.cellText > span').textContent = proj + ' - ' + descr
    }
  }
}