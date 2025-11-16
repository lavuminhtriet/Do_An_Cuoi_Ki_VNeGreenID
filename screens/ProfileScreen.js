// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView,
  Alert, Switch, Platform, ActivityIndicator
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../constants/apiConfig'; // Đảm bảo bạn đã tạo file này

// Cấu hình thông báo (giữ nguyên)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false,
  }),
});

const DAYS_OF_WEEK = [
  { id: 'T2', name: 'T2' }, { id: 'T3', name: 'T3' }, { id: 'T4', name: 'T4' },
  { id: 'T5', name: 'T5' }, { id: 'T6', name: 'T6' }, { id: 'T7', name: 'T7' },
  { id: 'CN', name: 'CN' },
];

export default function ProfileScreen() {
  const { authState } = useAuth();
  
  // States (Hồ sơ)
  const [avatarUri, setAvatarUri] = useState(null);
  const [name, setName] = useState(authState.user?.name);
  const [email, setEmail] = useState(authState.user?.email);
  const [phone, setPhone] = useState('0909123456');
  const [defaultLocation, setDefaultLocation] = useState('Hanoi');
  
  // States (Cảnh báo & Nhắc rác)
  const [pushToken, setPushToken] = useState(null); // Sẽ được lấy 1 lần
  const [allowNotifications, setAllowNotifications] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState('150');
  const [recycleReminderEnabled, setRecycleReminderEnabled] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  
  // States (Lịch sử)
  const [reportHistory, setReportHistory] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const chatbotHistory = [{ id: 1, question: 'Cách phân loại pin?' }];

  // --- 1. LOAD DỮ LIỆU TỪ BỘ NHỚ KHI VÀO MÀN HÌNH ---
  useFocusEffect(
    React.useCallback(() => {
      loadSettingsFromStorage();
      loadReportsFromStorage();
    }, [])
  );

  // Tải Lịch sử Báo cáo (FR-4.2)
  const loadReportsFromStorage = async () => {
    setLoadingReports(true);
    try {
      const jsonValue = await AsyncStorage.getItem('@my_reports');
      setReportHistory(jsonValue != null ? JSON.parse(jsonValue) : []);
    } catch (e) { console.error("Lỗi đọc báo cáo:", e); }
    setLoadingReports(false);
  };

  // Tải Cài đặt Nhắc rác (FR-6.2)
  const loadRecycleSettings = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@recycle_settings');
      if (jsonValue != null) {
        const settings = JSON.parse(jsonValue);
        setRecycleReminderEnabled(settings.enabled || false);
        setSelectedDay(settings.day || null);
      }
    } catch (e) { console.error("Lỗi đọc cài đặt nhắc rác:", e); }
  };
  
  // --- 2. HÀM LẤY PUSH TOKEN (CHỈ CHẠY 1 LẦN KHI BẬT) ---
  const registerForPushNotifications = async () => {
    try { 
      let token;
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', { name: 'default', importance: Notifications.AndroidImportance.MAX });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Lỗi', 'Bạn chưa cấp quyền thông báo!');
        return false; // Báo thất bại
      }
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" // THAY BẰNG PROJECT ID CỦA BẠN TRONG app.json
      })).data;
      console.log("Expo Push Token:", token); 
      setPushToken(token); // Quan trọng: Set token vào state
      return true; // Báo thành công
    } catch (e) {
      console.error("Lỗi khi lấy Push Token:", e);
      Alert.alert( 'Lỗi Lấy Token', 'Không thể lấy push token. Hãy chắc chắn file app.json đã có "projectId" hợp lệ. Lỗi: ' + e.message );
      return false; // Báo thất bại
    }
  };

  // --- 3. HÀM ĐỒNG BỘ "THÔNG MINH" (MASTER SYNC) ---
  // useEffect này sẽ "quan sát" các cài đặt.
  // Nó chỉ chạy khi một cài đặt thay đổi VÀ đã có pushToken.
  useEffect(() => {
    // Hàm đồng bộ lên server
    const syncSettingsWithServer = async () => {
      // ĐIỀU KIỆN AN TOÀN:
      // 1. Nếu người dùng tắt thông báo -> KHÔNG GỬI
      // 2. Nếu chưa có pushToken -> KHÔNG GỬI
      if (!allowNotifications || !pushToken) {
        console.log("SYNC BỎ QUA: Người dùng tắt thông báo hoặc chưa có token.");
        return;
      }

      // Tập hợp tất cả cài đặt
      const settings = {
        pushToken: pushToken,
        alertThreshold: parseInt(alertThreshold) || 150,
        defaultLocation: defaultLocation,
        recycleSettings: {
          enabled: recycleReminderEnabled,
          day: selectedDay,
        }
      };

      console.log("Đang đồng bộ cài đặt lên server:", settings);
      try {
        const response = await fetch(`${API_URL}/register-push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        });
        if (response.ok) {
          console.log("Đồng bộ server thành công!");
        } else {
          const json = await response.json();
          console.error("Lỗi đồng bộ server:", json.error);
        }
      } catch (e) {
        console.error("LỖI KẾT NỐI SERVER:", e);
        Alert.alert(
          "Lỗi Kết Nối",
          "Không thể kết nối đến máy chủ: " + API_URL
        );
      }
    };
    
    // Gọi hàm sync
    syncSettingsWithServer();

  }, [pushToken, alertThreshold, defaultLocation, recycleReminderEnabled, selectedDay, allowNotifications]); // <-- "Quan sát" 6 state này

  // --- 4. CÁC HÀM HANDLER (ĐÃ ĐƠN GIẢN HÓA) ---
  // Các hàm này chỉ cần setState. useEffect ở trên sẽ lo việc đồng bộ.
  
  const toggleNotifications = async (value) => {
    setAllowNotifications(value);
    if (value === true) {
      // Nếu bật, cố gắng lấy token
      const success = await registerForPushNotifications();
      if (!success) {
        setAllowNotifications(false); // Trả lại Switch nếu lấy token thất bại
      }
    } else {
      // Nếu tắt, ta không cần làm gì (useEffect sẽ tự thấy `allowNotifications` là false)
      console.log("Đã tắt thông báo.");
    }
  };
  
  const handleSaveThreshold = () => {
    // Chỉ cần setState. useEffect sẽ tự động sync.
    setAlertThreshold(alertThreshold); // (Thực ra dòng này hơi thừa, nhưng để cho rõ)
    Alert.alert('Đã lưu', `Ngưỡng cảnh báo mới là ${alertThreshold}.`); 
  };
  
  const toggleRecycleReminder = (value) => {
    setRecycleReminderEnabled(value);
    const newDay = value ? selectedDay : null;
    if (!value) setSelectedDay(null);
    AsyncStorage.setItem('@recycle_settings', JSON.stringify({ enabled: value, day: newDay }));
    // useEffect sẽ tự động sync
  };

  const handleSelectDay = (dayId) => {
    const newDay = dayId === selectedDay ? null : dayId;
    setSelectedDay(newDay);
    AsyncStorage.setItem('@recycle_settings', JSON.stringify({ enabled: recycleReminderEnabled, day: newDay }));
    // useEffect sẽ tự động sync
  };
  
  // (Các hàm Hồ sơ và Lịch sử không thay đổi)
  const pickImage = async () => {

    try {
      let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Lỗi', 'Bạn cần cấp quyền truy cập thư viện ảnh.'); return; }
      let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
      if (!result.canceled) { setAvatarUri(result.assets[0].uri); }
    } catch (e) { console.error("Lỗi khi chọn ảnh:", e); Alert.alert('Lỗi', 'Không thể mở thư viện ảnh.'); }
  };
  
  const handleSaveChanges = () => { 
    // Khi đổi Vị trí mặc định, useEffect cũng sẽ tự động sync
    Alert.alert('Thông báo', 'Đã cập nhật thông tin.'); 
  };

  const renderReportHistory = () => {
    if (loadingReports) { return <ActivityIndicator color={COLORS.primary} />; }
    if (reportHistory.length === 0) { return <Text style={styles.emptyText}>Bạn chưa gửi báo cáo nào.</Text>; }
    return reportHistory.map(report => {
      if (!report || typeof report !== 'object') { return null; }
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
          <Text style={[ styles.historyStatus, { color: color } ]}> {status} </Text>
        </View>
      );
    });
  };

  const clearHistory = async () => {
    Alert.alert( "Xác nhận Xóa", "Bạn có chắc muốn xóa toàn bộ lịch sử báo cáo?",
      [ { text: "Hủy" }, { 
          text: "OK, Xóa", 
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@my_reports');
              setReportHistory([]);
              Alert.alert("Đã xóa!", "Lịch sử đã được dọn dẹp.");
            } catch (e) { Alert.alert("Lỗi", "Không thể xóa lịch sử."); }
          }
        }
      ]
    );
  };


  // --- GIAO DIỆN (Không thay đổi) ---
  return (
    <ScrollView style={styles.container}>
      {/* (Phần Hồ sơ) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          <Image style={styles.avatar} source={avatarUri ? { uri: avatarUri } : require('../assets/icon.png')} />
          <View style={styles.cameraIcon}><MaterialCommunityIcons name="camera" size={20} color={COLORS.white} /></View>
        </TouchableOpacity>
        <Text style={styles.nameText}>{name}</Text>
        <Text style={styles.emailText}>{email}</Text>
      </View>

      {/* (Phần Nhắc rác FR-6.2) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt Nhắc nhở (FR-6.2)</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Nhắc lịch thu gom rác</Text>
          <Switch
            trackColor={{ false: '#767577', true: COLORS.primaryLight }}
            thumbColor={recycleReminderEnabled ? COLORS.primary : '#f4f3f4'}
            onValueChange={toggleRecycleReminder}
            value={recycleReminderEnabled}
          />
        </View>
        {recycleReminderEnabled && (
          <>
            <Text style={styles.label}>Chọn ngày thu gom hàng tuần:</Text>
            <View style={styles.daySelector}>
              {DAYS_OF_WEEK.map(day => (
                <TouchableOpacity
                  key={day.id}
                  style={[ styles.dayButton, selectedDay === day.id && styles.dayButtonSelected ]}
                  onPress={() => handleSelectDay(day.id)}
                >
                  <Text style={[ styles.dayText, selectedDay === day.id && styles.dayTextSelected ]}>
                    {day.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
      
      {/* (Phần Cảnh báo AQI FR-2.2) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt Cảnh báo AQI (FR-2.2)</Text>
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

      {/* (Phần Thông tin) */}
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

      {/* (Phần Lịch sử Báo cáo) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch sử báo cáo</Text>
        
        <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
          <MaterialCommunityIcons name="delete-sweep" size={20} color={COLORS.unhealthy} />
          <Text style={styles.clearButtonText}>Dọn dẹp Lịch sử (Sửa lỗi)</Text>
        </TouchableOpacity>
        {renderReportHistory()}
      </View>

      {/* (Phần Lịch sử Chatbot) */}
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

// --- STYLESHEET (ĐẦY ĐỦ VÀ CHÍNH XÁC) ---
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
  clearButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, backgroundColor: '#FFF0F0', borderColor: COLORS.unhealthy, borderWidth: 1, borderRadius: 8, marginBottom: 15, },
  clearButtonText: { color: COLORS.unhealthy, marginLeft: 10, fontWeight: '600', },
  
  daySelector: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 5, },
  dayButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.lightGray, borderWidth: 1, borderColor: '#E0E0E0', },
  dayButtonSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, },
  dayText: { color: COLORS.black, fontWeight: 'bold', },
  dayTextSelected: { color: COLORS.white, },
});