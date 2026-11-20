import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/client';
import { COLORS } from '../theme/colors';

export default function FavoritesScreen({ navigation }) {
  const [favoritos, setFavoritos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarFavoritos = async () => {
    try {
      const dataFav = await apiRequest('/favoritos', 'GET', null, true);
      const listaFav = dataFav.favoritos || dataFav || [];

      // Si /favoritos ya devuelve los datos del evento los usamos directo; si solo trae IDs, cruzamos con /eventos
      if (listaFav.length > 0 && listaFav[0].titulo) {
        setFavoritos(listaFav);
      } else {
        const ids = listaFav.map((f) => f.evento_id || f.id);
        const dataEventos = await apiRequest('/eventos', 'GET');
        const todos = dataEventos.eventos || [];
        setFavoritos(todos.filter((ev) => ids.includes(ev.id)));
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error.message);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setCargando(true);
      cargarFavoritos();
    }, [])
  );

  const quitarFavorito = async (eventoId) => {
    try {
      await apiRequest('/favoritos/toggle', 'POST', {eventoId}, true);
      setFavoritos((prev) => prev.filter((item) => item.id !== eventoId));
    } catch (error) {
      console.error('Error al quitar favorito:', error.message);
    }
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'Fecha por confirmar';
    return new Date(fechaISO).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderFavorito = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate('EventDetail', { eventoId: item.id, evento: item })
      }
    >
      <Image
        source={{
          uri:
            item.imagen_url ||
            'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
        }}
        style={styles.thumb}
      />

      <View style={styles.info}>
        <Text style={styles.categoria}>{item.categoria}</Text>
        <Text style={styles.titulo} numberOfLines={1}>
          {item.titulo}
        </Text>
        <Text style={styles.subtitulo} numberOfLines={1}>
          {formatearFecha(item.fecha_evento)} · {item.ciudad}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.heartBtn}
        onPress={() => quitarFavorito(item.id)}
      >
        <Ionicons name="heart" size={22} color={COLORS.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Mis Favoritos</Text>
      <Text style={styles.headerSubtitle}>
        Eventos guardados para seguir sus entradas y chat
      </Text>

      {cargando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.brandBlue} />
        </View>
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderFavorito}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name="heart-dislike-outline"
                size={48}
                color={COLORS.textSecondary}
              />
              <Text style={styles.emptyText}>
                Todavía no tienes eventos guardados en favoritos
              </Text>
            </View>
          }
        />
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
  headerTitle: {
    color: COLORS.textLight,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
  },
  thumb: {
    width: 68,
    height: 68,
    borderRadius: 12,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  categoria: {
    color: COLORS.brandGreen,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  titulo: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitulo: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  heartBtn: {
    padding: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: COLORS.textSecondary,
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});