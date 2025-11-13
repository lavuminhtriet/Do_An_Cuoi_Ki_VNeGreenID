// screens/ForgotPasswordScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    console.log('Gửi yêu cầu reset cho:', email);
    Alert.alert(
      'Kiểm tra Email',
      'Nếu email này tồn tại, một đường link đặt lại mật khẩu đã được gửi đến bạn.',
      [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt lại mật khẩu</Text>
      <Text style={styles.subtitle}>Nhập email của bạn để nhận đường link đặt lại mật khẩu.</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Button title="Gửi yêu cầu" onPress={handleResetPassword} />
      
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Quay lại Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: 'gray' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, marginBottom: 15, paddingHorizontal: 10 },
  linkButton: { marginTop: 15 },
  linkText: { color: 'blue', textAlign: 'center' },
});