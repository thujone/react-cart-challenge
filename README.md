Shopping cart challenge for AutoAnything.

Here are some issues and caveats I'd like to point out:

* I didn't worry about directory structure and organization too much.
* I built this on Chrome and didn't check other browsers or devices. It's not responsive. If I had more time...
* I only worried about layout insofar as keeping the experience clear and simple. I didn't concern myself too much with how precise the layout looked.
* I think I installed node modules I ended up not needing. I didn't bother to clean it up.
* I loaded the JSON data as js variables instead of fetching them via ajax. To be honest, I struggled with this a fair amount. (There is some commented-out code where you can see what I was trying to do.) I tried to use React state to keep the UI in sync with the fetched data, but for some reason I couldn't get the loaded data to propagate down into the cart module. I'm sure if I had more time, I would have figured it out.


Here are the steps required to get the app running:

* Install project modules: `npm install`
* Start Webpack to watch JSX files: `npm run dev`
* Start Gulp in a separate terminal: `gulp`

