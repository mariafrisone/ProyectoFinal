import React, { useContext, useState } from "react";
import{
    View,
    Text,
    Switch,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/colors';


const INTERESES = ['Concierto', 'Festival', 'Teatro', 'Cine', 'Deporte', 'Otros'];
const GENEROS = ['Femenino', 'Masculino', 'No binario', 'Prefiero no decirlo'];

export default function SettingsScreen() {
    const {logout} = useContext(AuthContext);
    
    //Información Personal
    const [interesesAbierto, setInteresesAbierto] = useState(false);
    const [interesesSeleccionados, setInteresesSeleccionados] = useState([]);
    const [generoAbierto, setgeneroAbierto] = useState(false);
    const [generoSeleccionado, setGeneroSeleccionado] = useState('');

    //Notificaciones y Seguridad
    const [novedades, setNovedades] = useState(true);
    const [notifPush, setNotifPush] = useState(true);
    const [permitirUbicacion, setPermitirUbicacion] = useState(true);
    const [verificacionSeguridad, setVerificacionSeguridad] = useState(true);

    const toggleInteres = (item) => {
        setInteresesSeleccionados((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]);
    };

    const seleccionarGenero = (item) => {
        setGeneroSeleccionado(item);
        setgeneroAbierto(false);
    };

    const guardarAjustes= () => {
        Alert.alert('Ajustes guardados', 'Tus preferencias de EventMe se han actualizado.');
    };
    return(
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 30}}>
                <Text style={styles.title}>Configuración</Text>
                <View style={styles.topDivider}/>

                {/*Informacion personal*/}
                <Text style={styles.sectionTitle}>Información Personal</Text>

                {/*Desplegable intereses*/}
                <TouchableOpacity style={styles.dropdownBox} onPress={() => setInteresesAbierto(!interesesAbierto)}>
                    <Text style={styles.dropdownText} numberOfLines={1}>
                        {interesesSeleccionados.length > 0
                        ? `Intereses: ${interesesSeleccionados.join(', ')}`
                        : 'Intereses'}
                    </Text>
                    <Ionicons name={interesesAbierto ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.brandBlue}/> 
                </TouchableOpacity>

                {interesesAbierto && (
                    <View style={styles.dropdownContent}>
                        <View style={styles.chipsRow}>
                            {INTERESES.map((item) => {
                                const active= interesesSeleccionados.includes(item);
                                return(
                                    <TouchableOpacity key={item} style={[styles.chip, active && styles.chipActive]} onPress={() => toggleInteres(item)}>
                                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
    
                )}

                {/*Desplegable Género (Selección única)*/}
                <TouchableOpacity style={[styles.dropdownBox, {marginTop: 12}]} onPress={() => setgeneroAbierto(!generoAbierto)}>
                    <Text style={styles.dropdownText}>
                        {generoSeleccionado ? `Género: ${generoSeleccionado}` : 'Género'}
                    </Text>
                    <Ionicons name={generoAbierto ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.brandBlue}/>
                </TouchableOpacity>

                {generoAbierto && (
                    <View style={styles.dropdownContent}>
                        {GENEROS.map((item) => {
                            const active = generoSeleccionado === item;
                            return(
                                <TouchableOpacity key={item} style={styles.optionRow} onPress={() => seleccionarGenero(item)}>
                                    <Text style={[styles.optionText, active && {color: COLORS.brandGreen, fontWeight: 'bold'}]}>
                                        {item}
                                    </Text>
                                    {active && <Ionicons name="checkmark" size={18} color={COLORS.brandGreen}/>}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                <View style={styles.divider}/>

                {/*Notificaciones*/}
                <Text style={styles.sectionTitle}>Notificaciones</Text>
                <View style={styles.switchRow}>
                    <Text style={styles.rowLabel}>Novedades</Text>
                    <Switch
                        value={novedades}
                        onValueChange={setNovedades}
                        trackColor={{ false: '#3f3f46', true: COLORS.brandGreen}}
                        thumbColor='#ffffff'/>
                </View>

                <View style={styles.switchRow}>
                    <Text style={styles.rowLabel}>Notificaciones Push</Text>
                    <Switch
                        value={notifPush}
                        onValueChange={setNotifPush}
                        trackColor={{ false: '#3f3f46', true: COLORS.brandGreen }}
                        thumbColor="#ffffff"/>
                </View>

                <View style={styles.switchRow}>
                    <Text style={styles.rowLabel}>Permitir ubicación en chat</Text>
                    <Switch
                        value={permitirUbicacion}
                        onValueChange={setPermitirUbicacion}
                        trackColor={{ false: '#3f3f46', true: COLORS.brandGreen}}
                        thumbColor='#ffffff'/>
                </View>

                <View style={styles.divider}/>

                {/*Seguridad*/}
                <Text style={styles.sectionTitle}>Seguridad</Text>
                <View style={styles.switchRow}>
                    <Text style={[styles.rowLabel, {flex: 1, paddingRight: 10}]}>
                        Realizar verificación de seguridad al iniciar sesión
                    </Text>
                    <Switch
                        value={verificacionSeguridad}
                        onValueChange={setVerificacionSeguridad}
                        trackColor={{false: '#3f3f46', true: COLORS.brandBlue}}
                        thumbColor='#ffffff'/>
                </View>

                {/*Botones*/}
                <TouchableOpacity style={styles.saveBtn} onPress={guardarAjustes}>
                    <Text style={styles.saveBtnText}>Guardar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Ionicons name="log-out-outline" size={18} color={COLORS.danger}/>
                    <Text style={styles.logoutText}>Cerrar sesión</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create ({
    container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16},
    title: { color: COLORS.textLight, fontSize: 22, fontWeight: 'bold', marginTop: 10, marginBottom: 16},
    topDivider: { height: 1, backgroundColor: '#27272a', marginVertical: 14},
    sectionTitle: { color: COLORS.textLight, fontSize: 15, fontWeight: 'bold', marginBottom: 10},
    dropdownBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.brandBlue,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 13,
        backgroundColor: COLORS.cardDark,
    },
    dropdownText: { color: COLORS.brandBlue, fontSize: 14, flex: 1, marginRight: 8},
    dropdownContent: {
        marginTop: 8,
        padding: 12,
        borderRadius: 10,
        backgroundColor: COLORS.cardDark,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8},
    chip: {
        paddingVertical: 7,
        paddingHorizontal: 13,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: '#3f3f46',
    },
    chipActive: { backgroundColor: COLORS.brandBlue, borderColor: COLORS.brandBlue },
    chipText: { color: COLORS.textSecondary, fontSize: 13 },
    chipTextActive: { color: COLORS.textPrimary, fontWeight: 'bold' },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#27272a',
    },
    optionText: { color: COLORS.textLight, fontSize: 14 },
    divider: { height: 1, backgroundColor: '#27272a', marginVertical: 18 },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    rowLabel: { color: COLORS.textLight, fontSize: 14},
    saveBtn: {
        marginTop: 22,
        borderWidth: 1,
        backgroundColor: COLORS.cardDark,
        borderColor: COLORS.brandBlue,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveBtnText: { color: COLORS.brandBlue, fontWeight: 'bold', fontSize: 14},
    logoutBtn: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.danger,
    },
    logoutText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 14},
});