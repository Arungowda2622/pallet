import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import Header from './Header';

const CartScreen = ({ route, navigation }: any) => {
    const { cart = [] } = route.params || {};

    const handleRemoveItem = (productId: any) => {
        console.log('Remove item with id:', productId);
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.cartItem}>
            <FastImage
                source={require("../../assets/placeholderImage.png")}
                style={styles.cartImage}
                resizeMode={FastImage.resizeMode.cover}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.cartName}>{item.name}</Text>
                <Text style={styles.cartBrand}>{item.brandName || 'Unknown Brand'}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveItem(item.productId)}>
                <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Header navigation={navigation} />
            {cart.length === 0 ? (
                <Text style={styles.emptyText}>Your cart is empty.</Text>
            ) : (
                <FlatList
                    data={cart}
                    keyExtractor={(item, index) => item.productId + index}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 10 }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',

    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    cartImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    cartName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    cartBrand: {
        color: '#777',
    },
    removeText: {
        color: 'red',
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        fontSize: 18,
        color: '#777',
    },
});

export default CartScreen;
