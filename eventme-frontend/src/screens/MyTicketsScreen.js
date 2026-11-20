import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/client';
import { COLORS } from '../theme/colors';

export default function MyTicketsScreen() {
  const [tabActiva, setTabActiva] = useState('compras');
  const [compras, setCompras] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarTickets = async () => {
    try {
      const [resCompras, resPubs] = await Promise.all([
        apiRequest('/tickets/mis-compras', 'GET', null, true),
        apiRequest('/tickets/mis-publicaciones', 'GET', null, true),
      ]);
      setCompras(resCompras.compras || []);
      setPublicaciones(resPubs.tickets || []);
    } catch (error) {
      console.error('Error al cargar mis entradas:', error.message);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setCargando(true);
      cargarTickets();
    }, [])
  );

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '';
    return new Date(fechaISO).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderCompra = ({ item }) => (
    <View style={styles.ticketCard}>
      <View style={styles.ticketTop}>
        <Text style={styles.eventoNombre}>{item.evento_nombre}</Text>
        <View style={styles.badgeComprada}>
          <Text style={styles.badgeCompradaText}>ADQUIRIDA</Text>
        </View>
      </View>

      <Text style={styles.metaText}>
        {formatearFecha(item.fecha_evento)} · {item.evento_lugar}
      </Text>
      <Text style={styles.zonaText}>
        Zona: {item.asiento_zona || 'Entrada General'}
      </Text>

      <View style={styles.ticketFooter}>
        <Text style={styles.vendedorText}>Vendedor: {item.vendedor_nombre}</Text>
        <Text style={styles.precioText}>{item.precio_pagado} €</Text>
      </View>
    </View>
  );

  const renderPublicacion = ({ item }) => {
    const vendida = item.estado === 'vendido';
    return (
      <View style={styles.ticketCard}>
        <View style={styles.ticketTop}>
          <Text style={styles.eventoNombre}>
            {item.evento_titulo || item.evento_nombre}
          </Text>
          <View
            style={[
              styles.badgeEstado,
              vendida ? styles.badgeVendida : styles.badgeDisponible,
            ]}
          >
            <Text style={styles.badgeEstadoText}>
              {vendida ? 'VENDIDA' : 'EN VENTA'}
            </Text>
          </View>
        </View>

        <Text style={styles.metaText}>
          {formatearFecha(item.fecha_evento)} · {item.recinto || item.evento_lugar}
        </Text>
        <Text style={styles.zonaText}>
          Zona: {item.asiento_zona || 'Entrada General'}
        </Text>

        <View style={styles.ticketFooter}>
          <Text style={styles.vendedorText}>
            Original: {item.precio_original} €
          </Text>
          <Text style={styles.precioText}>{item.precio_reventa} €</Text>
        </View>
      </View>
    );
  };

  const datosMostrados = tabActiva === 'compras' ? compras : publicaciones;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Mis Entradas</Text>
      <Text style={styles.headerSubtitle}>
        Historial de compras y publicaciones FairTicket
      </Text>

      {/* Selector Compradas / En venta */}
      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[
            styles.switchBtn,
            tabActiva === 'compras' && styles.switchBtnActive,
          ]}
          onPress={() => setTabActiva('compras')}
        >
          <Text
            style={[
              styles.switchText,
              tabActiva === 'compras' && styles.switchTextActive,
            ]}
          >
            Compradas ({compras.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.switchBtn,
            tabActiva === 'publicaciones' && styles.switchBtnActive,
          ]}
          onPress={() => setTabActiva('publicaciones')}
        >
          <Text
            style={[
              styles.switchText,
              tabActiva === 'publicaciones' && styles.switchTextActive,
            ]}
          >
            Mis Ventas ({publicaciones.length})
          </Text>
        </TouchableOpacity>
      </View>

      {cargando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.brandBlue} />
        </View>
      ) : (
        <FlatList
          data={datosMostrados}
          keyExtractor={(item) => String(item.id)}
          renderItem={
            tabActiva === 'compras' ? renderCompra : renderPublicacion
          }
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name="ticket-outline"
                size={48}
                color={COLORS.textSecondary}
              />
              <Text style={styles.emptyText}>
                {tabActiva === 'compras'
                  ? 'Aún no has comprado ninguna entrada FairTicket'
                  : 'No has publicado entradas a la venta todavía'}
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
    marginBottom: 14,
  },
  switchRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  switchBtnActive: {
    backgroundColor: COLORS.brandBlue,
  },
  switchText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  switchTextActive: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  ticketCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.brandGreen,
  },
  ticketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventoNombre: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  badgeComprada: {
    backgroundColor: 'rgba(131, 214, 151, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeCompradaText: {
    color: COLORS.brandGreen,
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeEstado: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeDisponible: {
    backgroundColor: 'rgba(134, 189, 240, 0.2)',
  },
  badgeVendida: {
    backgroundColor: 'rgba(131, 214, 151, 0.2)',
  },
  badgeEstadoText: {
    color: COLORS.textLight,
    fontSize: 10,
    fontWeight: 'bold',
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  zonaText: {
    color: COLORS.textLight,
    fontSize: 13,
    marginBottom: 10,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingTop: 8,
  },
  vendedorText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  precioText: {
    color: COLORS.brandGreen,
    fontSize: 17,
    fontWeight: 'bold',
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