import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import FastImage from 'react-native-fast-image'

const Header = ({navigation, title}:any) => {
    const handleBack = () => {
        navigation.goBack()
    }

    return (
        <View style={styles.main}>
            <TouchableOpacity onPress={handleBack} style={styles.header}>
                <FastImage
                    source={require('../../assets/back.jpg')}
                    style={styles.iconImage}
                    resizeMode={FastImage.resizeMode.contain}
                />
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
        </View>
    )
}

export default Header

const styles = StyleSheet.create({
    main:{flexDirection:"row", alignItems:"center", marginVertical:20},
    iconImage: { width: 24, height: 24 },
    header:{marginRight:20},
    title:{fontWeight:"600", fontSize:18}
})