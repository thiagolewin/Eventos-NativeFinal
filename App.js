import * as React from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';

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
          <Button title={element.name} key={index} onPress={() => navigation.navigate('Evento',{item: element})}></Button>
        ))
      ) : (
        <Text>No hay eventos disponibles.</Text>
      )}
    </View>
  );
}

 function ScreenA2({route}) {
  const [participantes, setParticipantes] = useState([]); // State for participants
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigation = useNavigation();
  const { item } = route.params;
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetch("https://57d0-200-73-176-50.ngrok-free.app/api/event/enrollments/" + item.id);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setParticipantes(data);  // Update participants state
      } catch (error) {
        setError(error.message);  // Set error state if something goes wrong
      } finally {
        setLoading(false);  // Mark loading as complete
      }
    };
    
    fetchParticipants();  // Trigger the fetch
  }, []); 
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
      {participantes.length > 0 ? (
        participantes.map((element, index) => (
          <View key={index} style={styles.participant}>
            <Text>Username: {element.username}</Text>
            <Text>Attended: {element.attended ? 'Yes' : 'No'}</Text>
          </View>
        ))
      ) : (
        <Text>No hay Participantes.</Text>
      )}

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

function MyTabs({ eventos }) {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      >
        {(props) => <StackANavigator {...props} eventos={eventos} />}
      </Tab.Screen>
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
        const response = await fetch('https://57d0-200-73-176-50.ngrok-free.app/api/event');
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
    <SafeAreaProvider>
      <NavigationContainer>
        <MyTabs eventos={eventos} />
      </NavigationContainer>
    </SafeAreaProvider>
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
});
