import React, {createContext, useState, useEffect} from "react";
import { Platform } from "react-native";
import { apiRequest, saveToken, removeToken } from "../api/client";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [userToken, setUserToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsloading] = useState(true);

    const checkAuthStatus = async () => {
        try{
            if (Platform.OS === "web") {
                const tokenGuardado = window.localStorage.getItem("eventme_token");
                const userGuardado = window.localStorage.getItem("eventme_user");
                if (tokenGuardado) {
                    await saveToken(tokenGuardado);
                    setUserToken(tokenGuardado);
                    if (userGuardado) {
                        setUser(JSON.parse(userGuardado));
                    }
                }
            }
        }catch(e) {
            console.error('Error iniciando sesión:', e);
        }finally {
            setIsloading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const login = async (email, password) => {
        const data = await apiRequest('/auth/login', 'POST', {email, password});
        if (data.token) {
            await saveToken (data.token);
            if(Platform.OS === 'web'){
                window.localStorage.setItem('eventme_token', data.token);
                if(data.usuario) window.localStorage.setItem('eventme_user', JSON.stringify(data.usuario));
            }else{
                await AsyncStorage.setItem('eventme_token', data.token);
                if(data.usuario) await AsyncStorage.setItem('eventme_user', JSON.stringify(data.usuario));
            }
            setUserToken(data.token);
            setUser(data.usuario || null);
        }
        return data;
    };

    const register = async(nombreCompleto, email, password) => {
        const data = await apiRequest('/auth/register', 'POST', {
            nombre: nombreCompleto,
            email,
            password,
        });
        if(data.token){
            await saveToken(data.token);
            if (Platform.OS === "web") {
                window.localStorage.setItem("eventme_token", data.token);
                if (data.usuario) window.localStorage.setItem("eventme_user", JSON.stringify(data.usuario));
            } 
            setUserToken(data.token);
            setUser(data.usuario || null);
        }
        return data;
    };

    const logout = async () => {
        await removeToken();
        if (Platform.OS === "web") {
            window.localStorage.removeItem("eventme_token");
            window.localStorage.removeItem("eventme_user");
        }
        setUserToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{userToken, user, isLoading, login, register, logout}}>
            {children}
        </AuthContext.Provider>
    );
};