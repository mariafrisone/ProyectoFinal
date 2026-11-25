import React, {useState, useEffect, useContext, useRef } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Linking,
    Alert,
    ActivityIndicator,
}from 'react-native';
import { SafeAreaView  } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { io } from "socket.io-client";
import * as Location from 'expo-location';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/colors';


const SOCKET_URL = 'http://192.168.1.199:3000';

export default function ChatScreen ({ route, navigation }) {
    const { eventoId, eventoTitulo } = route.params;
    const { user } = useContext(AuthContext);

    const [ mensajes, setMensajes ] = useState([]);
    const [ texto, setTexto ] = useState('');
    const [ conectado, setConectado ] = useState(false);
    const [ enviandoUbicacion, setEnviandoUbicacion ] = useState(false);

    const socketRef = useRef(null);
    const flatListRef = useRef(null);

    useEffect(() => {
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            setConectado(true);
            socket.emit('join_room', {
                eventoId,
                usuario: user?.nombre || 'Asistente',
            });
        });
        socket.on('disconnect', () => {
            setConectado(false);
        });
        socket.on('room_history', (historial) => {
            setMensajes(historial || []);
        });
        socket.on('receive_message', (mensaje) => {
            console.log('📥 Recibido de vuelta en frontend:', mensaje);
            setMensajes((prev) => [...prev, mensaje]);
        });
        return() => {
            socket.disconnect();
        };
    }, [eventoId]);

    const enviarMensaje = () => {
      console.log('📤 Pulsado enviar:', {texto, eventoId, tieneSocket: !!socketRef.current});
        if (!texto.trim() || !socketRef.current) return; 
        
        socketRef.current.emit('send_message', {
            eventoId,
            usuarioId: user?.id || socketRef.current.id,
            usuarioNombre: user?.nombre || 'Asistente',
            texto: texto.trim(),
        });

        setTexto('');
    };

    const enviarUbicacion = async () => {
      if(!socketRef.current || enviandoUbicacion) return;

      try{
        setEnviandoUbicacion(true);
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert(
            'Permiso necesario',
            'Necesitamos acceso a tu ubicación para compartir el punto de encuentro.'
          );
          return;
        }
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        socketRef.current.emit('send_message', {
          eventoId,
          usuarioId: user?.id || socketRef.current.id,
          usuarioNombre: user?.nombre || 'Asistente',
          texto: '📍 Ubicación de encuentro compartida',
          latitud: location.coords.latitude,
          longitud: location.coords.longitude,
        });
      }catch(error){
        Alert.alert('Error', 'No se pudo obtener tu ubicación actual.');
      }finally{
        setEnviandoUbicacion(false);
      }
    };

    const abrirEnMapa = (latitud, longitud) => {
      const url = `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`;
      Linking.openURL(url);
    };
    
    const renderMensaje = ({ item }) => {
        const esMio =
        (user?.id && item.usuarioId === user.id) ||
        item.usuarioId === socketRef.current?.id;

        const tieneUbicacion = item.latitud != null && item.longitud != null;

        return(
            <View style={[styles.bubbleWrapper, esMio ? styles.bubbleRight: styles.bubbleLeft,]}>
                {!esMio && (
                    <Text style={styles.senderName}>{item.usuarioNombre}</Text>
                )}
                <View style={[styles.bubble, esMio ? styles.myBubble : styles.otherBubble]}>
                  { tieneUbicacion ? (
                    <TouchableOpacity style={styles.locationCard} onPress={() => abrirEnMapa(item.latitud, item.longitud)}>
                      <Ionicons name="location" size={20} color={COLORS.brandGreen}/>
                      <View style= {{marginLeft: 8}}>
                        <Text style={styles.locationTitle}>Punto de encuentro</Text>
                        <Text style={styles.locationCoords}>
                          {Number(item.latitud).toFixed(4)}, {Number(item.longitud).toFixed(4)}
                        </Text>
                        <Text style = {styles.locationLink}>Toca para abrir en mapa →</Text> 
                      </View>
                    </TouchableOpacity>
                  ) : (
                      <Text style={styles.messageText}>{item.texto}</Text>
                  )}
                  <Text style={styles.timeText}>{item.hora}</Text>
                </View>
            </View>
        );
    };
    return(
        <SafeAreaView style={styles.container}>
            {/*Cabecera*/}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => {
                  if(navigation.canGoBack()){
                   navigation.goBack(); 
                  }else{
                    navigation.navigate('MainTabs');
                  }
                }}
                >
                    <Ionicons name="arrow-back" size={22} color={COLORS.textLight}></Ionicons>
                </TouchableOpacity>

                <View style={{flex:1, marginLeft: 10}}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {eventoTitulo || 'Chat del Evento'}
                    </Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, {backgroundColor: conectado ? COLORS.brandGreen : COLORS.danger},]}></View>
                        <Text style={styles.statusText}>{conectado ? 'En vivo' : 'Conectando...'}</Text>
                    </View>
                </View>
            </View>

            {/*Lista de mensajes*/}
            <FlatList
                ref={flatListRef}
                data={mensajes}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderMensaje}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                }
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Ionicons name="chatbubbles-outline" size={44} color={COLORS.textSecondary}></Ionicons>
                        <Text style={styles.emptyText}>Sé la primera persona en saludar en este evento</Text>
                    </View>
                }
            />

            {/*Barra de envío*/}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.inputBar}>
                  <TouchableOpacity style={styles.locationBtn} onPress={enviarUbicacion} disabled={enviandoUbicacion}>
                    {enviandoUbicacion ? (
                      <ActivityIndicator size="small" color={COLORS.brandGreen} />
                    ) : (
                      <Ionicons name="location-outline" size={22} color={COLORS.brandGreen}/>
                    )}
                  </TouchableOpacity>

                    <TextInput
                    style={styles.input}
                    placeholder="Escribe un mensaje..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={texto}
                    onChangeText={setTexto}
                    onSubmitEditing={enviarMensaje}/>

                    <TouchableOpacity style={styles.sendBtn} onPress={enviarMensaje}>
                        <Ionicons name="send" size={20} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>        
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.cardDark,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  backBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  messagesList: {
    padding: 14,
    flexGrow: 1,
  },
  bubbleWrapper: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  bubbleRight: {
    alignSelf: 'flex-end',
  },
  bubbleLeft: {
    alignSelf: 'flex-start',
  },
  senderName: {
    color: COLORS.brandGreen,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
    marginLeft: 4,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: COLORS.brandBlue,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: COLORS.cardDark,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: COLORS.textLight,
    fontSize: 14,
    lineHeight: 19,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  locationTitle:{
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: 'bold',
  },
  locationCoords: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    marginTop: 2,
  },
  locationLink: {
    color: COLORS.brandGreen,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  timeText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: COLORS.textSecondary,
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.cardDark,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  locationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    color: COLORS.textLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 44,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: COLORS.brandGreen,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});