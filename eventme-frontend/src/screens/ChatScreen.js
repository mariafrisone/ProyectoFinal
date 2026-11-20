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
}from 'react-native';
import { SafeAreaView  } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { io } from "socket.io-client";
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

const SOCKET_URL = 'http://localhost:3000';

export default function ChatScreen ({ route, navigation }) {
    const { eventoId, eventoTitulo } = route.params;
    const { user } = useContext(AuthContext);

    const [ mensajes, setMensajes ] = useState([]);
    const [ texto, setTexto ] = useState('');
    const [ conectado, setConectado ] = useState(false);

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
            setMensajes((prev) => [...prev, mensaje]);
        });
        return() => {
            socket.disconnect();
        };
    }), [eventoId];

    const enviarMensaje = () => {
        if (!texto.trim() || !socketRef.current) return; 
        
        socketRef.current.emit('send_message', {
            eventoId,
            usuarioId: user?.id || socketRef.current.id,
            usuarioNombre: user?.nombre || 'Asistente',
            texto: texto.trim(),
        });

        setTexto('');
    };

    const renderMensaje = ({ item }) => {
        const esMio =
        (user?.id && item.usuarioId === user.id) ||
        item.usuarioId === socketRef.current?.id;

        return(
            <View style={[styles.bubbleWrapper, esMio ? styles.bubbleRight: styles.bubbleLeft,]}>
                {!esMio && (
                    <Text style={styles.senderName}>{item.usuarioNombre}</Text>
                )}
                <View style={[styles.bubble, esMio ? styles.miBubble : styles.otherBubble,]}>
                    <Text style={styles.messageText}>{item.texto}</Text>
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
                        <Text style={styles.emptuText}>Sé la primera persona en saludar en este evento</Text>
                    </View>
                }
            />

            {/*Barra de envío*/}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.inputBar}>
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