// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  ScrollView,
  Alert,
  Switch,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function ProfileScreen() {
  const { authState } = useAuth();
  
  const [avatarUri, setAvatarUri] = useState(null);
  const [name, setName] = useState(authState.user?.name);
  const [email, setEmail] = useState(authState.user?.email);
  const [phone, setPhone] = useState('0909123456');
  const [defaultLocation, setDefaultLocation] = useState('TP. Hồ Chí Minh');
  
  const [allowNotifications, setAllowNotifications] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState('150');
  
  const [reportHistory, setReportHistory] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const chatbotHistory = [
    { id: 1, question: 'Cách phân loại pin?' },
    { id: 2, question: 'AQI hôm nay thế nào?' },
  ];


  useFocusEffect(
    React.useCallback(() => {
      loadReports();
    }, [])
  );

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const jsonValue = await AsyncStorage.getItem('@my_reports');
      const reports = jsonValue != null ? JSON.parse(jsonValue) : [];
      setReportHistory(reports);
    } catch (e) {
      console.error("Lỗi khi đọc lịch sử báo cáo:", e);
      Alert.alert("Lỗi", "Không thể tải lịch sử báo cáo.");
    }
    setLoadingReports(false);
  };


  const registerForPushNotifications = async () => {
    try { 
      let token;
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Lỗi', 'Không thể bật thông báo vì bạn chưa cấp quyền!');
        setAllowNotifications(false);
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Expo Push Token:", token); 

      setAllowNotifications(true);
      Alert.alert('Thành công', 'Đã bật nhận thông báo cho thiết bị này.');
    } catch (e) {
      console.error("Lỗi khi lấy Push Token (Dòng 117):", e);
      Alert.alert( 
        'Lỗi Lấy Token', 
        'Không thể lấy push token. Hãy chắc chắn file app.json đã có "projectId". Lỗi: ' + e.message 
      );
      setAllowNotifications(false);
    }
  };

  const toggleNotifications = (value) => {
    setAllowNotifications(value);
    if (value === true) {
      registerForPushNotifications();
    } 
    else {
      Alert.alert('Đã tắt', 'Bạn sẽ không nhận được cảnh báo AQI nữa.');
    }
  };

  const handleSaveThreshold = () => {
    Alert.alert('Đã lưu', `Ngưỡng cảnh báo mới của bạn là ${alertThreshold}.`);
  };
  

  const pickImage = async () => {

    try {
      let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Bạn cần cấp quyền truy cập thư viện ảnh để đổi ảnh đại diện.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error("Lỗi khi chọn ảnh (Dòng 142):", e);
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh. Lỗi: ' + e.message);
    }
  };

  const handleSaveChanges = () => {
    Alert.alert('Thông báo', 'Đã cập nhật thông tin (Giả lập).');
  };

  const renderReportHistory = () => {
    if (loadingReports) {
      return <ActivityIndicator color={COLORS.primary} />;
    }
    if (reportHistory.length === 0) {
      return <Text style={styles.emptyText}>Bạn chưa gửi báo cáo nào.</Text>;
    }

    return reportHistory.map(report => {

      if (!report || typeof report !== 'object') {
        return null; 
      }
      
      const id = report.id || `unknown-${Math.random()}`;
      const title = report.title || 'Không có tiêu đề'; 
      const status = report.status || 'Không rõ'; 
      const date = report.date || 'Không có ngày'; 
      const color = status === 'Đã nhận' ? COLORS.unhealthySensitive : COLORS.good;

      return ( 
        <View key={id} style={styles.historyItem}>
          <View style={styles.historyInfo}>
            <Text style={styles.historyTitle}>{title}</Text>
            <Text style={styles.historyDate}>{date}</Text> 
          </View>
          <Text style={[ styles.historyStatus, { color: color } ]}> 
            {status}
          </Text>
        </View>
      );
    });
  };

  const clearHistory = async () => {
    Alert.alert(
      "Xác nhận Xóa",
      "Bạn có chắc muốn xóa toàn bộ lịch sử báo cáo? (Việc này sẽ SỬA LỖI nếu có dữ liệu rác)",
      [
        { text: "Hủy" },
        { 
          text: "OK, Xóa", 
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@my_reports');
              setReportHistory([]); 
              Alert.alert("Đã xóa!", "Lịch sử đã được dọn dẹp. Lỗi sẽ hết.");
            } catch (e) {
              Alert.alert("Lỗi", "Không thể xóa lịch sử.");
            }
          }
        }
      ]
    );
  };


  
  return (
    <ScrollView style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          <Image
            style={styles.avatar}
            source={avatarUri ? { uri: avatarUri } : require('../assets/icon.png')}
          />
          <View style={styles.cameraIcon}>
            <MaterialCommunityIcons name="camera" size={20} color={COLORS.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.nameText}>{name}</Text>
        <Text style={styles.emailText}>{email}</Text>
      </View>

      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt Cảnh báo</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Nhận cảnh báo AQI</Text>
          <Switch
            trackColor={{ false: '#767577', true: COLORS.primaryLight }}
            thumbColor={allowNotifications ? COLORS.primary : '#f4f3f4'}
            onValueChange={toggleNotifications}
            value={allowNotifications}
          />
        </View>

        {allowNotifications && (
          <>
            <Text style={styles.label}>Cảnh báo khi AQI vượt ngưỡng:</Text>
            <View style={styles.inputGroup}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color={COLORS.primary} />
              <TextInput style={styles.input} value={alertThreshold} onChangeText={setAlertThreshold} placeholder="Ví dụ: 150" keyboardType="number-pad"/>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveThreshold}>
              <Text style={styles.saveButtonText}>Lưu Ngưỡng</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
        <View style={styles.inputGroup}>
          <MaterialCommunityIcons name="account" size={20} color={COLORS.primary} />
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Họ và tên"/>
        </View>
        <View style={styles.inputGroup}>
          <MaterialCommunityIcons name="phone" size={20} color={COLORS.primary} />
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Số điện thoại"/>
        </View>
        <View style={styles.inputGroup}>
          <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
          <TextInput style={styles.input} value={defaultLocation} onChangeText={setDefaultLocation} placeholder="Khu vực sinh sống mặc định"/>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </View>

      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch sử báo cáo</Text>
        
        <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
          <MaterialCommunityIcons name="delete-sweep" size={20} color={COLORS.unhealthy} />
          <Text style={styles.clearButtonText}>Dọn dẹp Lịch sử (Sửa lỗi)</Text>
        </TouchableOpacity>
        {renderReportHistory()}
      </View>

      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch sử Chatbot</Text>
        {chatbotHistory.map(chat => {
          const id = chat.id || `chat-${Math.random()}`;
          const question = chat.question || 'Không có câu hỏi';
          return (
            <View key={id} style={styles.historyItem}>
              <Text style={styles.historyTitle}>{question}</Text> 
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  header: { backgroundColor: COLORS.white, padding: 20, alignItems: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 10 },
  avatarContainer: { position: 'relative', marginBottom: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.primaryLight },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, borderRadius: 15, padding: 5, borderWidth: 2, borderColor: COLORS.white },
  nameText: { fontSize: 22, fontWeight: 'bold', color: COLORS.black },
  emailText: { fontSize: 16, color: COLORS.gray },
  section: { backgroundColor: COLORS.white, borderRadius: 10, padding: 15, marginHorizontal: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.primary, marginBottom: 15 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lightGray, borderRadius: 8, paddingHorizontal: 10, marginBottom: 10 },
  input: { flex: 1, height: 45, paddingLeft: 10, fontSize: 16, color: COLORS.black },
  saveButton: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  saveButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  settingText: { fontSize: 16, color: COLORS.black },
  label: { fontSize: 14, color: COLORS.gray, marginBottom: 5, marginTop: 10 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray, },
  historyInfo: { flex: 1, },
  historyTitle: { fontSize: 15, color: COLORS.black, flex: 1, },
  historyDate: { fontSize: 12, color: COLORS.gray, },
  historyStatus: { fontSize: 14, fontWeight: '600', marginLeft: 10, },
  emptyText: { textAlign: 'center', color: COLORS.gray, fontStyle: 'italic', },
  
  
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#FFF0F0', 
    borderColor: COLORS.unhealthy, 
    borderWidth: 1,
    borderRadius: 8,

    marginBottom: 15,
  },
  clearButtonText: {
    color: COLORS.unhealthy, 
    marginLeft: 10,
    fontWeight: '600',
  }
});
