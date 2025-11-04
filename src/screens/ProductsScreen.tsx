import axios from 'axios';
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
import { saveCart, loadCart } from '../utils/storage';

const { width } = Dimensions.get('window');
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (width - ITEM_MARGIN * 3) / 2;

interface Product {
  id: string | number;
  name: string;
  price?: number | string;
  description?: string;
  image?: string;
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
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // 🔍 Debounced Search + Pagination
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData(page, searchQuery, page === 1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [page, searchQuery]);

  useEffect(() => {
    // Load stored cart when screen mounts
    (async () => {
      const storedCart = await loadCart();
      if (storedCart) setCart(storedCart);
    })();
  }, []);

  const fetchData = async (pageNum = 1, query = '', reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const response = await axios.post(
        'https://catalog-management-system-dev-ak3ogf6zea-uc.a.run.app/cms/product/v2/filter/product',
        {
          page: pageNum.toString(),
          pageSize: '10',
          sort: { creationDateSortOption: 'DESC' },
          searchText: query || undefined,
        },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'x-internal-call': 'true',
          },
        }
      );

      const apiData = response.data?.data;
      const newProducts =
        apiData?.data?.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price || 'N/A',
          description: item.shortDescription || item.description || '',
          image:
            item.imageUrls?.[0] ||
            item.variants?.[0]?.images?.[0] ||
            'https://via.placeholder.com/150',
        })) || [];

      setTotalPages(apiData?.totalPages || 1);
      setProducts(prev => (reset ? newProducts : [...prev, ...newProducts]));
      setError(null);
    } catch (err: any) {
      console.error('❌ Error fetching products:', err.message);
      setError('Failed to load products.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchData(1, searchQuery, true);
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const toggleCart = async (item: Product) => {
    let updatedCart: Product[];

    const existingItem = cart.find(p => p.id === item.id);
    if (existingItem) {
      updatedCart = cart.filter(p => p.id !== item.id);
    } else {
      updatedCart = [...cart, { ...item, quantity: 1 }];
    }

    setCart(updatedCart);
    await saveCart(updatedCart); // 👈 persist in AsyncStorage
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
      console.log(item, "listItem");
      const imageUri =
        !item.image ||
          item.image === 'https://via.placeholder.com/150' ||
          item.image.trim() === ''
          ? null
          : item.image;
      return (
        <TouchableOpacity
          onPress={() => handleClick(item)}
          style={styles.card}
          activeOpacity={0.8}>
          <FastImage
            style={styles.image}
            source={
              imageUri
                ? { uri: imageUri, priority: FastImage.priority.normal }
                : require('../../assets/placeholderImage.png')
            }
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
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => fetchData(1, searchQuery, true)}>
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
        onChangeText={text => {
          setProducts([]);
          setPage(1);
          setSearchQuery(text);
        }}
        style={styles.searchBox}
      />

      {/* 🧾 Product List */}
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#007AFF" style={{ margin: 10 }} />
          ) : null
        }
        removeClippedSubviews={true}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH + ITEM_MARGIN * 2,
          offset: (ITEM_WIDTH + ITEM_MARGIN * 2) * index,
          index,
        })}
      />

      {/* 🛒 Floating Cart Button */}
      <TouchableOpacity
        style={styles.floatingCart}
        onPress={() => navigation.navigate('CartScreen', { cart })}>
        <FastImage
          source={require('../../assets/top-cart.png')}
          style={styles.floatingCartIcon}
          resizeMode={FastImage.resizeMode.contain}
        />
        {cart.length > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cart.length}</Text>
          </View>
        )}
      </TouchableOpacity>
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  iconImage: { width: 24, height: 24 },
  errorText: { color: '#d00', marginBottom: 10 },
  retryBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchBox: {
    margin: 10,
    padding: 10,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  floatingCart: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 50,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  floatingCartIcon: { width: 28, height: 28, tintColor: '#fff' },
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
});
