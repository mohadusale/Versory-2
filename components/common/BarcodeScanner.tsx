import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { 
    ActivityIndicator, 
    Alert, 
    Dimensions, 
    Modal, 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    View 
} from 'react-native';

interface BarcodeScannerProps {
    visible: boolean;
    onClose: () => void;
    onBarcodeScanned: (isbn: string) => void;
}

const { width, height } = Dimensions.get('window');
const scanAreaWidth = width * 0.8;
const scanAreaHeight = width * 0.5;

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
    visible,
    onClose,
    onBarcodeScanned,
}) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [isScanning, setIsScanning] = useState(true);
    const hasScanned = React.useRef(false);

    React.useEffect(() => {
        if (visible) {
            setIsScanning(true);
            hasScanned.current = false;
        }
    }, [visible]);

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        // Si ya hemos escaneado algo o no está escaneando, ignorar completamente
        if (!isScanning || hasScanned.current) {
            return;
        }
        
        // INMEDIATAMENTE marcar como escaneado para evitar duplicados
        hasScanned.current = true;
        setIsScanning(false);
        
        // Validar que sea un ISBN válido (10 o 13 dígitos)
        const cleanedData = data.replace(/[-\s]/g, '');
        
        if (cleanedData.length === 10 || cleanedData.length === 13) {
            onBarcodeScanned(cleanedData);
        } else {
            Alert.alert(
                'Código no válido',
                `El código escaneado no parece ser un ISBN válido. Los ISBN deben tener 10 o 13 dígitos.`,
                [
                    {
                        text: 'Reintentar',
                        onPress: () => {
                            setIsScanning(true);
                            hasScanned.current = false;
                        },
                    },
                    {
                        text: 'Cerrar',
                        onPress: onClose,
                    },
                ]
            );
        }
    };

    const handleRequestPermission = async () => {
        const result = await requestPermission();
        if (!result.granted) {
            Alert.alert(
                'Permisos de cámara',
                'Necesitamos acceso a la cámara para escanear códigos de barras.',
                [{ text: 'OK', onPress: onClose }]
            );
        }
    };

    if (!permission) {
        return (
            <Modal visible={visible} animationType="slide">
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#E0AFA0" />
                    <Text style={styles.loadingText}>Cargando cámara...</Text>
                </View>
            </Modal>
        );
    }

    if (!permission.granted) {
        return (
            <Modal visible={visible} animationType="slide">
                <View style={styles.permissionContainer}>
                    <Ionicons name="camera-outline" size={80} color="#8A817C" />
                    <Text style={styles.permissionTitle}>Acceso a la cámara</Text>
                    <Text style={styles.permissionText}>
                        Necesitamos acceso a tu cámara para escanear códigos de barras de libros
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={handleRequestPermission}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.permissionButtonText}>Permitir acceso</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Escanear código de barras</Text>
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={() => {
                            setIsScanning(true);
                            hasScanned.current = false;
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="refresh" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Camera */}
                <View style={styles.cameraContainer}>
                    <CameraView
                        style={styles.camera}
                        facing="back"
                        onBarcodeScanned={handleBarCodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ['ean13', 'ean8', 'code128', 'code39'],
                        }}
                    >
                        {/* Overlay */}
                        <View style={styles.overlay}>
                            {/* Top overlay */}
                            <View style={styles.overlayTop} />
                            
                            {/* Middle section with scan area */}
                            <View style={styles.overlayMiddle}>
                                <View style={styles.overlaySide} />
                                <View style={styles.scanArea}>
                                    {/* Corner indicators */}
                                    <View style={[styles.corner, styles.topLeft]} />
                                    <View style={[styles.corner, styles.topRight]} />
                                    <View style={[styles.corner, styles.bottomLeft]} />
                                    <View style={[styles.corner, styles.bottomRight]} />
                                    
                                    {/* Scanning indicator */}
                                    {isScanning && !hasScanned.current && (
                                        <View style={styles.scanningIndicator}>
                                            <Text style={styles.scanningText}>ESCANEANDO...</Text>
                                        </View>
                                    )}
                                    
                                    {hasScanned.current && (
                                        <View style={styles.scanningIndicator}>
                                            <Text style={[styles.scanningText, { color: '#4C956C' }]}>PROCESANDO...</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.overlaySide} />
                            </View>
                            
                            {/* Bottom overlay */}
                            <View style={styles.overlayBottom} />
                        </View>

                        {        /* Instructions */}
        <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
                Coloca el código de barras dentro del recuadro
            </Text>
            <Text style={styles.instructionsSubtext}>
                {hasScanned.current 
                    ? 'Procesando código escaneado...' 
                    : isScanning 
                        ? 'Buscando código de barras...' 
                        : 'El escaneo se realizará automáticamente'
                }
            </Text>
        </View>
                    </CameraView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    closeButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat_600SemiBold',
        color: 'white',
        textAlign: 'center',
    },
    refreshButton: {
        padding: 8,
    },
    cameraContainer: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    overlayTop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    overlayMiddle: {
        flexDirection: 'row',
        height: scanAreaHeight,
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    scanArea: {
        width: scanAreaWidth,
        height: scanAreaHeight,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#E0AFA0',
        borderWidth: 3,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    instructionsContainer: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    instructionsText: {
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 8,
    },
    instructionsSubtext: {
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F4F1',
    },
    loadingText: {
        fontSize: 16,
        fontFamily: 'Montserrat_500Medium',
        color: '#463F3A',
        marginTop: 16,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F4F1',
        paddingHorizontal: 40,
    },
    permissionTitle: {
        fontSize: 24,
        fontFamily: 'Lora_700Bold',
        color: '#463F3A',
        marginTop: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
    permissionText: {
        fontSize: 16,
        fontFamily: 'Montserrat_400Regular',
        color: '#8A817C',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    permissionButton: {
        backgroundColor: '#E0AFA0',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginBottom: 16,
        minWidth: 200,
    },
    permissionButtonText: {
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
        color: 'white',
        textAlign: 'center',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#8A817C',
        minWidth: 200,
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#8A817C',
        textAlign: 'center',
    },
    scanningIndicator: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    scanningText: {
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#E0AFA0',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
});

export default BarcodeScanner;
