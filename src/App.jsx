import React, { useReducer, useState, createContext, useContext } from 'react';
import './App.css';

const PRODUCTS = [
  { id: 1, name: 'Wireless Headphones', price: 2999 },
  { id: 2, name: 'Smartwatch', price: 4999 },
  { id: 3, name: 'Mechanical Keyboard', price: 3499 },
  { id: 4, name: 'Gaming Mouse', price: 1499 },
];

const CartContext = createContext();

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find((item) => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return { ...state, cart: [...state.cart, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter((item) => item.id !== action.payload.id),
        };
      }
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    }
    case 'APPLY_COUPON':
      return { ...state, discount: action.payload };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { cart: [], discount: 0 });
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

function ProductList() {
  const { dispatch } = useCart();
  return (
    <div className="section product-section">
      <h2>Products</h2>
      <div className="product-grid">
        {PRODUCTS.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p className="price">₹{product.price}</p>
            <button onClick={() => dispatch({ type: 'ADD_TO_CART', payload: product })}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cart() {
  const { state, dispatch } = useCart();
  const [coupon, setCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  const subtotal = state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = (subtotal * state.discount) / 100;
  const priceAfterDiscount = subtotal - discountAmount;
  const gstAmount = priceAfterDiscount * 0.18;
  const grandTotal = priceAfterDiscount + gstAmount;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.toUpperCase() === 'SAVE10') {
      dispatch({ type: 'APPLY_COUPON', payload: 10 });
      setCouponMsg('10% Coupon Applied Successfully!');
    } else if (coupon.toUpperCase() === 'SAVE20') {
      dispatch({ type: 'APPLY_COUPON', payload: 20 });
      setCouponMsg('20% Coupon Applied Successfully!');
    } else {
      setCouponMsg('Invalid Coupon Code! Try "SAVE10" or "SAVE20"');
    }
  };

  return (
    <div className="section cart-section">
      <h2>Shopping Cart</h2>
      {state.cart.length === 0 ? (
        <p className="empty-cart">Your cart is empty</p>
      ) : (
        <>
          <div className="cart-items">
            {state.cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>₹{item.price} each</p>
                </div>
                <div className="item-controls">
                  <button
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_QUANTITY',
                        payload: { id: item.id, quantity: item.quantity - 1 },
                      })
                    }
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_QUANTITY',
                        payload: { id: item.id, quantity: item.quantity + 1 },
                      })
                    }
                  >
                    +
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleApplyCoupon} className="coupon-form">
            <input
              type="text"
              placeholder="Coupon Code (e.g. SAVE10)"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
            <button type="submit">Apply</button>
          </form>
          {couponMsg && <p className="coupon-msg">{couponMsg}</p>}

          <div className="bill-summary">
            <div className="bill-row">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {state.discount > 0 && (
              <div className="bill-row discount">
                <span>Discount ({state.discount}%):</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="bill-row">
              <span>GST (18%):</span>
              <span>₹{gstAmount.toFixed(2)}</span>
            </div>
            <hr />
            <div className="bill-row grand-total">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <div className="app-container">
        <h1>Online Shopping Cart</h1>
        <div className="dashboard">
          <ProductList />
          <Cart />
        </div>
      </div>
    </CartProvider>
  );
}