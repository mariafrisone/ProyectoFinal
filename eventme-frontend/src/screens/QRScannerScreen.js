import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/client';
import { COLORS } from '../theme/colors';

export default function QRScannerScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [escaneado, setEscaneado] = useState(false);
    const [validando, setValidando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [codigoManual, setCodigoManual] = useState('');
    
    const validarCodigo = async (codigo) => {
        const limpio = codigo?.trim();
        if (!limpio || validando) return;

        setEscaneado(true);
        setValidando(true);
        setResultado(null);
        
        try{
            const data = await apiRequest(
                '/tickets/validar-qr',
                'POST',
                { codigo_qr: limpio },
                true
            );

            setResultado({
                ok: true,
                titulo: 'Acceso permitido',
                mensaje: data.message || 'Entrada válida.',
                ticket: data.ticket,
            });
        }catch(error){
            setResultado({
                ok: false,
                titulo: 'Acceso denegado',
                mensaje: error.message || 'Código QR no válido o ya utilizado.',
            });
        }finally{
            setValidando(false);
        }    
    };

    const handleBarCodeScanned = ({ data }) => {
        if (escaneado || validando) return;
        validarCodigo(data);
    };

    const reiniciarEscaneo = () => {
        setEscaneado(false);
        setResultado(null);
        setCodigoManual('');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/*Cabecera*/}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.textLight}/>
                </TouchableOpacity>
                <View style={{ marginLeft: 12 }}>
                    <Text style={styles.headerTitle}>Validar Entradas QR</Text>
                    <Text style={styles.headerSubtitle}>Control de acceso FairTicket</Text>
                </View>
            </View>

            {/*Zona de cámara (en móvil)*/}
            {Platform.OS !== 'web' ? (
                <View style={styles.cameraWrapper}>
                    {!permission ? ( 
                    <ActivityIndicator size="large" color={COLORS.brandBlue}/>
                    ) : !permission.granted ? (
                        <View style={styles.permissionBox}>
                            <Ionicons name="camera-outline" size={48} color={COLORS.textSecondary}/>
                            <Text style={styles.permissionText}>
                                Necesitamos permiso para usar la cámara y escanear los códigos QR.
                            </Text>
                            <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
                                <Text style={styles.primaryBtnText}>Permitir cámara</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <CameraView style={styles.camera} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr']}}
                        onBarcodeScanned={escaneado ? undefined: handleBarCodeScanned}>
                            <View style={styles.scanFrame}/>
                        </CameraView>
                    )}
                </View>
            ) : (
                <View style={styles.webNotice}>
                    <Ionicons name='qr-code-outline' size={36} color={COLORS.brandBlue}/>
                    <Text style={styles.webNoticeText}>
                        Modo prueba en PC: pega el código QR abajo para validar la entrada.
                        En el móvil con Expo Go se activa la cámara automáticamente.
                    </Text>
                </View>
            )}

            {/*Validación manual (útil en PC y como respaldo en puerta)*/}
            <View style={styles.manualBox}>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: EVT-3-CMP-1-A8F2C1"
                    placeholderTextColor={COLORS.textSecondary}
                    value={codigoManual}
                    onChangeText={setCodigoManual}
                    autoCapitalize="characters"/>
                <TouchableOpacity style={styles.validateBtn} onPress={() => validarCodigo(codigoManual)} disabled={validando}>
                    <Text style={styles.validateBtnText}>Validar</Text>
                </TouchableOpacity>
            </View>

            {/*Resultado de la validación*/}
            {validando && (
                <View style={styles.resultCard}>
                    <ActivityIndicator size='large' color={COLORS.brandBlue}/>
                    <Text style={styles.resultMsg}>Comprobando entrada...</Text>
                </View>
            )}

            {resultado && !validando && (
                <View style={[styles.resultCard, {borderColor: resultado.ok ? COLORS.brandGreen : COLORS.danger,},]}>
                    <Ionicons name={resultado.ok ? 'checkmark-circle' : 'close-circle'} size={48} color={resultado.ok ? COLORS.brandGreen : COLORS.danger}/>
                    <Text style={[styles.resultTitle, {color: resultado.ok ? COLORS.brandGreen : COLORS.danger},]}>{resultado.titulo}</Text>
                    <Text style={styles.resultMsg}>{resultado.mensaje}</Text>

                    {resultado.ticket && (
                        <View style={styles.ticketInfo}>
                            <Text style={styles.ticketInfoText}>Evento: {resultado.ticket.evento_nombre}</Text>
                            <Text style={styles.ticketInfoText}>Asistente: {resultado.ticket.comprador_nombre || 'Confirmado'}</Text>
                            <Text style={styles.ticketInfoText}>Zona: {resultado.ticket.asiento_zona || 'Entrada General'}</Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.primaryBtn} onPress={reiniciarEscaneo}>
                        <Text style={styles.primaryBtnText}>Escanear otra entrada</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    backBtn: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: COLORS.cardDark,
    },
    headerTitle: {
        color: COLORS.textLight,
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    cameraWrapper: {
        height: 280,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: COLORS.cardDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    camera: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 190,
        height: 190,
        borderWidth: 3,
        borderColor: COLORS.brandGreen,
        borderRadius: 16,
        backgroundColor: 'transparent',
    },
    permissionBox: {
        padding: 20,
        alignItems: 'center',
    },
    permissionText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginVertical: 12,
        fontSize: 13,
    },
    webNotice: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
    },
    webNoticeText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        textAlign: 'center',
        marginTop: 8,
    },
    manualBox: {
        flexDirection: 'row',
        marginTop: 14,
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.cardDark,
        color: COLORS.textLight,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 46,
        fontSize: 13,
    },
    validateBtn: {
        backgroundColor: COLORS.brandBlue,
        borderRadius: 12,
        paddingHorizontal: 18,
        justifyContent: 'center',
    },
    validateBtnText: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        fontSize: 13,
    },
    resultCard: {
        marginTop: 18,
        backgroundColor: COLORS.cardDark,
        borderRadius: 18,
        padding: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#27272a',
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
    },
    resultMsg: {
        color: COLORS.textLight,
        fontSize: 13,
        textAlign: 'center',
        marginTop: 6,
    },
    ticketInfo: {
        width: '100%',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
        gap: 4,
    },
    ticketInfoText: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    primaryBtn: {
        marginTop: 14,
        backgroundColor: COLORS.brandGreen,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    primaryBtnText: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        fontSize: 13,
    },
});