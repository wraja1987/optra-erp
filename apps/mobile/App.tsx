import * as React from 'react';
import { Text, View, Button } from 'react-native';

export default function App() {
  const [installed, setInstalled] = React.useState(false);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 8 }}>Optra Mobile (Demo)</Text>
      <Text>Auth: JWT (demo), Biometrics: stub, Push: mock, QR: stub</Text>
      <View style={{ height: 16 }} />
      <Button title={installed ? 'Installed' : 'Install (Demo)'} onPress={() => setInstalled(true)} />
    </View>
  );
}


