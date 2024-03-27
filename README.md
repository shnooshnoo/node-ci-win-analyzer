### How to update & deploy data

All these commands to be run in `main` branch.

0. install deps if you haven't done it yet - `npm i`
1. run `npm run update` command. This will send requests to Jenkins, fetch new data and store it in /history folder. May take several minutes depending on how much time passed since the last run of this command.
2. run `npm run build` command. This will compile data into json files and save it in /dist folder.
3. commit & push. Any push to the main branch will trigger automatic deploy to gh pages.
