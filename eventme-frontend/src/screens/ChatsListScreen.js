import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { apiRequest } from '../api/client';
import { COLORS } from '../theme/colors';


export default function ChatsListScreen ({ navigation }){
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarSalas();
    }, []);

    const cargarSalas = async () => {
        try {
            const data = await apiRequest('/eventos', 'GET', null, true);
            setEventos(Array.isArray(data) ? data : data.eventos || []);            
        } catch (error) {
            console.error('Error cargando salas de chat', error);            
        }finally{
            setLoading(false);
        }
    };

    return(
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Salas de Chat</Text>
            <Text style={styles.subtitle}>Conecta en tiempo real con otros asistentes</Text>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.brandBlue} style= {{marginTop: 40}}/>
            ) : (
               <FlatList data={eventos} keyExtractor={(item) => String(item.id)} contentContainerStyle={{ paddingTop: 14, paddingBottom: 20 }}
               renderItem={({item}) => (
                <TouchableOpacity style={styles.chatCard} onPress={() => navigation.navigate('Chat', {evento: item})}>
                    <View style={styles.iconBox}>
                        <Ionicons name="chatbubbles" size={22} color={COLORS.brandBlue}/>
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.eventTitle}>{item.titulo}</Text>
                        <Text style={styles.eventSub}>{item.recinto} · {item.ciudad}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary}/>
                </TouchableOpacity>
               )}
               ListEmptyComponent={
                <Text style={styles.emptyText}>No hay salas de chat disponibles</Text>
               }
               />     
            )}
        </SafeAreaView>
    );
}
const styles= StyleSheet.create({
    container: {flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16},
    title: {color: COLORS.textLight, fontSize: 22, fontWeight: 'bold', marginTop: 10},
    subtitle: {color: COLORS.textSecondary, fontSize: 13, marginTop: 4},
    chatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardDark,
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
        gap: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventTitle: {color: COLORS.textLight, fontSize: 15, fontWeight: 'bold'},
    eventSub: {color: COLORS.textSecondary, fontSize: 12, marginTop: 2},
    emptyText: {color: COLORS.textSecondary, textAlign: 'center', marginTop: 40},
});