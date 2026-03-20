import React, { useContext, useEffect, useState } from 'react';
import Header from '../Header/Header';
import './product.css'
import ProductCard from './CardProduct';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Footer from '../Footer/Footer';
import { UserDataContext } from '../Header/context';
import { useDispatch } from 'react-redux';
import { addToCart } from '../Redux/Slice';
import { cartAdd } from '../SagaRedux/Slice';
import store from '../SagaRedux/Store';

const ProductSkeleton = () => {
  return (
   <div className='skeletonContainer'>
     <Box
      sx={{
        width: 330,
        padding: '15px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        background: '#fff',
        marginRight:'30px',
        marginLeft:"0"
      }}
      
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height={200}
        sx={{ marginBottom: '12px' }}
      />
      <Skeleton
        variant="text"
        width="80%"
        height={20}
        sx={{ marginBottom: '8px' }}
      />
      <Box sx={{ display: 'flex', gap: 1, marginBottom: '8px' }}>
        <Skeleton variant="text" width={100} height={20} />
        <Skeleton variant="text" width={40} height={20} />
      </Box>
      <Box sx={{ marginBottom: '8px' }}>
        <Skeleton variant="text" width={80} height={32} />
        <Skeleton variant="text" width={120} height={20} />
      </Box>
      <Skeleton
        variant="text"
        width="60%"
        height={20}
        sx={{ marginBottom: '8px' }}
      />
      <Box sx={{ marginBottom: '12px' }}>
        <Skeleton variant="text" width="100%" height={15} />
        <Skeleton variant="text" width="90%" height={15} />
      </Box>
      <Skeleton
        variant="rectangular"
        width="100%"
        height={40}
        sx={{ borderRadius: '20px' }}
      />
    </Box>
   </div>
  );
};

const Product = () => {
  const [filteredProducts, setfilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, products } = useContext(UserDataContext);
   console.log(searchQuery)
  const dispatch = useDispatch();
    
    useEffect(() => {
      dispatch({type: "cart/initialize"});
    }, [dispatch]);

    useEffect(() => {
      window.scrollTo(0, 0);
      if (products.length > 0) {
        const filtered = products.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setfilteredProducts(filtered)
        setLoading(false);
      }
    }, [products,searchQuery]);

     const handleAddToCart = (product1) => {
       dispatch(addToCart(product1));
       const totalQuantity = store.getState().cart.totalQuantity;

       const updatedState = store.getState().cart.itemList;
       const storeItem = updatedState.find(item => item._id === product1._id);
       if (storeItem) {
         const cartItem = {
           productId: storeItem._id,
           name: storeItem.name,
           brand: storeItem.brand,
           category: storeItem.category,
           selectHostel: storeItem.selectHostel,
           hostleName: storeItem.hostleName,
           roomNumber: storeItem.roomNumber,
           dayScholarContectNumber: storeItem.dayScholarContectNumber,
           price: storeItem.price,
           prevPrice: storeItem.prevPrice,
           totalPrice: storeItem.totalPrice,
           image: storeItem.image,
           productQuantity: storeItem.productQuantity,
           quantity: storeItem.quantity,
           totalQuantity: totalQuantity
         };
         dispatch(cartAdd(cartItem));
       }
     };
  return (
    <>
    <div class="stickyHeader">
    <Header showSearch={true} showMiddleHeader={true} isProductsPage={true} />
    </div>
      <div className='min-h-screen h-full' style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center', padding: '20px' }}>
        {loading ? (
          Array.from(new Array(8)).map((_, index) => <ProductSkeleton key={index} />)
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => <ProductCard key={product._id} product={product} handleAddToCart={handleAddToCart} />)
        ) : (
          <p className='text-2xl font-bold mt-16'>"No results found. Try a different keyword or explore other items on College Cart!"</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Product;