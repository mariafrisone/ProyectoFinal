import React, { useContext, useState, useEffect} from "react";
import {View, Text, FlatList, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator, RefreshControl} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons }from '@expo/vector-icons';
import { apiRequest } from "../api/client";
import { AuthContext } from "../context/AuthContext";
import { COLORS } from "../theme/colors";

const CATEGORIAS = ['Todos', 'Concierto', 'Festival', 'Teatro', 'Deporte'];

export default function HomeScreen({navigation}) {
    const { user, logout } = useContext(AuthContext);

    const [eventos, setEventos] = useState([]);
    const [favoritosIds, setFavoritosIds] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaActiva, setCategoriaActiva] = useState('Todos');
    const [cargando, setCargando] = useState(true);
    const [refrescando, setRefrescando] = useState(false);

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
            if (esFav) {
                await apiRequest('/favoritos/toggle', 'POST', {eventoId}, true);
                setFavoritosIds((prev) => prev.filter((id) => id !== eventoId)); 
            }else{
                await apiRequest('/favoritos/toggle', 'POST', { eventoId }, true);
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

    const eventosFiltrados = eventos.filter((ev) => {
        const texto = busqueda.toLowerCase();
        const coincideTexto = 
            ev.titulo?.toLowerCase().includes(texto) ||
            ev.ciudad?.toLowerCase().includes(texto) ||
            ev.recinto?.toLowerCase().includes(texto);

        const catEvento = (ev.categoria || "").toLowerCase();
        const catFiltro = categoriaActiva.toLowerCase();
        const coincideCategoria = categoriaActiva === "Todos" || catEvento === catFiltro || catEvento.startsWith(catFiltro);

        return coincideTexto && coincideCategoria;
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
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Ionicons name="log-out-outline" size={22} color={COLORS.textLight}></Ionicons>
                </TouchableOpacity>
            </View>

            {/*Buscador*/}
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
                            <Text style={styles.emptyText}>No hay eventos disponibles</Text>
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
    logoutBtn: {
        backgroundColor: COLORS.cardDark,
        padding: 10,
        borderRadius: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardDark,
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 46,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        color: COLORS.textLight,
        marginLeft: 8,
        fontSize: 14,
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
        padding: 0,
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