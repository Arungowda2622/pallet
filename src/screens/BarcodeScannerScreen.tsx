import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Alert, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Button, 
  ActivityIndicator 
} from 'react-native';
import { 
  Camera, 
  useCameraDevice, 
  useCameraPermission, 
  useCodeScanner 
} from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const BarcodeScannerScreen = () => {
  const navigation = useNavigation();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [manualEntryVisible, setManualEntryVisible] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Multi-format scanner
  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'upc-a', 'qr', 'code-128'],
    onCodeScanned: async (codes) => {
      if (isScanning && codes.length > 0) {
        const codeValue = codes[0].value;
        setScannedCode(codeValue);
        setIsScanning(false);
        await handleScannedCode(codeValue);
      }
    },
  });

  // Fetch product by barcode via API
  const fetchProductByBarcode = async (barcode: string) => {
    try {
      setLoading(true);
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

      const productData = response.data?.data?.data?.[0];
      if (productData) {
        const product = {
          id: productData.id,
          name: productData.name,
          price: productData.price || 'N/A',
          description: productData.shortDescription || productData.description || '',
          image:
            productData.imageUrls?.[0] ||
            productData.variants?.[0]?.images?.[0] ||
            'https://via.placeholder.com/150',
          barcode:
            productData.variants?.[0]?.barcodes?.[0] ||
            productData.barcodes?.[0] ||
            barcode,
        };
        return product;
      }
      return null;
    } catch (err) {
      console.error('Error fetching product by barcode:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleScannedCode = useCallback(async (code: string) => {
    try {
      const product = await fetchProductByBarcode(code);

      if (product) {
        navigation.navigate('ProductDetails', { product });
      } else {
        Alert.alert('Product Not Found', 'No product matches this barcode.', [
          { text: 'OK', onPress: () => setIsScanning(true) },
        ]);
      }
    } catch {
      Alert.alert('Error', 'Failed to fetch product details. Please try again.', [
        { text: 'OK', onPress: () => setIsScanning(true) },
      ]);
    }
  }, [navigation]);

  const handleManualSubmit = async () => {
    if (!manualBarcode.trim()) {
      Alert.alert('Error', 'Please enter a barcode.');
      return;
    }
    setManualEntryVisible(false);
    await handleScannedCode(manualBarcode.trim());
    setManualBarcode('');
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>No camera access. Please grant permission in settings.</Text>
        <Button title="Request Permission" onPress={requestPermission} />
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text>No camera device found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isScanning}
        codeScanner={codeScanner}
        torch={torchOn ? 'on' : 'off'}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.viewfinder} />
        <Text style={styles.scanText}>
          {isScanning ? 'Point camera at a barcode/QR code' : `Scanned: ${scannedCode}`}
        </Text>
      </View>

      {/* Flash + Manual Entry */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => setTorchOn(t => !t)}>
          <Text style={styles.buttonText}>{torchOn ? 'Flash OFF' : 'Flash ON'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={() => setManualEntryVisible(true)}>
          <Text style={styles.buttonText}>Manual Entry</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* Manual Entry Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={manualEntryVisible}
        onRequestClose={() => setManualEntryVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Manual Barcode Entry</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter barcode or QR value"
              onChangeText={setManualBarcode}
              value={manualBarcode}
              keyboardType="default"
            />
            <View style={styles.modalButtons}>
              <Button title="Submit" onPress={handleManualSubmit} />
              <Button title="Cancel" color="red" onPress={() => setManualEntryVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BarcodeScannerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
  },
  scanText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 5,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  controlButton: {
    backgroundColor: 'rgba(0,122,255,0.8)',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '100%',
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
