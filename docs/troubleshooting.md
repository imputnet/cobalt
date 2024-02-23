# self-troubleshooting cobalt
```
🚧 this page is work-in-progress. expect more guides to be added in the future!
```
if any issues occur while using cobalt, you can fix many of them yourself. this document aims to provide guides on how to fix most complicated of them.  
use wiki navigation on right to jump between solutions.  

## how to fix clipboard pasting in firefox
you can fix this issue by changing a single preference in `about:config`.

### steps to enable clipboard functionality
1. go to `about:config`:  

   ![screenshot showing about:config entered into address bar](https://github.com/wukko/cobalt/assets/71202418/9ad78612-a372-4949-aeac-99dfc41e273c)  

2. if asked, read what firefox has to say and press "accept the risk and continue".  
 ⚠ tinkering with other preferences may break your browser. **do not** edit them unless you know what you're doing.   

   ![screenshot showing about:config security warning that reads: "proceed with caution. changing advanced configuration preferences can impact firefox performance or security." lower there's a pre-checked checkbox that says: "warn me when i attempt to access these preferences". lowest element is a blue button that says "accept the risk and continue"](https://github.com/wukko/cobalt/assets/71202418/02328729-dbfe-4ea4-b2ca-7bcf1998c2ca)  

3. search for `dom.events.asyncClipboard.readText`  

   ![screenshot showing "dom.events.asyncclipboard.readtext" entered into search on about:config page](https://github.com/wukko/cobalt/assets/71202418/7c7f7e3c-6a6a-40df-8436-277489e72e0b)

4. press the toggle button on very right.  

   ![screenshot showing "dom.events.asyncclipboard.readtext" preference on about:config page with highlighted toggle button on very right](https://github.com/wukko/cobalt/assets/71202418/b45db18e-f4bf-4f1c-9a8c-f13a63a21335)

5. "false" should change to "true".  

   ![screenshot showing "dom.events.asyncclipboard.readtext" preference on about:config page, this one with "true" text highlighted](https://github.com/wukko/cobalt/assets/71202418/4869b4ff-8385-4cd3-ae59-aa2e03a58b5f)

6. go back to cobalt, reload the page, press `paste and download` button again. this time it works! enjoy simpler downloading experience :)
