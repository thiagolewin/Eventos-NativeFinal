import React, { useState } from 'react';
import { Alert, Button, Text, TextInput, View, StyleSheet } from 'react-native';
import { useUser } from './UserContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useUser(); // Obtener la función de registro del contexto
  const [username, setUsername] = useState('');
  const [first_name, setFirst_name] = useState('');
  const [last_name, setLast_name] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const success = await register(first_name,last_name,username, password);
    if (success) {
      navigation.navigate('Home'); // Navega a la pantalla principal si el registro es exitoso
    } else {
      Alert.alert('Error', 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={first_name}
        onChangeText={setFirst_name}
        keyboardType=""
        autoCapitalize="none"
      />
         <TextInput
        style={styles.input}
        placeholder="last Name"
        value={last_name}
        onChangeText={setLast_name}
        keyboardType=""
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="username"
        value={username}
        onChangeText={setUsername}
        keyboardType=""
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title="Register" onPress={handleRegister} />
      <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    width: '100%',
    paddingHorizontal: 8,
  },
});
