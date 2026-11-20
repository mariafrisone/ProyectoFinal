import 'react-native-screens';
import React, {useContext} from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import {COLORS} from "./src/theme/colors";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import FavoriteScreens from "./src/screens/FavoriteScreens";
import MyTicketsScreen from './src/screens/MyTicketsScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import ChatScreen from './src/screens/ChatScreen';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs(){
  return(
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.cardDark,
          borderTopColor: '#27272a',
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.brandGreen,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'calendar-outline';
          if(route.name === 'Eventos'){
            iconName = focused ? 'calendar' : 'calendar-outline';
          }else if (route.name === 'Favoritos') {
            iconName = focused ? 'heart' : 'heart-outline';
          }else if(route.name === 'Mis Entradas') {
            iconName = focused ? 'ticket' : 'ticket-outline';
          }
          return <Ionicons name={iconName} size={size} color={color}/>;
        },
      })}
      >
        <Tab.Screen name='Eventos' component={HomeScreen}/>
        <Tab.Screen name='Favoritos' component={FavoriteScreens}/>
        <Tab.Screen name='Mis Entradas' component={MyTicketsScreen}/>
      </Tab.Navigator>
  );
}

function AppRoutes() {
  const {userToken, isLoading} = useContext(AuthContext);

  if (isLoading) {
    return(
      <View style= {{ flex:1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background}}>
        <ActivityIndicator size='large' color= {COLORS.brandBlue}/>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false}}>
      {userToken ? (
        <>
        <Stack.Screen name ="MainTabs" component={MainTabs}/>
        <Stack.Screen name="EventDetail" component={EventDetailScreen}/>
        <Stack.Screen name="Chat" component={ChatScreen}/>
        </>
      ) : (
        <>
        <Stack.Screen name='Login' component={LoginScreen}/>
        <Stack.Screen name= 'Register' component={RegisterScreen}/>
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App(){
  return(
    <View style={{ flex: 1, width: '100%', backgroundColor: COLORS.background}}>
      <AuthProvider>
        <NavigationContainer>
          <AppRoutes/>
        </NavigationContainer>
      </AuthProvider>
    </View>
  );
}