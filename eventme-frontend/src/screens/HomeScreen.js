import React, { useContext, useState, useEffect, useMemo} from "react";
import {View, Text, FlatList, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator, RefreshControl, Alert} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons }from '@expo/vector-icons';
import { apiRequest } from "../api/client";
import { AuthContext } from "../context/AuthContext";
import { COLORS } from "../theme/colors";

const CATEGORIAS = ['Todos', 'Concierto', 'Festival', 'Teatro', 'Deporte', 'Otros'];
const DIAS_SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

//Convierte una fecha ISO o Date a formato "YYYY-MM-DD"
const aClaveFecha = (fechaInput) => {
    if (!fechaInput) return null
    const d = new Date(fechaInput);
    if(isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export default function HomeScreen({navigation}) {
    const { user, logout } = useContext(AuthContext);

    const [eventos, setEventos] = useState([]);
    const [favoritosIds, setFavoritosIds] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaActiva, setCategoriaActiva] = useState('Todos');
    const [cargando, setCargando] = useState(true);
    const [refrescando, setRefrescando] = useState(false);

    //Estados del calendario
    const [mostrarCalendario, setMostrarCalendario] = useState(false);
    const [mesActual, setMesActual] = useState(() => {
        const hoy = new Date();
        return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    });
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
 

    const [fotoLocal, setFotoLocal] = useState(null);

    //Cargar la foto guardada al abrir la app
    useEffect(() => {
        const cargarFotoGuardada = async () => {
            try{
                const uri = await AsyncStorage.getItem('eventme_foto_perfil');
                if(uri) setFotoLocal(uri);
            }catch(error){
                console.error('Error cargando la foto local:', error);
            }
        };
        cargarFotoGuardada();
    }, []);

    //Abrir galería del iphone y guardar la foto elegida
    const elegirFotoPerfil = async () => {
        const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if(!permiso.granted){
            Alert.alert('Permiso necesario', 'Activa el acceso a tus fotos para cambiar tu imagen de perfil');
            return;
        }
        const resultado = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if(!resultado.canceled && resultado.assets?.length > 0){
            const nuevaUri = resultado.assets[0].uri;
            setFotoLocal(nuevaUri);
            await AsyncStorage.setItem('eventme_foto_perfil', nuevaUri);
        }
}; 

    const cargarDatos = async() => {
        try{
            //Traemos todos los eventos y filtramos localmente para evitar desajustesde tildes/plurales
            const dataEventos = await apiRequest("/eventos", 'GET');
            setEventos(dataEventos.eventos || []);
            
        //Intentar cargar favoritos del usuario autenticado (si el endpoint está activo)
        try{
            const dataFav = await apiRequest('/favoritos', 'GET', null, true);
            const listaFav = dataFav.favoritos || dataFav || [];
            setFavoritosIds(listaFav.map((f) => f.evento_id || f.id));
        }catch{
            //Si aún no hay favoritos o no aplica, continúan sin bloquear la pantalla
        }
        }catch(error){
            console.error('Error al cargar eventos:', error.message);
        }finally{
            setCargando(false);
            setRefrescando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);
    
    const toggleFavorito = async(eventoId) => {
        const esFav = favoritosIds.includes(eventoId);
        try{
            await apiRequest('/favoritos/toggle', 'POST', {eventoId}, true);
            if (esFav) {
                setFavoritosIds((prev) => prev.filter((id) => id !== eventoId)); 
            }else{
                setFavoritosIds((prev) => [...prev, eventoId]);
            }
        }catch(error){
            console.error('Error al actualizar favorito:', error.message);
        }
    };

    const formatearFecha = (fechaISO) => {
        if(!fechaISO) return 'Fecha por confirmar';
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    //Conjunto de días que tienen al menos un evento (para pintar el puntito verde)
    const diasConEventos = useMemo(() => {
        const set = new Set();
        eventos.forEach((ev) => {
            const clave = aClaveFecha(ev.fecha_evento);
            if(clave) set.add(clave);
        });
        return set;
    }, [eventos]);

    //Celdas del mes visibles (empezando en lunes)
    const celdasMes = useMemo(() => {
        const year = mesActual.getFullYear();
        const month = mesActual.getMonth();
        const primerDia = new Date(year, month, 1).getDay();
        const desplazamiento = primerDia === 0 ? 6 : primerDia -1;
        const totalDias = new Date(year,month + 1, 0).getDate();

        const celdas = [];
        for (let i = 0; i < desplazamiento; i++) celdas.push(null);
        for(let d = 1; d <= totalDias; d++){
            celdas.push(new Date(year, month, d));
        }
        return celdas; 
    }, [mesActual]);
    
    const cambiarMes = (delta) => {
        setMesActual((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const eventosFiltrados = eventos.filter((ev) => {
        const texto = busqueda.toLowerCase();
        const coincideTexto = 
            ev.titulo?.toLowerCase().includes(texto) ||
            ev.ciudad?.toLowerCase().includes(texto) ||
            ev.recinto?.toLowerCase().includes(texto);

        const catEvento = (ev.categoria || "").toLowerCase();
        const catFiltro = categoriaActiva.toLowerCase();
        const coincideCategoria = categoriaActiva === "Todos" || catEvento === catFiltro || catEvento.startsWith(catFiltro);

        const coincideFecha = !fechaSeleccionada || aClaveFecha(ev.fecha_evento) === fechaSeleccionada;

        return coincideTexto && coincideCategoria && coincideFecha;
    });

    const renderEvento = ({ item }) => {
        const esFavorito = favoritosIds.includes(item.id);

        return(
            <TouchableOpacity
                style = {styles.card}
                activeOpacity={0.9}
                onPress={() => {
                    const nav = navigation.getParent() || navigation;
                    nav.navigate('EventDetail', { eventoId: item.id, evento: item })
                }}
            >
                <Image
                    source={{
                        uri:
                         item.imagen_url ||
                         'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
                    }}
                style={styles.cardImage}
                />

                <View style= {styles.badgeCategoria}>
                    <Text style={styles.badgeText}>{item.categoria}</Text>
                </View>

                <TouchableOpacity
                    style={styles.favButton}
                    onPress={() => toggleFavorito(item.id)}
                >
                    <Ionicons
                        name={esFavorito ? 'heart' : 'heart-outline'}
                        size={22}
                        color={esFavorito ? COLORS.danger : COLORS.textLight}
                    />
                </TouchableOpacity>

                <View style={styles.cardContent}>
                    <Text style={styles.fechaText}>{formatearFecha(item.fecha_evento)}</Text>
                    <Text style={styles.tituloText} numberOfLines={1}>{item.titulo}</Text>

                    <View style={styles.ubicacionRow}>
                        <Ionicons name="location-outline" size={15} color={COLORS.brandBlue}></Ionicons>
                        <Text style={styles.ubicacionText} numberOfLines={1}>{item.recinto} · {item.ciudad}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return(
        <SafeAreaView style={styles.container}>
            {/*Cabecera*/}
            <View style={styles.header}>
                <View>
                    <Text style={styles.saludo}>Hola, {user?.nombre || 'Explorador'} 👋</Text>
                    <Text style={styles.brandTitle}>Event<Text style= {{ color: COLORS.brandGreen }}>Me</Text>
                    </Text>
                </View>
                <View style={styles.profileBtn}>
                    <TouchableOpacity onPress={() => navigation.navigate("Ajustes")}>
                        <Text style={styles.profileText}>Mi Perfil</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={elegirFotoPerfil} activeOpacity={0.8}>
                        <Image
                            source={{
                                uri:
                                  fotoLocal ||
                                  user?.foto_perfil ||
                                  user?.avatar ||
                                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
                            }}
                            style={styles.avatarImage}/>
                    </TouchableOpacity>
                </View>
            </View>

            {/*Buscador + Botón de Calendario*/}
            <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color={COLORS.textSecondary}></Ionicons>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar evento, recinto o ciudad..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={busqueda}
                        onChangeText={setBusqueda}>
                    </TextInput>
                    {busqueda.length > 0 && (
                        <TouchableOpacity onPress={() => setBusqueda('')}>
                            <Ionicons name="close-circle" size={18} color={COLORS.textSecondary}></Ionicons>
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity 
                    style={[
                        styles.calendarToggleBtn, 
                        (mostrarCalendario || fechaSeleccionada) && styles.calendarToggleBtnActive,
                    ]} 
                    onPress={() => setMostrarCalendario(!mostrarCalendario)}>
                        <Ionicons name="calendar-outline" size={22} color={mostrarCalendario || fechaSeleccionada ? COLORS.textPrimary : COLORS.textLight}/>
                </TouchableOpacity>
            </View>

            {/*Calendario desplegable*/}
            {mostrarCalendario && (
                <View style={styles.calendarBox}>
                    <View style={styles.calendarHeader}>
                        <TouchableOpacity onPress={() => cambiarMes(-1)} style={styles.monthArrow}>
                            <Ionicons name="chevron-back" size={20} color={COLORS.brandBlue}/>
                        </TouchableOpacity>
                        <Text style={styles.monthTitle}>
                            {MESES[mesActual.getMonth()]} {mesActual.getFullYear()}
                        </Text>
                        <TouchableOpacity onPress={() => cambiarMes(1)} style={styles.monthArrow}>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.brandBlue}/>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekRow}>
                        {DIAS_SEMANA.map((d) => {
                            <Text key={d} style={styles.weekDayText}>{d}</Text>
                        })}
                    </View>

                    <View style={styles.daysGrid}>
                        {celdasMes.map((fechaObj, idx) => {
                            if(!fechaObj){
                                return <View key={`empty-${idx}`} style={styles.dayCell}/>;
                            }
                            const clave = aClaveFecha(fechaObj);
                            const tieneEvento = diasConEventos.has(clave);
                            const seleccionada = fechaSeleccionada === clave;

                            return (
                                <TouchableOpacity key={clave} style={styles.dayCell} onPress={() => setFechaSeleccionada((prev) => (prev === clave ? null : clave))}>
                                    <View style={[styles.dayCircle, seleccionada && styles.dayCircleSelected,]}>
                                        <Text style={[styles.dayNumber, seleccionada && styles.dayNumberSelected,]}>
                                            {fechaObj.getDate()}
                                        </Text>
                                    </View>
                                    {tieneEvento && <View style={styles.eventDot}/>}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {fechaSeleccionada && (
                        <TouchableOpacity style={styles.clearDateBtn} onPress={() => setFechaSeleccionada(null)}>
                            <Text style={styles.clearDateText}>Filtrando: {fechaSeleccionada} · Mostrar todos</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/*Filtros de categoria*/}
            <View style={styles.categoriaWrapper}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={CATEGORIAS}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => {
                        const activa = item === categoriaActiva;
                        return(
                            <TouchableOpacity style={[styles.chip, activa && styles.chipActiva]} onPress={() => setCategoriaActiva(item)}>
                                <Text style={[styles.chipText, activa && styles.chipTextActiva]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/*Lista de eventos*/}
            {cargando ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.brandBlue}></ActivityIndicator>
                </View>
            ) : (
                <FlatList
                    data={eventosFiltrados}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderEvento}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refrescando}
                            onRefresh={() => {
                                setRefrescando(true);
                                cargarDatos();
                            }}
                            tintColor={COLORS.brandGreen}>
                        </RefreshControl>
                    }
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Ionicons name="calendar-outline" size={48} color={COLORS.textSecondary}></Ionicons>
                            <Text style={styles.emptyText}>{fechaSeleccionada ? "No hay eventos para esta fecha" : "No hay eventos disponibles"}</Text>
                        </View>
                    }
                ></FlatList>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: COLORS.background, 
        paddingHorizontal: 16
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        marginBlock: 14,
    },
    saludo: {
        color: COLORS.textSecondary,
        fontSize: 13,
    },
    brandTitle: {
        color: COLORS.textLight,
        fontSize: 26,
        fontWeight: 'bold',
    },
    profileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: COLORS.cardDark,
        paddingVertical: 6,
        paddingLeft: 12,
        paddingRight: 6,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    profileText: {
        color: COLORS.textLight,
        fontSize: 13,
        fontWeight: '600',
    },
    avatarImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.brandBlue,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardDark,
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 46,
    },
    searchInput: {
        flex: 1,
        color: COLORS.textLight,
        marginLeft: 8,
        fontSize: 14,
    },
    calendarToggleBtn: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: COLORS.cardDark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarToggleBtnActive: {
        backgroundColor: COLORS.brandGreen,
    },
    calendarBox: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    monthArrow: { padding: 6 },
    monthTitle: {
        color: COLORS.textLight,
        fontSize: 15,
        fontWeight: 'bold',
    },
    weekRow: {flexDirection: 'row', marginBottom: 6,},
    weekDayText: {
        width: '14.28%',
        textAlign: 'center',
        color: COLORS.brandBlue,
        fontSize: 12,
        fontWeight: '700',
    },
    daysGrid: {flexDirection: 'row', flexWrap: 'wrap'},
    dayCell: { width: '14.28%', alignItems:'center', paddingVertical: 4},
    dayCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayCircleSelected: {backgroundColor: COLORS.brandBlue},
    dayNumber: {
        color: COLORS.textLight,
        fontWeight: 'bold',
    },
    dayNumberSelected: { color: COLORS.textPrimary, fontWeight: 'bold'},
    eventDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: COLORS.brandGreen,
        marginTop: 2,
    },
    clearDateBtn: {
        marginTop: 8,
        alignItems: 'center',
        paddingVertical: 6,
        borderTopWidth: 1,
        borderTopColor: '#27272a',
    },
    clearDateText: {
        color: COLORS.brandGreen,
        fontSize: 12,
        fontWeight: '600',
    },  
    categoriaWrapper: {
        marginBottom: 14,
    },
    chip: {
        backgroundColor: COLORS.cardDark,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    chipActiva: {
        backgroundColor: COLORS.brandBlue,
    },
    chipText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },
    chipTextActiva: {
        color: COLORS.textPrimary,
    },
    listContent: {
        paddingBottom: 24,
    },
    card: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 18,
        marginBottom: 16,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 155,
    },
    badgeCategoria: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(3, 3, 3, 0.75)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    badgeText: {
        color: COLORS.brandGreen,
        fontSize: 12,
        fontWeight: '700',
    },
    favButton: {
        position: 'absolute',
        top: 10,
        right: 12,
        backgroundColor: 'rgba(3, 3, 3, 0.65)',
        padding: 6,
        borderRadius: 20,
    },
    cardContent: {
        padding: 14,
    },
    fechaText: {
        color: COLORS.brandGreen,
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    tituloText: {
        color: COLORS.textLight,
        fontSize: 18,
        fontWeight: 'bold',
        marginBlock: 6,
    },
    ubicacionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ubicacionText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginLeft: 4,
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: COLORS.textSecondary,
        marginTop: 10,
        fontSize: 15,
    },
});