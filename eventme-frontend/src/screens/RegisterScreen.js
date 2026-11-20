import React, {useState, useContext} from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, ScrollView, useWindowDimensions } from "react-native";
import {Ionicons} from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { COLORS } from "../theme/colors";

export default function RegisterScreen({navigation}) {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repitePassword, setRepitePassword] = useState('');
    const [aceptaPoliticas, setAceptaPoliticas] = useState(true);
    const [aceptaNotificaciones, setAceptaNotificaciones] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const { width } = useWindowDimensions();
    const { register } = useContext(AuthContext);

    const cardWidth = Math.min(width -32, 380);

    const mostrarAviso = (titulo, mensaje) => {
        if(Platform.OS === 'web'){
            window.alert(titulo + "\n" + mensaje);
        }else{
            Alert.alert(titulo, mensaje);
        }
    };

    const handleRegister =async () => {
        if(!nombre.trim() || !apellido.trim() || !email.trim() || !password.trim() || !repitePassword.trim()){
            mostrarAviso('Atención', 'Por favor, completa todos los campos obligatorios (*).');
            return;
        }
        if(password !== repitePassword){
            mostrarAviso('Contraseña', 'Las contraseñas no coinciden.');
            return;
        }
        if(!aceptaPoliticas){
            mostrarAviso('Políticas', 'Debes aceptar las Políticas de Privacidad parta registrarte.');
            return;
        }
        try{
            setSubmitting(true);
            const nombreCompleto = nombre.trim() + ' ' + apellido.trim();
            const respuesta = await register(nombreCompleto, email.trim(), password.trim());
            //Si el backend no devuelve token en el register, volvemos al login con aviso
            if(!respuesta || !respuesta.token){
                mostrarAviso('¡Cuenta creada!', 'Tu registro se completó. Ahora inicia sesión.');
                navigation.navigate('Login');
            }
        }catch(error){
            mostrarAviso('Error al registrarse', error.message || 'No se pudo completar el registro.');
        }finally{
            setSubmitting(false);
        }
    };

    const formularioListo = 
        nombre.trim().length > 0 && 
        apellido.trim().length > 0 &&
        email.trim().length > 0 && 
        password.trim().length > 0 && 
        repitePassword.trim().length > 0;

    return(
        <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.screen}>
            {/*LOGO BICOLOR*/}
            <View style={styles.logoContainer}>
                <Text style={styles.logoEvent}>Event</Text>
                <Text style={styles.logoMe}>Me</Text>
            </View>

            {/*TARJETA BLANCA CENTRAL*/}
            <View style={[styles.card, {width: cardWidth}]}>
                <Text style={styles.title}>Registrate   </Text>
                <Text style={styles.subtitle}>Completa tus datos y se parte de nuestra comunidad</Text>

                {/*FILA NOMBRE Y APELLIDO*/}
                <View style={styles.rowInputs}>
                    <TextInput
                        style={[styles.input, styles.halfInput]}
                        placeholder= "Nombre *"
                        placeholderTextColor= {COLORS.resgisterPlaceholder}
                        value= {nombre}
                        onChangeText={setNombre}
                    />
                    <TextInput
                        style={[styles.input, styles.halfInput]}
                        placeholder= "Apellido *"
                        placeholderTextColor= {COLORS.resgisterPlaceholder}
                        value={apellido}
                        onChangeText={setApellido}
                    />
                </View>

                <TextInput
                    style={styles.input}
                    placeholder= "Correo electrónico *"
                    placeholderTextColor={COLORS.resgisterPlaceholder}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType= "email-address"
                    autoCapitalize= "none"
                />

                <TextInput
                    style={styles.input}
                    placeholder= "Password *"
                    placeholderTextColor= {COLORS.resgisterPlaceholder}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TextInput
                    style={styles.input}
                    placeholder= "Repite password*"
                    placeholderTextColor={COLORS.resgisterPlaceholder}
                    value={repitePassword}
                    onChangeText={setRepitePassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.button, formularioListo && styles.buttonActive]}
                    onPress={handleRegister}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color= {COLORS.textLight}></ActivityIndicator>
                    ) : (
                        <Text style={[styles.buttonText, formularioListo && styles.buttonTextActive]}>
                            Registrarse
                        </Text>
                    )}
                </TouchableOpacity>

                <View style={styles.loginRow}>
                    <Text style={styles.hasAccountText}>¿Ya tienes una cuenta? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginLinkText}>Inicia sesión</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/*CHECKBOXES INFERIORES SOBRE FONDO NEGRO*/}
            <View style={[styles.checksContainer, {width: cardWidth}]}>
                <TouchableOpacity
                    style={styles.checkRow}
                    onPress={() => setAceptaPoliticas(!aceptaPoliticas)}
                >
                    <Text style={styles.checkLabel}>
                        Acepto las Políticas de Privacidad y el Tratamiento de mis Datos
                    </Text>
                    <View style={styles.checkboxBox}>
                        {aceptaPoliticas && <Ionicons name="checkmark" size={16} color={COLORS.textPrimary}/>}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.checkRow}
                    onPress={() => setAceptaNotificaciones(!aceptaNotificaciones)}
                >
                    <Text style={styles.checkLabel}>
                        Deseo recibir notificaciones y promociones de eventos
                    </Text>
                    <View style={styles.checkboxBox}>
                        {aceptaNotificaciones && <Ionicons name= "checkmark" size={16} color={COLORS.textPrimary}/>}
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        flexGrow: 1,
        flexDirection: "column",
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 24,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        marginTop: 6,
    },
    logoEvent: {
        fontSize: 50,
        fontWeight: '700',
        color: COLORS.brandBlue,
    },
    logoMe: {
        fontSize: 50,
        fontWeight: '700',
        color: COLORS.brandGreen,
    },
    card: {
        backgroundColor: COLORS.cardWhite,
        borderRadius: 28,
        paddingHorizontal: 22,
        paddingVertical: 24,
        alignSelf: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 18,
    },
    rowInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        width: '100%',
    },
    halfInput: {
        flex: 1,
        minWidth: 0,
    },
    input: {
        backgroundColor: COLORS.inputBgLight,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    button: {
        backgroundColor: COLORS.pillSoft,
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 6,
        marginBottom: 14,
    },
    buttonActive: {
        backgroundColor: COLORS.brandGreen,
    },
    buttonText: {
        color: COLORS.pillText,
        fontSize: 15,
        fontWeight: '600',
    },
    buttonTextActive: {
        color: COLORS.textLight,
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hasAccountText: {
        fontSize: 13,
        color: COLORS.textMuted,
    },
    loginLinkText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    checksContainer: {
        marginTop: 18,
        gap: 12,
    },
    checkRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    checkLabel: {
        flex: 1,
        fontSize: 12,
        color: '#d1d5db',
    },
    checkboxBox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        backgroundColor: COLORS.cardWhite,
        justifyContent: 'center',
        alignItems: 'center',
    },
});