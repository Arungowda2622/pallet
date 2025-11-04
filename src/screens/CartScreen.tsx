import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { loadCart, saveCart, clearCart } from '../utils/storage';
import Header from './Header';

export default function CartScreen({ navigation }: any) {
  const [cart, setCart] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCartFromStorage();
  }, []);

  const loadCartFromStorage = async () => {
    const storedCart = await loadCart();
    setCart(storedCart);
    calculateTotal(storedCart);
  };

  const calculateTotal = (items: any[]) => {
    const subtotal = items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      return sum + price * (item.quantity || 1);
    }, 0);
    setTotal(subtotal);
  };

  const updateQuantity = async (id: string, delta: number) => {
    const updatedCart = cart.map(item =>
      item.id === id ? { ...item, quantity: Math.max(item.quantity + delta, 1) } : item
    );
    setCart(updatedCart);
    calculateTotal(updatedCart);
    await saveCart(updatedCart);
  };

  const removeItem = async (id: string) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    calculateTotal(updatedCart);
    await saveCart(updatedCart);
  };

  const handleCheckout = () => {
    alert('Proceeding to checkout...');
  };

  const handleClearCart = async () => {
    await clearCart();
    setCart([]);
    setTotal(0);
  };

  const handleScanBarcode = () => {
    navigation.navigate('BarcodeScanner'); // ✅ Navigate to BarcodeScanner screen
  };

  const getImageSource = (imageUrl: string | null | undefined) => {
    if (!imageUrl || imageUrl.trim() === '' || imageUrl === 'https://via.placeholder.com/150') {
      return require('../../assets/placeholderImage.png');
    }
    return { uri: imageUrl };
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="My Cart" />

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../../assets/empty_cart.jpeg')}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity onPress={handleClearCart} style={styles.continueButton}>
            <Text style={styles.continueButtonText}>Continue Shopping</Text>
          </TouchableOpacity>

          {/* ✅ Add Scan Barcode Button when cart is empty too */}
          <TouchableOpacity onPress={handleScanBarcode} style={styles.scanButton}>
            <Text style={styles.scanButtonText}>Scan Barcode</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.cartCard}>
                <Image source={getImageSource(item.image)} style={styles.image} />
                <View style={styles.detailsContainer}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.price}>₹{item.price}</Text>

                  <View style={styles.actionsRow}>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, -1)}>
                        <Text style={styles.quantityText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityValue}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, 1)}>
                        <Text style={styles.quantityText}>＋</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 160 }}
          />

          {/* ✅ Barcode Scanner Button */}
          <TouchableOpacity style={styles.scanButton} onPress={handleScanBarcode}>
            <Text style={styles.scanButtonText}>Scan Barcode</Text>
          </TouchableOpacity>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
    paddingHorizontal: 16,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginVertical: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2f5',
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  quantityButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityText: {
    fontSize: 20,
    color: '#333',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 6,
  },
  removeText: {
    color: '#e53935',
    fontWeight: '600',
    fontSize: 14,
  },
  summaryCard: {
    bottom: 40,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    elevation: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  checkoutButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },
  continueButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    bottom:40
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
