import { MinusIcon, PlusIcon } from 'lucide-react';
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import styles from "./CartProduct.module.css"
import ProductPriceDetails from './ProductPriceDetails';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Skeleton from '@mui/material/Skeleton';
import { getToken } from '../../util/tokenService';
import RemoveCartItem from './RemoveCartItem';
import { useDispatch } from 'react-redux';
import { updateCart } from '../Redux/Slice';

const backend_url = import.meta.env.VITE_BACKEND_API_URL;

const CartProduct = () => {
  const dispatch = useDispatch();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartProductDeleteId, setCartProductDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const textName = (text) => {
    if (!text) return "";
    const words = text.split(' ');
    return words.length > 10 ? words.slice(0, 10).join(' ') + '...' : text;
  };

  const fetchData = async () => {
    const token = getToken()
    try {
      const res = await axios.get(`${backend_url}/all-cart-product`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const items = res.data.item || [];
      setCartItems(items);
      dispatch(updateCart({ item: items }));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQuantityUpdate = async (item, action) => {
    try {
      const updatedQuantity = action === "increase" ? item.quantity + 1 : item.quantity - 1;

      if (updatedQuantity < 1 || updatedQuantity > item.productQuantity) return;

      const data = { quantity: updatedQuantity, totalPrice: updatedQuantity * item.price };
      await axios.put(`${backend_url}/${item._id}/update-quantity-filed`, data);

      setCartItems((prevItems) => {
        const newItems = prevItems.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: updatedQuantity, totalPrice: updatedQuantity * cartItem.price }
            : cartItem
        );
        dispatch(updateCart({ item: newItems }));
        return newItems;
      });

      if (action === "increase") {
        toast.success("Quantity increased");
      } else if (action === "decrease") {
        toast.success("Quantity decreased");
      }

    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
  };


  const handleOpenDeleteDialog = (id) => {
    setCartProductDeleteId(id);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Header Header showSearch={false} showMiddleHeader={true} isProductsPage={false} />
      <div className={styles.header}>
        <div className={styles.container}>
          <div className={styles.cart}>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className={styles.cartItem}>
                  <Skeleton variant="rectangular" width={100} height={100} />
                  <div className={styles.itemDetails}>
                    <Skeleton variant="text" width="60%" height={30} />
                    <Skeleton variant="text" width="40%" height={20} />
                    <Skeleton variant="text" width="30%" height={20} />
                    <Skeleton variant="rectangular" width={120} height={20} />
                  </div>
                </div>
              ))
            ) : (
              cartItems.map((item) => (
                <div key={item._id} className={styles.cartItem}>
                  <div className={styles.imageContainer}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles.image}
                    />
                    <div className={styles.quantityControls}>
                      <button
                        onClick={() => handleQuantityUpdate(item, "decrease")}
                        disabled={item.quantity <= 1}
                        className={`${styles.button} ${item.quantity <= 1 ? styles.buttonDisabled : styles.buttonEnabled}`}
                      >
                        <MinusIcon className={styles.icon} />
                      </button>
                      <input
                        type="text"
                        className={styles.input}
                        value={item.quantity || 1}
                        readOnly
                      />
                      <button
                        onClick={() => handleQuantityUpdate(item, "increase")}
                        disabled={item.quantity >= item.productQuantity}
                        className={`${styles.button} ${item.quantity >= item.productQuantity ? styles.buttonDisabled : styles.buttonEnabled}`}
                      >
                        <PlusIcon className={styles.icon} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.itemDetails}>
                    <h2 className={styles.itemName}>{textName(item.name)}</h2>
                    <p className={styles.itemCategory}>
                      {item.selectHostel === 'Hostler' && `Hostel: ${item.hostleName}`}
                      {item.selectHostel === 'Day_Scholar' && `Student: ${item.selectHostel}`}
                      {item.roomNumber && `, Room: ${item.roomNumber}`}
                      {item.dayScholarContectNumber && `, Contact: ${item.dayScholarContectNumber}`}
                    </p>
                    <p className={styles.itemCategory}>Category: {item.category}</p>
                    <div className={styles.priceDetails}>
                      <span className={styles.price}>&#8377;{item.price}</span>
                      {item.prevPrice && (
                        <>
                          <span className={styles.prevPrice}>&#8377;{item.prevPrice}</span>
                          <span className={styles.discount}>
                            {Math.round((item.prevPrice - item.price) / item.prevPrice * 100)}% off
                          </span>
                        </>
                      )}
                    </div>
                    <div className={styles.actionButtons}>
                      <button className={styles.actionButton}>SAVE FOR LATER</button>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleOpenDeleteDialog(item._id)}
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <ProductPriceDetails cartItem={cartItems} />
        </div>
      </div>
      <RemoveCartItem
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        cartItemId={cartProductDeleteId}
        setCartItem={setCartItems}
      />


      <div className={styles.cartFooter}><Footer /></div>
      <Toaster />
    </>
  );
};

export default CartProduct;