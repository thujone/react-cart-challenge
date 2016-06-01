import React from 'react'
import {render} from 'react-dom';
import Cart  from './CartModule.jsx';

// Items already in the shopping cart
const shoppingCartItems = [
    {
        id: "5743a43aaf03dd6987babfae",
        name: "K&N Air Filter",
        salePriceUsd: 49.99,
        shippingLeadTimeDays: 0
    },
    {
        id: "5743a43ad593219e4e167ddf",
        name: "Weathertech All-Weather Floor Mats",
        salePriceUsd: 99.99,
        shippingLeadTimeDays: 5
    }
];

// Shipping methods
const shipMethods = [
    {
        name: "Standard Ground Shipping",
        priceUsd: 0,
        averageTransmitTimeDays: 5
    },
    {
        name: "Expedited Overnight Shipping",
        priceUsd: 5.99,
        averageTransmitTimeDays: 1
    }
];

// Initial cart items have to be massaged somewhat before feeding into the cart
let initialCartSelection = [];
shoppingCartItems.forEach(item => {
    let cartSelection = {
        id: item.id,
        quantity: 1,
        data: {
            name: item.name,
            salePriceUsd: item.salePriceUsd,
            shippingLeadTimeDays: item.shippingLeadTimeDays
        }
    };
    initialCartSelection.push(cartSelection);
});



const CartComponent = React.createClass({

    // Keeps subtotals and other page-level numbers accurate
    rowIterator(context, row) {
        if (!context) {

            // Initialize context for tracking totals and subtotals
            return {
                itemTotal: 0,
                subtotal: 0,
                shipping: 0,
                total: 0
            }
        } else {
            // Invoke for each row
            const price = Number(row.data['salePriceUsd']);
            let subtotal = context.subtotal + (row.quantity * price),
                shipping = context.shipping + (row.quantity * row.shippingRate);
            let total = subtotal + shipping;

            return {
                itemTotal: row.quantity * price,
                subtotal: subtotal,
                shipping: shipping,
                total: total
            }
        }
    },

    addItem(key, data) {
        this.refs.cart.addItem(key, data);
    },

    componentDidMount: function() {
        /* NOTE: I initially fetched all the data by ajax, but I ran into issues keeping the child
           component and grandchildren updated. render() and forceUpdate() didn't seem to work as expected.
           I assume there's some issue with state vs. prop, but instead of getting too stuck I just
           decided to load the json data as js variables.
        */

        // // Fetch the shopping cart data
        // this.shoppingCartItemsRequest = $.getJSON(shoppingCartItemsUrl, function(result) {
        //     shoppingCartItems = result.shoppingCartItems;
        //
        //     // Massage data to pass into the shopping cart
        //     shoppingCartItems = _.keyBy(shoppingCartItems, function(item) {
        //         return item.id;
        //     });
        //
        //     // Update state of shopping cart item list
        //     this.setState({
        //        shoppingCartItems: shoppingCartItems
        //     });
        // }.bind(this));
        //
        // // Fetch shipping methods json
        // this.shipMethodsRequest = $.getJSON(shipMethodsUrl, function (result) {
        //     shipMethods = result.shipMethods;
        //
        //     // Update state of shipping methods
        //     this.setState({
        //        shipMethods: shipMethods
        //     });
        // }.bind(this));
    },

    componentWillUnmount: function() {
        //this.shoppingCartItemsRequest.abort();
        //this.shipMethodsRequest.abort();
    },

    render() {
        return (
            <div>
                <h1>Shopping Cart</h1>
                <Cart ref="cart" columns={["name", "salePriceUsd"]} selection={initialCartSelection}
                      iterator={this.rowIterator} shipMethods={shipMethods} />
            </div>
        )
    }

})

render(
    <CartComponent products={shoppingCartItems} />,
    document.getElementById('app')
)
