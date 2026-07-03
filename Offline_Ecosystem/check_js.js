const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('v2.html', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => { console.error("Error:", err); });
virtualConsole.on("warn", (warn) => { console.warn("Warn:", warn); });
virtualConsole.on("info", (info) => { console.info("Info:", info); });
virtualConsole.on("log", (log) => { console.log("Log:", log); });
virtualConsole.on("jsdomError", (err) => { console.error("JSDOM Error:", err); });

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
});
