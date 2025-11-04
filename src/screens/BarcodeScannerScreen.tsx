import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

export default function BarcodeScannerScreen({ navigation }: any) {
  const device = useCameraDevice('back');
  const [hasPermission, setHasPermission] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  // ✅ Request Camera Permission
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // ✅ Barcode Scanner Handler
  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'upc-a', 'qr', 'code-128'],
    onCodeScanned: codes => {
      if (codes.length > 0 && !scannedCode) {
        const codeValue = codes[0].value;
        setScannedCode(codeValue);
        handleBarcodeDetected(codeValue);
      }
    },
  });

  // ✅ Fetch Product API by Barcode
  const handleBarcodeDetected = async (barcode: string) => {
    try {
      setLoading(true);
      console.log('🔍 Scanned Barcode:', barcode);

      const response = await axios.post(
        'https://catalog-management-system-dev-ak3ogf6zea-uc.a.run.app/cms/product/v2/filter/product',
        {
          page: '1',
          pageSize: '1',
          searchText: barcode,
        },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'x-internal-call': 'true',
          },
        }
      );

      const data = response.data?.data?.data?.[0];
      if (data) {
        navigation.navigate('ProductDetails', { product: data });
      } else {
        Alert.alert('Not Found', 'No product found for this barcode.');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch product details.');
    } finally {
      setLoading(false);
      setTimeout(() => setScannedCode(null), 2000);
    }
  };

  // ✅ Manual Entry
  const handleManualSearch = () => {
    if (!manualCode.trim()) {
      Alert.alert('Enter a barcode');
      return;
    }
    handleBarcodeDetected(manualCode.trim());
  };

  if (device == null) {
    return (
      <View style={styles.center}>
        <Text>No camera device found</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>Camera permission not granted</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
        torch={isFlashOn ? 'on' : 'off'}
      />

      {/* 🔦 Flash + Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsFlashOn(!isFlashOn)}>
          <Icon name={isFlashOn ? 'flash' : 'flash-off'} size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 🔍 Manual Entry UI */}
      <View style={styles.bottomContainer}>
        <Text style={styles.infoText}>Align barcode within the frame to scan</Text>

        <View style={styles.manualRow}>
          <TextInput
            placeholder="Enter barcode manually"
            placeholderTextColor="#999"
            value={manualCode}
            onChangeText={setManualCode}
            style={styles.manualInput}
          />
          <TouchableOpacity onPress={handleManualSearch} style={styles.searchButton}>
            <Text style={styles.searchText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Fetching product...</Text>
        </View>
      )}
    </View>
  );
}

// 💅 Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  infoText: {
    color: '#fff',
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  manualRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
  },
  manualInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  searchButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
});
