# self-troubleshooting cobalt
```
🚧 this page is work-in-progress. expect more guides to be added in the future!
```
if any issues occur while using cobalt, you can fix many of them yourself. this document aims to provide guides on how to fix most complicated of them.  
use wiki navigation on right to jump between solutions.  

## how to fix clipboard pasting in older versions of firefox
```
🎉 firefox finally supports pasting by default starting from version 125.

👍 you don't need to follow this tutorial if you're on the latest version of firefox.
```
you can fix this issue by changing a single preference in `about:config`.

### steps to enable clipboard functionality
1. go to `about:config`:  
   ![screenshot showing about:config entered into address bar](images/troubleshooting/clipboard/config.png)  

2. if asked, read what firefox has to say and press "accept the risk and continue".  
 ⚠ tinkering with other preferences may break your browser. **do not** edit them unless you know what you're doing.   

   ![screenshot showing about:config security warning that reads: "proceed with caution. changing advanced configuration preferences can impact firefox performance or security." lower there's a pre-checked checkbox that says: "warn me when i attempt to access these preferences". lowest element is a blue button that says "accept the risk and continue"](images/troubleshooting/clipboard/risk.png)  

3. search for `dom.events.asyncClipboard.readText`  

   ![screenshot showing "dom.events.asyncclipboard.readtext" entered into search on about:config page](images/troubleshooting/clipboard/search.png)

4. press the toggle button on very right.  

   ![screenshot showing "dom.events.asyncclipboard.readtext" preference on about:config page with highlighted toggle button on very right](images/troubleshooting/clipboard/toggle.png)

5. "false" should change to "true".  

   ![screenshot showing "dom.events.asyncclipboard.readtext" preference on about:config page, this one with "true" text highlighted](images/troubleshooting/clipboard/toggled.png)

6. go back to cobalt, reload the page, press `paste` button again. this time it works! enjoy simpler downloading experience :)
