import React, { useState, useEffect, useContext } from 'react';
import{
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    ActivityIndicator,
    StyleSheet,
    Platform,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/colors';


export default function EventDetailScreen({ route, navigation }) {
    const { eventoId, evento: eventoInicial } = route.params;
    const { user } = useContext(AuthContext);

    const [evento, setEvento] = useState(eventoInicial || null);
    const [tickets, setTickets] = useState([]);
    const [cargando, setCargando] = useState(true);

    //Estados para el modal de publicar ticket FairTicket
    const [modalVisible, setModalVisible] = useState(false);
    const [precioOriginal, setPrecioOriginal] = useState('');
    const [precioReventa, setPrecioReventa] = useState('');
    const [asientoZona, setAsientoZona] = useState ('');
    const [descripcionTicket, setDescripcionTicket] = useState('');
    const [enviando, setEnviando] = useState(false);

    const mostrarAviso = (titulo, mensaje) => {
        if(Platform.OS === 'web'){
            window.alert(`${titulo}: ${mensaje}`);
        }else{
            Alert.alert(titulo, mensaje);
        }
    };

    const cargarDetalleYTickets = async() => {
        try{
            if(!eventoInicial) {
                const dataEv = await apiRequest(`/eventos/${eventoId}`, 'GET');
                setEvento(dataEv.evento);
            }
            const dataTickets = await apiRequest(`/tickets/evento/${eventoId}`, 'GET');
            setTickets(dataTickets.tickets || []);
        }catch(error){
            console.error('Error cargando detalle/tickets:', error.message);
        }finally{
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDetalleYTickets();
    }, [eventoId]);

    const handlePublicarTicket = async () => {
        if(!precioOriginal || !precioReventa){
            mostrarAviso('Campos requeridos', 'Indica el precio original y el precio de venta.');
            return;
        }

        //Validacion previa en cliente de la regla FairTicket
        if(parseFloat(precioReventa) > parseFloat(precioOriginal)) {
            mostrarAviso(
                'Política FairTicket',
                'El precio de reventa no puede superar el precio original de la entrada'
            );
            return;
        }

        setEnviando(true);
        try{
            await apiRequest(
                '/tickets',
                'POST',
                {
                    evento_id: eventoId,
                    precio_original: parseFloat(precioOriginal),
                    precio_reventa: parseFloat(precioReventa),
                    asiento_zona: asientoZona.trim() || 'Entrada General',
                    descripcion: descripcionTicket.trim() || null,
                },
                true
            );

            setModalVisible(false);
            setPrecioOriginal('');
            setPrecioReventa('');
            setAsientoZona('');
            setDescripcionTicket('');
            mostrarAviso('¡Publicado!', 'Tu entrada ya está disponible en FairTicket.');
            cargarDetalleYTickets();
        }catch(error){
            mostrarAviso('No se pudo publicar', error.message);
        }finally{
            setEnviando(false);
        }
    };

    const handleComprarTicket = async (ticket) => {
        if(user?.id && ticket.vendedor_id === user.id) {
            mostrarAviso('Aviso', 'No puedes comprar una entrada que tú mismo publicaste.');
            return;
        }
        const ejecutarCompra = async () => {
            try{
                const res = await apiRequest(`/tickets/${ticket.id}/comprar`, 'PATCH', null, true);
                mostrarAviso('¡Compra confirmada!', res.message || 'Entrada adquirida con éxito.');
                cargarDetalleYTickets();
            }catch(error){
                mostrarAviso('Error en la compra', error.message);
            }
        };
        if(Platform.OS === 'web'){
            const ok = window.confirm(
                `¿Confirmas la compra segura FairTicket por ${ticket.precio_reventa}€?`
            );
            if (ok) ejecutarCompra();
        }else{
            Alert.alert(
                'Compra Segura FairTicket',
                `¿Confirmas la compra de esta entrada por ${ticket.precio_reventa}€?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Comprar ahora', onPress: ejecutarCompra},
                ]
            );
        }
    };
    const formatearFecha = (fechaISO) => {
        if(!fechaISO) return 'Fecha por confirmar';
        return new Date(fechaISO).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if(!evento) {
        return(
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.brandBlue}></ActivityIndicator>
            </View>
        );
    }
    return(
        <SafeAreaView style= {styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/*Imagen de cabecera y botón volver*/}
                <View style={styles.imageWrapper}>
                    <Image source={{uri: evento.imagen_url || 
                    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',}}
                    style={styles.bannerImage}></Image>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.textLight}></Ionicons>
                    </TouchableOpacity>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{evento.categoria}</Text>
                    </View>
                </View>
                
                {/*Informacion principal del evento*/}
                <View style={styles.body}>
                    <Text style={styles.title}>{evento.titulo}</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={18} color={COLORS.brandGreen}></Ionicons>
                        <Text style={styles.infoText}>{formatearFecha(evento.fecha_evento)}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={18} color={COLORS.brandBlue}></Ionicons>
                        <Text style={styles.infoText}>{evento.recinto} · {evento.ciudad}</Text>
                    </View>

                    {evento.descripcion ? (
                        <Text style= {styles.description}>{evento.descripcion}</Text>
                    ): null}

                    {/*Boton de acceso directo al chat del evento*/}
                    <TouchableOpacity style={styles.chatButton} onPress={() =>
                        navigation.navigate('Chat', {
                            eventoId : evento.id,
                            eventoTitulo : evento.titulo,
                        })
                    }
                    >
                        <Ionicons name="chatbubbles-outline" size={20} color={COLORS.textPrimary}></Ionicons>
                        <Text style={styles.chatButtonText}>Entrar al chat en vivo del evento</Text>
                    </TouchableOpacity>

                    {/*Seccion FairTicket*/}
                    <View style={styles.fairHeader}>
                        <View>
                            <Text style={styles.fairTitle}>Entradas FairTicket</Text>
                            <Text style={styles.fairSubtitle}>Reventa ética sin sobreprecios</Text>
                        </View>
                        <TouchableOpacity style={styles.publishBtn} onPress={() => setModalVisible(true)}>
                            <Ionicons name="add" size={18} color={COLORS.textPrimary}></Ionicons>
                            <Text style= {styles.publishBtnText}>Vender</Text>
                        </TouchableOpacity>
                    </View>

                    {cargando ? (
                        <ActivityIndicator size="small" color={COLORS.brandGreen} style={{marginTop: 20 }}></ActivityIndicator>
                    ): tickets.length === 0 ? (
                        <View style= {styles.emptyTickets}>
                            <Ionicons name="ticket-outline" size={34} color={COLORS.textSecondary}></Ionicons>
                            <Text style={styles.emptyTicketsText}>
                                Aún no hay entradas publicadas para este evento.
                            </Text>
                        </View>
                    ): (
                        tickets.map((ticket) => {
                            const esMio = user?.id && ticket.vendedor_id === user.id;
                            return(
                                <View key={ticket.id} style={styles.ticketCard}>
                                    <View style= {{ flex: 1 }}>
                                        <Text style={styles.ticketZona}>
                                            {ticket.asiento_zona || 'Entrada General'}
                                        </Text>
                                        <Text style= {styles.ticketVendedor}>
                                            Vendedor: {ticket.vendedor_nombre}
                                        </Text>
                                        {ticket.descripcion ? (
                                            <Text style={styles.ticketDesc}>{ticket.descripcion}</Text>
                                        ) : null}
                                        <View style={styles.priceRow}>
                                            <Text style={styles.ticketPrice}>{ticket.precio_reventa} €</Text>
                                            <Text style={styles.originalPrice}>Original: {ticket.precio_original} €</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={[styles.buyBtn, esMio && styles.buyBtnDisabled]} disabled={esMio} onPress={() => handleComprarTicket(ticket)}>
                                        <Text style= {styles.buyBtnText}>{esMio ? 'Tu entrada' : 'Comprar'}</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/*Modal para publicar entrada */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Publicar en FairTicket</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.textLight}></Ionicons>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalHint}>Garantía FairTicket: el precio de reventa no puede superar el precio original.</Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Precio original (€) ej.45"
                            placeholderTextColor={COLORS.textSecondary}
                            keyboardType="numeric"
                            value={precioOriginal}
                            onChangeText={setPrecioOriginal}/>

                        <TextInput
                            style={styles.input}
                            placeholder="Tu precio de venta (€) ej.40"
                            placeholderTextColor={COLORS.textSecondary}
                            keyboardType="numeric"
                            value={precioReventa}
                            onChangeText={setPrecioReventa}/>
                        
                         <TextInput
                            style={styles.input}
                            placeholder="Zona o asiento (ej. Pista, Grada Norte)"
                            placeholderTextColor={COLORS.textSecondary}
                            value={asientoZona}
                            onChangeText={setAsientoZona}/>

                         <TextInput
                            style={styles.input}
                            placeholder="Nota opcional (ej. Transferencia oficial)"
                            placeholderTextColor={COLORS.textSecondary}
                            value={descripcionTicket}
                            onChangeText={setDescripcionTicket}/>

                        <TouchableOpacity style={styles.submitBtn} onPress={handlePublicarTicket} disabled={enviando}>
                            {enviando ? (
                                <ActivityIndicator color={COLORS.textPrimary}></ActivityIndicator>
                            ) : (
                                <Text style={styles.submitBtnText}>Publicar Entrada</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    imageWrapper: { position: 'relative'},
    bannerImage: {width: '100%', height: 220},
    backBtn: {
        position: 'absolute',
        top: 14,
        left: 14,
        backgroundColor: 'rgba(3, 3, 3, 0.7)',
        padding: 9,
        borderRadius: 20,
    },
    categoryBadge: {
        position: 'absolute',
        bottom: 12,
        left: 16,
        backgroundColor: 'rgba(3, 3, 3, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 10,
    },
    categoryText: { color: COLORS.brandGreen, fontWeight: '700', fontSize: 12 },
    body: { padding: 16},
    title: { color: COLORS.textLight, fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    infoText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginLeft: 8,
        textTransform: 'capitalize',
    },
    description: {
        color: COLORS.textLight,
        fontSize: 14,
        lineHeight: 20,
        marginTop: 8,
        marginBottom: 16,
        opacity: 0.85,
    },
    chatButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.brandBlue,
        paddingVertical: 14,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    chatButtonText: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 8,
    },
    fairHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    fairTitle: { color: COLORS.textLight, fontSize: 19, fontWeight: 'bold' },
    fairSubtitle: { color: COLORS.brandGreen, fontSize: 12 },
    publishBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.brandGreen,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    publishBtnText: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 4,
    },
    emptyTickets: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    emptyTicketsText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        fontSize: 14,
    },
    ticketCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardDark,
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
    },
    ticketZona: { color: COLORS.textLight, fontSize: 16, fontWeight: 'bold' },
    ticketVendedor: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
    ticketDesc: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8 },
    ticketPrice: {
        color: COLORS.brandGreen,
        fontSize: 18,
        fontWeight: 'bold',
        margin: 10,
    },
    originalPrice: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textDecorationLine: 'line-through',
    },
    buyBtn: {
        backgroundColor: COLORS.brandBlue,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginLeft: 10,
    },
    buyBtnDisabled: {backgroundColor: '#334155' },
    buyBtnText: { color: COLORS.textPrimary, fontWeight: 'bold', fontSize: 13 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: { color: COLORS.textLight, fontSize: 18, fontWeight: 'bold' },
    modalHint: { color: COLORS.brandGreen, fontSize: 12, marginBottom: 14 },
    input: {
        backgroundColor: COLORS.background,
        color: COLORS.textLight,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 46,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    submitBtn: {
        backgroundColor: COLORS.brandGreen,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
    },
    submitBtnText: { color: COLORS.textPrimary, fontWeight: 'bold', fontSize: 15 }
});