import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import FastImage from 'react-native-fast-image';

const { width } = Dimensions.get('window');
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (width - ITEM_MARGIN * 3) / 2;

// Define product type (adjust fields based on your API)
interface Product {
  id: string | number;
  name: string;
  price?: number | string;
  description?: string;
  variants?: { images?: string[] | string }[];
}

type CartItem = Product;
type WishlistItem = Product;

const ProductsScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 🕒 Debounce search
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchData(true);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async (reset = false) => {
    try {
      if (reset) setLoading(true);

      // Mock Data
      const data = {
        data: {
          totalRecords: 3,
          totalPages: 1,
          data: [
            {
              id: '101',
              name: 'Apple iPhone 15 Pro',
              price: '1299',
              description: 'Latest iPhone with A17 Pro chip and titanium body.',
              variants: [
                {
                  images: [
                    'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-blue-titanium',
                    'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-gallery-2-202309',
                  ],
                   barcodes: "5555500000012",
                },
              ],
            },
            {
              id: '102',
              name: 'Samsung Galaxy S24 Ultra',
              price: '1199',
              description: 'Flagship Galaxy phone with AI-powered camera and S-Pen support.',
              variants: [
                {
                  images: [
                    'https://images.samsung.com/is/image/samsung/p6pim/levant/galaxy-s24-ultra-highlights-kv-mo-img',
                    'https://images.samsung.com/is/image/samsung/p6pim/levant/galaxy-s24-ultra-design-1-img',
                  ],
                   barcodes: "5555500000012",
                },
              ],
            },
            {
              id: '103',
              name: 'Sony WH-1000XM5 Headphones',
              price: '399',
              description: 'Industry-leading noise cancellation wireless headphones.',
              variants: [
                {
                  images: [
                    'https://m.media-amazon.com/images/I/61+d5Fz6a4L._AC_SL1500_.jpg',
                    'https://m.media-amazon.com/images/I/61vL3oJr8bL._AC_SL1500_.jpg',
                  ],
                  barcodes: "5555500000012",
                },
              ],
            },
            {
              id: '104',
              name: 'Sony  Headphones',
              price: '599',
              description: 'Industry-leading noise cancellation wireless headphones.',
              variants: [
                {
                  images: [
                    'https://m.media-amazon.com/images/I/61+d5Fz6a4L._AC_SL1500_.jpg',
                    'https://m.media-amazon.com/images/I/61vL3oJr8bL._AC_SL1500_.jpg',
                  ],
                  barcodes: "5555500000012",
                },
              ],
            },
          ],
        },
      };

      const newProducts = data.data.data || [];
      setTotalPages(data.data.totalPages || 1);
      setProducts(reset ? newProducts : [...products, ...newProducts]);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchData(true);
  };

  const handleLoadMore = () => {
    if (!loading && page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const toggleCart = (item: Product) => {
    setCart(prev =>
      prev.some(p => p.id === item.id)
        ? prev.filter(p => p.id !== item.id)
        : [...prev, item]
    );
  };

  const toggleWishlist = (item: Product) => {
    setWishlist(prev =>
      prev.some(p => p.id === item.id)
        ? prev.filter(p => p.id !== item.id)
        : [...prev, item]
    );
  };

  const handleClick = (item: Product) => {
    navigation.navigate('ProductDetails', { product: item });
  };

  const renderItem = useCallback(
    ({ item }: { item: Product }) => {
      const inCart = cart.some(p => p.id === item.id);
      const inWishlist = wishlist.some(p => p.id === item.id);

      const imageUri =
        Array.isArray(item?.variants?.[0]?.images)
          ? item.variants?.[0]?.images?.[0]
          : item?.variants?.[0]?.images;

      return (
        <TouchableOpacity
          onPress={() => handleClick(item)}
          style={styles.card}
          activeOpacity={0.8}>
          <FastImage
            style={styles.image}
            source={require('../../assets/placeholderImage.png')}
            resizeMode={FastImage.resizeMode.cover}
          />

          <Text style={styles.name} numberOfLines={2}>
            {item?.name || 'No Name'}
          </Text>
          <Text style={styles.price}>₹{item?.price || 'N/A'}</Text>

          <View style={styles.actions}>
            <TouchableOpacity onPress={() => toggleCart(item)}>
              <FastImage
                source={
                  inCart
                    ? require('../../assets/cart-filled.jpeg')
                    : require('../../assets/cart-outline.jpg')
                }
                style={styles.iconImage}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => toggleWishlist(item)}>
              <FastImage
                source={
                  inWishlist
                    ? require('../../assets/heart-filled.png')
                    : require('../../assets/heart-outline.png')
                }
                style={styles.iconImage}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [cart, wishlist]
  );

  const getItemLayout = useCallback(
    (_, index) => ({
      length: ITEM_WIDTH + 100,
      offset: (ITEM_WIDTH + 100) * index,
      index,
    }),
    []
  );

  if (loading && page === 1) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchData(true)}>
          <Text style={{ color: '#fff' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔍 Search */}
      <TextInput
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBox}
      />

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        initialNumToRender={6}
        windowSize={10}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={
          loading && page > 1 ? (
            <ActivityIndicator size="small" color="#007AFF" style={{ margin: 10 }} />
          ) : null
        }
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>No products found</Text>
          )
        }
      />

      {/* 🛒 Floating Cart Button */}
      {cart.length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("CartScreen",{ cart })}>
          <FastImage
            source={require('../../assets/cart-filled.jpeg')}
            style={styles.cartIcon}
            resizeMode={FastImage.resizeMode.contain}
          />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cart.length}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ProductsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', marginTop: 30 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 10, paddingBottom: 100 },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    width: ITEM_WIDTH,
    marginBottom: ITEM_MARGIN * 2,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: ITEM_WIDTH,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  name: { fontSize: 14, fontWeight: '600', marginTop: 6, color: '#333' },
  price: { fontSize: 13, color: '#007AFF', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#777' },
  searchBox: {
    margin: 10,
    padding: 10,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cartButton: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 30,
    elevation: 5,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  errorText: { color: '#d00', marginBottom: 10 },
  retryBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  iconImage: { width: 24, height: 24 },
  cartIcon: { width: 28, height: 28, tintColor: '#fff' },
});
