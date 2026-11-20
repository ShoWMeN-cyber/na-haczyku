const fs=require("node:fs"),path=require("node:path");
const read=n=>fs.readFileSync(path.join(__dirname,n),"utf8");
const js=["data.js","landmarks.js","terrain.js","forest.js","graphics.js","people.js","nature.js","village.js","weather.js","inn.js","reports.js","settlement.js","map.js","bicycle.js","play.js","journal.js","menu.js","client.js"].map(read).join("\n");
new Function(js);
const html=read("shell.html").replace("/*STYLE*/",()=>read("style.css")).replace("/*CODE*/",()=>js);
const destination=process.argv[2]||path.join(__dirname,"dist","index.html");
fs.mkdirSync(path.dirname(destination),{recursive:true});
fs.writeFileSync(destination,html);
