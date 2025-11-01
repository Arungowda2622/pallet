import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Share,
  ScrollView,
  FlatList,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ProductDetails = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { product } = route.params;

  const [quantity, setQuantity] = useState(1);
  const [inCart, setInCart] = useState(false);

  const images =
    Array.isArray(product?.variants?.[0]?.images) && product.variants[0].images.length > 0
      ? product.variants[0].images
      : ['https://via.placeholder.com/400'];

      useEffect(()=>{
        console.log(product,"product");
        
      },[])

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this product: ${product.name}\nPrice: ₹${product.price}\n`,
      });
    } catch (err) {
      console.error('Share Error:', err);
    }
  };

  const handleAddToCart = () => {
    setInCart(true);
    console.log('Added to cart:', { ...product, quantity });
  };

  const increaseQty = () => setQuantity(prev => prev + 1);
  const decreaseQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 🖼️ Image Carousel */}
        <FlatList
          data={images}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <FastImage
              source={require('../../assets/placeholderImage.png')}
              style={styles.image}
              resizeMode={FastImage.resizeMode.stretch}
            />
          )}
        />

        {/* ℹ️ Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>₹{product.price ?? '—'}</Text>
          <Text style={styles.description}>
            {product.description ?? 'No description available.'}
          </Text>

          {/* 📋 Example Specs */}
          <View style={styles.specs}>
            <Text style={styles.specTitle}>Specifications:</Text>
            <Text style={styles.specItem}>• SKU: {product?.variants?.[0]?.variantId || 'N/A'}</Text>
            <Text style={styles.specItem}>
              • Barcode: {product?.variants?.[0]?.barcodes?.[0] || 'N/A'}
            </Text>
          </View>

          {/* 🔢 Quantity Selector */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.qtyBtn} onPress={decreaseQty}>
              <FastImage
                source={require('../../assets/minus.png')}
                style={styles.iconSmall}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>

            <Text style={styles.qtyText}>{quantity}</Text>

            <TouchableOpacity style={styles.qtyBtn} onPress={increaseQty}>
              <FastImage
                source={require('../../assets/plus.png')}
                style={styles.iconSmall}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
          </View>

          {/* 🛒 Add/Update Cart */}
          <TouchableOpacity
            style={[styles.cartBtn, { backgroundColor: inCart ? '#28a745' : '#007AFF' }]}
            onPress={handleAddToCart}
          >
            <FastImage
              source={
                inCart
                  ? require('../../assets/checkmark.png')
                  : require('../../assets/cart-outline.jpg')
              }
              style={styles.iconMedium}
              resizeMode={FastImage.resizeMode.contain}
            />
            <Text style={styles.cartBtnText}>
              {inCart ? 'Added to Cart' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>

          {/* 📤 Share Button */}
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <FastImage
              source={require('../../assets/share.png')}
              style={styles.iconSmall}
              resizeMode={FastImage.resizeMode.contain}
            />
            <Text style={styles.shareText}>Share Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 🔙 Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <FastImage
          source={require('../../assets/back.jpg')}
          style={styles.iconSmall}
          resizeMode={FastImage.resizeMode.contain}
        />
      </TouchableOpacity>
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: width, height: width, backgroundColor: '#f0f0f0' },
  infoContainer: { padding: 16 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  price: { fontSize: 18, fontWeight: '600', color: '#007AFF', marginBottom: 12 },
  description: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 16 },
  specs: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  specTitle: { fontWeight: 'bold', marginBottom: 4, color: '#333' },
  specItem: { fontSize: 13, color: '#555', marginBottom: 2 },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  qtyBtn: {
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 8,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  cartBtnText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  shareText: { color: '#007AFF', marginLeft: 6, fontWeight: '600' },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#00000080',
    padding: 8,
    borderRadius: 20,
  },
  iconSmall: { width: 20, height: 20, tintColor: '#333' },
  iconMedium: { width: 22, height: 22, tintColor: '#fff', marginRight: 8 },
});
