import EventEmitter   from 'events'
import React          from 'react'
import assign         from 'object-assign'
import { Dispatcher } from 'flux'

const CartDispatcher = new Dispatcher;

const CartStore = assign({}, EventEmitter.prototype, {

    items: {},
    selection: [],
    nextKey: 0,

    // We need to make sure we're tracking the metadata for each item in the initial cart selection
    init(config) {
        this.items = config.items;
        this.selection = [];

        config.selection.forEach(item => {
            item.quantity = Number(item.quantity);
            item.shippingRate = 0;
            item._key = this.nextKey++;
            if (item.data) {
                this.items[item.id] = item.data;
            } else {
                item.data = this.items[item.id];
            }
            if (!item.data) {
                throw 'Missing data for item \'' + item.id + '\'.';
            }
            this.selection.push(item);
            this.items[item.id]._initialQty = item.quantity;
        });

        this.reIndex();
    },

    // If we add or remove rows, re-index all the items in the selection
    reIndex() {
        let i = 0;
        this.selection.forEach(item => {
            item._index = i++;
        })
    },

    // Get everything in the cart
    getSelection() {
        return this.selection;
    },

    // Is cart empty?
    isEmpty() {
        return !this.selection.length;
    },

    // Get an item in the cart
    getItem(index) {
        return this.selection[index];
    },

    // Add new item to the cart
    addItem(item, quantity, data) {
        if (this.items.hasOwnProperty(item)) {
            data = this.items[item];
        } else {
            this.items[item] = data;
        }
        for (let key in this.selection) {
            if (item === this.selection[key].id) {
                const oldQty = this.selection[key].quantity;
                this.selection[key].quantity += Number(quantity);
                this.emit('change');
                this.emit('item-changed', this.items[item], this.selection[key].quantity, oldQty);
                return;
            }
        }
        // Add any additional metadata to the item.data
        if (data) {
            this.selection.push({
                id       : item,
                quantity : Number(quantity),
                shippingRate: item.shippingRate,
                data     : data,
                _index   : this.selection.length,
                _key     : this.nextKey++
            });
            this.emit('change');
            this.emit('item-added', data);
        }
    },

    // Remove item from the cart and re-index
    removeItem(index) {
        let id   = this.selection[index].id,
            item = this.selection.splice(index, 1)[0];
        this.reIndex();
        this.emit('change');
        this.emit('item-removed', this.items[id]);
    },

    // Update the quantity for an item
    updateQuantity(index, quantity) {
        let item = this.selection[index];
        const oldQty = item.quantity;
        item.quantity = Number(quantity);
        this.emit('change');
        this.emit('item-changed', this.items[item.id], quantity, oldQty);
    },

    // Update the shipping method for an item
    updateShippingRate(index, rate) {
        let item = this.selection[index];
        item.shippingRate = rate;
        this.emit('change');
        this.emit('item-rate-changed', this.items[item.id], rate);
    },

    // Empty the cart
    reset() {
        this.selection = [];
        this.emit('change');
    }

});

CartDispatcher.register(payload => {
    switch (payload.actionType) {
        case 'cart-initialize':
            CartStore.init(payload.config);
            CartStore.emit('ready');
            break
        case 'cart-revert':
            CartStore.init(payload.config);
            CartStore.emit('change');
            break
        case 'cart-add-item':
            CartStore.addItem(payload.key, payload.quantity, payload.item);
            break
        case 'cart-remove-item':
            CartStore.removeItem(payload.index);
            break;
        case 'cart-update-item':
            CartStore.updateQuantity(payload.index, payload.quantity);
            break;
        case 'cart-update-rate':
            CartStore.updateShippingRate(payload.index, payload.rate);
            break;
        case 'cart-reset':
            CartStore.reset();
            break;
    }
});

// The table that contains a <Row> for each shopping cart item
const ContainerComponent = React.createClass({
    render() {
        return (
            <table>
                <thead>
                    <tr>
                        <th className="name">Name</th>
                        <th className="price">Price</th>
                        <th className="quantity">Quantity</th>
                        <th className="shipping">Shipping</th>
                        <th className="total">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.body}
                </tbody>
                <tfoot>
                    <tr>
                        <td className="allowance-label" colSpan={4}>
                            <strong>Subtotal:</strong>
                        </td>
                        <td className="allowance-amount" colSpan={1}>
                            ${this.props.context.subtotal.toFixed(2)}
                        </td>
                    </tr>
                    <tr>
                        <td className="allowance-label" colSpan={4}>
                            <strong>Shipping:</strong>
                        </td>
                        <td className="allowance-amount" colSpan={1}>
                            ${this.props.context.shipping.toFixed(2)}
                        </td>
                    </tr>
                    <tr>
                        <td className="allowance-label" colSpan={4}>
                            <strong>Total:</strong>
                        </td>
                        <td className="allowance-amount" colSpan={1}>
                            ${this.props.context.total.toFixed(2)}
                        </td>
                    </tr>
                </tfoot>

            </table>
        )
    }
});

// The item in the shopping cart
const RowComponent = React.createClass({

    // Event handler for quantity changes
    handleQuantityChange(event) {
        const value = event.target.value;
        if (!isNaN(value) && value > 0) {
            this.props.setItemQty(value);
        }
    },

    // Event handler for shipping method radio button change
    handleShippingRateChange(event) {
        const value = event.target.value;
        if (!isNaN(value) && value >= 0) {
            this.props.setShippingRate(value);
        }
    },

    // Get an arrival or shipping calendar date
    getFutureDate(numberOfDays) {
        let date = new Date();
        date.setDate(date.getDate() + numberOfDays);
        let mm = date.getMonth() + 1,
            dd = date.getDate(),
            yyyy = date.getFullYear();
        return mm + '/' + dd + '/'+ yyyy;
    },

    render() {

        // Determine shipping date text
        // TODO: Figure out a better place to put these variables?
        let leadTimeDays = this.props.item.data.shippingLeadTimeDays,
            leadTimeDate = this.getFutureDate(leadTimeDays);
        let leadTimeText = (leadTimeDays === 0) ? "Ships today" : "Ships on " + leadTimeDate;

        return (
            <tr>
                {this.props.columns.map(column => {
                    return (
                        <td key={column}>
                            {this.props.item.data[column]}
                        </td>
                    )
                })}
                <td>
                    <input
                        type = "number"
                        value = {this.props.item.quantity}
                        onChange = {this.handleQuantityChange} />
                    
                    <button onClick = {this.props.removeItem}>
                        Remove
                    </button>
                </td>
                <td>
                    <div className="lead-time">
                        {leadTimeText}
                    </div>

                    {this.props.shipMethods.map((shipMethod, i) => {

                        // TODO: There must be a better place to put this logic, outside of render()
                        let label = "shipping-option-" + i,
                            rate  = (shipMethod.priceUsd * this.props.item.quantity).toFixed(2);

                        // Humanize rate text
                        let rateText = (shipMethod.priceUsd === 0) ? 'Free' : '+$' + rate;

                        // Determine arrival data based on shipping lead time and delivery duration
                        let arrivalDate = this.getFutureDate(shipMethod.averageTransmitTimeDays + leadTimeDays);
                        return(
                            <div className="shipping-option" key={label}>
                                <p className="shipping-method">
                                    <input
                                        type = "radio"
                                        name = {"radio-" + this.props.item.id}
                                        value = {shipMethod.priceUsd}
                                        checked = {shipMethod.priceUsd == this.props.item.shippingRate}
                                        onChange = {this.handleShippingRateChange}
                                    />
                                    {shipMethod.name} ({rateText})
                                </p>
                                <p className="estimated-arrival">Estimated arrival: {arrivalDate}</p>
                            </div>
                        )
                    })}

                </td>
                <td className="item-amount">
                    ${(this.props.item.data.salePriceUsd * this.props.item.quantity).toFixed(2)}
                </td>
            </tr>
        )
    }
});

const CartStarter = React.createClass({

    propTypes: {
        items:             React.PropTypes.object,
        selection:         React.PropTypes.array,
        shipMethods:       React.PropTypes.array,
        onItemAdded:       React.PropTypes.func,
        onItemRemoved:     React.PropTypes.func,
        onItemQtyChanged:  React.PropTypes.func,
        onItemRateChanged: React.PropTypes.func,
        onChange:          React.PropTypes.func,
        iterator:          React.PropTypes.func,
        cartEmptyMessage:  React.PropTypes.node
    },

    getDefaultProps() {
        return {
            items:              {},
            selection:          [],
            shipMethods:        [],
            onItemAdded:        () => {},
            onItemRemoved:      () => {},
            onItemQtyChanged:   () => {},
            onItemRateChanged:  () => {},
            onChange:           () => {},
            iterator:           () => { return {} },
            containerComponent: ContainerComponent,
            rowComponent:       RowComponent,
            cartEmptyMessage:   (<span>Cart is empty</span>)
        }
    },

    // The cart can have items in it upon page load
    getInitialState() {
        return {
            selection: []
        }
    },

    // Get the item selection stored in state
    refresh() {
        this.setState({
            selection: CartStore.getSelection()
        });
    },

    onChange() {
        this.refresh();
        this.props.onChange();
    },

    componentDidMount() {

        // Add listeners when the component is loaded
        CartStore.on('ready', this.refresh);
        CartDispatcher.dispatch({
            actionType: 'cart-initialize',
            config: {
                items: this.props.items,
                selection: this.props.selection
            }
        });
        CartStore.on('change', this.onChange);
        CartStore.on('item-added', this.props.onItemAdded);
        CartStore.on('item-removed', this.props.onItemRemoved);
        CartStore.on('item-rate-changed', this.props.onItemRateChanged);
        CartStore.on('item-changed', this.props.onItemQtyChanged);
    },

    componentWillUnmount() {

        // Remove listeners before removing component
        CartStore.removeListener('ready', this.refresh);
        CartStore.removeListener('change', this.onChange);
        CartStore.removeListener('item-added', this.props.onItemAdded);
        CartStore.removeListener('item-removed', this.props.onItemRemoved);
        CartStore.removeListener('item-rate-changed', this.props.onItemRateChanged);
        CartStore.removeListener('item-changed', this.props.onItemQtyChanged);
    },

    addItem(key, quantity, item) {
        CartDispatcher.dispatch({
            actionType: 'cart-add-item',
            key: key,
            quantity: quantity,
            item: item
        })
    },
    removeItem(index) {
        CartDispatcher.dispatch({
            actionType: 'cart-remove-item',
            index: index
        })
    },
    updateQuantity(index, quantity) {
        CartDispatcher.dispatch({
            actionType: 'cart-update-item',
            index: index,
            quantity: quantity
        })
    },
    updateShippingRate(index, rate) {
        CartDispatcher.dispatch({
            actionType: 'cart-update-rate',
            index: index,
            rate: rate
        })
    },
    emptyCart() {
        CartDispatcher.dispatch({
            actionType : 'cart-reset'
        });
    },
    reset() {
        CartDispatcher.dispatch({
            actionType: 'cart-revert',
            config: {
                items: this.props.items,
                selection: this.props.selection
            }
        })
    },
    isEmpty() {
        return CartStore.isEmpty()
    },
    getSelection() {
        return CartStore.getSelection()
    },
    render() {
        let context   = this.props.iterator(),
            Container = this.props.containerComponent,
            Row       = this.props.rowComponent;
        if (this.isEmpty()) {
            return (
                <div>
                    {this.props.cartEmptyMessage}
                </div>
            )
        }
        return (
            <Container
                columns = {this.props.columns}
                body = {this.state.selection.map(item => {
                    context = this.props.iterator(context, item);
                    return (
                        <Row
                            key = {item._key}
                            item = {item}
                            columns = {this.props.columns}
                            removeItem = {()  => this.removeItem(item._index)}
                            setItemQty = {qty => this.updateQuantity(item._index, qty)}
                            setShippingRate = {rate => this.updateShippingRate(item._index, rate)}
                            shipMethods = {this.props.shipMethods}
                        />
                    )
                })}
                context = {context}
            />
        )
    }
});

module.exports = CartStarter;
