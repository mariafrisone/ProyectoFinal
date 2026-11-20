import React, {useState, useContext} from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, ScrollView, useWindowDimensions } from "react-native";
import {Ionicons} from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import {COLORS} from "../theme/colors";

export default function LoginScreen({navigation}){
    const[email, setEmail] = useState('');
    const[password, setPassword] = useState('');
    const[submitting, setSubmitting] = useState(false);

    const {login} =useContext(AuthContext);
    const {width} =useWindowDimensions();

    const cardWhite = Math.min(width-32, 380);

    const mostrarAviso = (titulo, mensaje) => {
        if(Platform.OS === 'web'){
            window.alert(titulo + "\n" + mensaje);
        }else{
            Alert.alert(titulo, mensaje);
        }
    };

    const handleLogin = async () => {
        if(!email.trim() || !password.trim()){
            mostrarAviso('Atención', 'Por favor, completa todos los campos.');
            return;
        }

        try{
            setSubmitting(true);
            await login(email.trim(), password.trim());
        }catch(error){
            mostrarAviso('Error de acceso', error.message || 'Credenciales inválidas');
        }finally{
            setSubmitting(false);
        }
    };

    const formularioListo = email.trim().length > 0 && password.trim().length > 0;

    return(
        <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.screen}>
            {/*LOGO BICOLOR*/}
            <View style={styles.logoContainer}>
                <Text style={styles.logoEvent}>Event</Text>
                <Text style={styles.logoMe}>Me</Text>
            </View>

            {/*TARJETA BLANCA CENTRAL*/}
            <View style={[styles.card, {width: cardWhite}]}>
                <Text style={styles.title}>Bienvenido/a</Text>
                <Text style={styles.subtitle}>Inicia sesión para acceder a tu cuenta</Text>

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="nombre@empresa.com"
                    placeholderTextColor={COLORS.loginPlaceholder}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    />
                
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu contraseña"
                    placeholderTextColor={COLORS.loginPlaceholder}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    />
                
                <TouchableOpacity
                    style={[styles.button, formularioListo && styles.buttonActive]}
                    onPress={handleLogin}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color={COLORS.textPrimary} />
                    ) : (
                        <Text style={[styles.buttonText, formularioListo && styles.buttonTextActive]}>
                            Iniciar sesión
                        </Text>
                    )}
                </TouchableOpacity>

                <View style={styles.registerRow}>
                    <Text style= {styles.noAccountText}>¿No tienes una cuenta? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.createAccountText}>Crear cuenta</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.divider}/>

                <View style={styles.trustRow}>
                    <View style={styles.trustItem}>
                        <Ionicons name="lock-closed" size={16} color={COLORS.brandGreen}></Ionicons>
                        <Text style={styles.trustText}>Secure & encripted</Text>
                    </View>
                    <View style={styles.trustItem}>
                        <Ionicons name="headset-outline" size={16} color={COLORS.textSecondary}></Ionicons>
                        <Text style={styles.trustText}>24/7 support</Text>
                    </View>
                </View>
            </View>

            {/*FOOTER LEGAL*/}
            <View style={styles.footer}>
                <Text style={styles.legalText}>
                    Continuando aceptas las Políticas de Privacidad y Tratamiento de Datos
                </Text>
                <Text style={styles.versionText}>App version 1.4.2</Text>
            </View>
    </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen:{
        flex:1,
        backgroundColor: COLORS.background,
    },
    scrollContainer:{
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 28,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 24,
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
        paddingHorizontal: 24,
        paddingVertical: 28,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginBottom: 22,
        
    },
    label: {
        color: COLORS.textPrimary,
        fontSize: 13,
        marginBottom: 6,
        fontWeight: '600',
    },
    input: {
        backgroundColor: COLORS.cardWhite,
        color: COLORS.textPrimary,
        borderRadius: 999,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        fontSize: 14,
        marginBottom: 16,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 22,
    },
    forgotText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    button: {
        backgroundColor: COLORS.pillSoft,
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 18,
    },
    buttonActive: {
        backgroundColor: COLORS.brandBlue,
    },
    buttonText: {
        color: COLORS.pillText,
        fontSize: 15,
        fontWeight: '600',
    },
    buttonTextActive: {
        color: COLORS.textLight,
    },
    registerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
    },
    noAccountText: {
        fontSize: 13,
        color: COLORS.textMuted,
    },
    createAccountText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.inputBorder,
        marginBottom: 16,
    },
    trustRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    trustItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trustText: {
        fontSize: 12,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    footer: {
        alignItems: 'center',
        marginTop: 24,
        maxWidth: 380,
    },
    legalText: {
        fontSize: 11,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: 8,
    },
    versionText: {
        fontSize: 13,
        color: COLORS.textMuted,
    },
});