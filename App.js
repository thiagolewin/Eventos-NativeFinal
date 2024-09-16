// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { UserProvider, useUser } from './UserContext.js'; // Ajusta la ruta si es necesario
import { StyleSheet, View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ScreenA1({ eventos }) {
  const navigation = useNavigation();
  return (
    <View style={styles.homeScreen}>
      <Text style={styles.text}>ListadoEventos</Text>
      <Text style={styles.description}>Todos los eventos pasados y nuevos</Text>
      {eventos && eventos.length > 0 ? (
        eventos.map((element, index) => (
          <Button
            title={element.name}
            key={index}
            onPress={() => navigation.navigate('Evento', { item: element })}
          />
        ))
      ) : (
        <Text>No hay eventos disponibles.</Text>
      )}
    </View>
  );
}

function ScreenA2({ route }) {
  const [participantes, setParticipantes] = useState([]);
  const [changePart, setChangePart] = useState(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const { item } = route.params;
  const {user} = useUser()
  const fechaActual = new Date();
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetch(
          'https://b31a-200-73-176-50.ngrok-free.app/api/event/enrollments/' + item.id
        );
        const data = await response.json();
        console.log(data)
        setParticipantes(data);
        }finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [item.id,changePart]);
  const Desuscribirse = async(id)=> {
    try {
      const response = await fetch("https://b31a-200-73-176-50.ngrok-free.app/api/event/" + id+"/enrollment", { // Cambia la URL
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`, // Agrega el token Bearer aquí
      },})
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      } 
      setChangePart(response)
    } catch (error) {
      
    }
  }
  const Suscribirse = async (id)=> {
    try {
      const response = await fetch("https://b31a-200-73-176-50.ngrok-free.app/api/event/" + id+"/enrollment", { // Cambia la URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`, // Agrega el token Bearer aquí
      },})
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      } 
      setChangePart(response)
    }
    catch {

    }
  }
  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }
  return (
    <View style={styles.homeScreen}>
      <Text style={styles.text}>Name: {item.name}</Text>
      <Text style={styles.text}>Description: {item.description}</Text>
      <Text style={styles.text}>Duration: {item.duration_in_minutes}</Text>
      <Text style={styles.text}>Price: {item.price}</Text>
      <View style={{ height: 20 }} />
      <Text style={styles.title}>Listado Participantes</Text>
      {participantes != "Array vacio" ? (
        participantes.map((element, index) => (
          <View key={index} style={styles.participant}>
            <Text>Username: {element.username}</Text>
            <Text>Attended: {element.attended ? 'Yes' : 'No'}</Text>
          </View>
        ))
      ) : (
        <Text>No hay Participantes.</Text>
      )}
      {new Date(item.start_date)<fechaActual? <></> : <View><Button title='Suscribirse' onPress={()=>Suscribirse(item.id)}></Button><Button title='Desuscribirse' onPress={()=>Desuscribirse(item.id)}></Button></View> }
      <Button title="Ir A Home" onPress={() => navigation.navigate('ListadoTotal')} />
    </View>
  );
}

function StackANavigator({ eventos }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ListadoTotal">
        {(props) => <ScreenA1 {...props} eventos={eventos} />}
      </Stack.Screen>
      <Stack.Screen name="Evento" component={ScreenA2} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MyTabs({ eventos }) {
  const { user } = useUser();

  return (
    <Tab.Navigator>
      {user ? (
        <Tab.Screen
          name="Home"
          options={{
            tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
          }}
        >
          {(props) => <StackANavigator {...props} eventos={eventos} />}
        </Tab.Screen>
      ) : (
        <Tab.Screen name="Auth" component={AuthStack} />
      )}
    </Tab.Navigator>
  );
}



export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // Realiza el fetch de los eventos
        const response = await fetch('https://b31a-200-73-176-50.ngrok-free.app/api/event');
        const data = await response.json();
        setEventos(data); // Guarda los datos en el estado
        setIsReady(true); // Marca la aplicación como lista
        await SplashScreen.hideAsync(); // Oculta la splash screen
      } catch (e) {
        console.warn(e);
      }
    };

    prepareApp();
  }, []);

  if (!isReady) {
    return null; // La splash screen se muestra hasta que isReady sea true
  }

  return (
    <UserProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <MyTabs eventos={eventos} />
        </NavigationContainer>
      </SafeAreaProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    width: '100%',
    paddingHorizontal: 8,
  },
  participant: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
});
