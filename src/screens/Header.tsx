import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import FastImage from 'react-native-fast-image'

const Header = ({navigation}:any) => {
    const handleBack = () => {
        navigation.goBack()
    }

    return (
        <View>
            <TouchableOpacity onPress={handleBack} style={styles.header}>
                <FastImage
                    source={require('../../assets/back.jpg')}
                    style={styles.iconImage}
                    resizeMode={FastImage.resizeMode.contain}
                />
            </TouchableOpacity>
        </View>
    )
}

export default Header

const styles = StyleSheet.create({
    iconImage: { width: 24, height: 24 },
    header:{marginTop:40, marginHorizontal:10}
})