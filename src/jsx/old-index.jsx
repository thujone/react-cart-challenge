import React from 'react';
import {render} from 'react-dom';
import CartComponent from './index.jsx';

const myProducts = {
    "product-1" : { "Name" : "Canned Unicorn Meat",   "Price" : "9.99"  },
    "product-2" : { "Name" : "Disappearing Ink Pen",  "Price" : "14.99" },
    "product-3" : { "Name" : "USB Rocket Launcher",   "Price" : "29.99" },
    "product-4" : { "Name" : "Airzooka Air Gun",      "Price" : "29.99" },
    "product-5" : { "Name" : "Star Trek Paper Clips", "Price" : "19.99" }
}

 class App extends React.Component {
  render () {
    return (
        <div>
        <p>Bite me, douche</p>

        <CartComponent selection = {[
              {
                  id       : 'product-2',
                  quantity : 15,
                  data     : myProducts['product-2']
              },
              {
                  id       : 'product-3',
                  quantity : 1,
                  data     : myProducts['product-3']
              }
          ]} />
      </div>
    )
  }
}

render(<App/>, document.getElementById('app'));

