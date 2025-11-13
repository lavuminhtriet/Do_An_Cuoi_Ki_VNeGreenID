// screens/ReportScreen.js
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
  Platform
} from 'react-native';
import { COLORS } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Video, ResizeMode } from 'expo-video'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

let MapView = null;
let Marker = null;
if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
}

const { width } = Dimensions.get('window');

export default function ReportScreen() {
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState(null); 
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoPlayer = useRef(null);

  const pickImageFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Bạn cần cấp quyền truy cập camera.');
        return;
      }
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
      });
      if (!result.canceled) {
        setMedia({ uri: result.assets[0].uri, type: 'image' });
      }
    } catch (e) {
      Alert.alert('Lỗi Camera', e.message);
    }
  };

  const pickVideoFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Bạn cần cấp quyền truy cập thư viện.');
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      });
      if (!result.canceled) {
        setMedia({ uri: result.assets[0].uri, type: 'video' });
      }
    } catch (e) {
      Alert.alert('Lỗi Tải Video', e.message);
    }
  };

  const renderMedia = () => {
    if (!media) return null;

    if (media.type === 'image') {
      return (
        <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
      );
    }
    if (media.type === 'video') {
      return (
        <Video
          ref={videoPlayer}
          style={styles.mediaPreview}
          source={{ uri: media.uri }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN} 
          isLooping
        />
      );
    }
    return null;
  };

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Bạn cần cấp quyền vị trí.');
      return;
    }
    try {
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(coords);
      Alert.alert('Thành công', 'Đã lấy vị trí GPS hiện tại của bạn.');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại.');
    }
  };

  const onMapPress = (e) => {
    setLocation(e.nativeEvent.coordinate);
  };


  const handleSubmit = async () => {
    if (!description || !location || !media) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ mô tả, bằng chứng và vị trí.');
      return;
    }

    setIsSubmitting(true);
    console.log('Đang gửi Báo cáo:', { description, location, media });
    
    try {
      const newReport = {
        id: new Date().toISOString(),
        title: description.substring(0, 50) + '...',
        status: 'Đã nhận',
        date: new Date().toLocaleDateString('vi-VN'),
      };
      const existingReports = await AsyncStorage.getItem('@my_reports');
      const reports = existingReports ? JSON.parse(existingReports) : [];
      reports.unshift(newReport);
      await AsyncStorage.setItem('@my_reports', JSON.stringify(reports));
    } catch (e) {
      console.error("Lỗi khi lưu báo cáo:", e);
      Alert.alert("Lỗi", "Không thể lưu báo cáo vào lịch sử.");
    }
    
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert('Gửi Thành Công', 'Báo cáo của bạn đã được gửi và lưu vào lịch sử!');
      setDescription('');
      setMedia(null);
      setLocation(null);
    }, 1000);
  };


  return (
    <ScrollView style={styles.container}>

      <Text style={styles.label}>Mô tả vi phạm</Text>
      <TextInput
        style={styles.input}
        placeholder="Ví dụ: Công ty X xả khói đen, xả rác tại công viên..."
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />


      <Text style={styles.label}>Bằng chứng (Ảnh/Video)</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={pickImageFromCamera}>
          <MaterialCommunityIcons name="camera" size={20} color={COLORS.primary} />
          <Text style={styles.buttonText}>Chụp ảnh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickVideoFromLibrary}>
          <MaterialCommunityIcons name="video" size={20} color={COLORS.primary} />
          <Text style={styles.buttonText}>Tải lên Video</Text>
        </TouchableOpacity>
      </View>
      {renderMedia()}

      <Text style={styles.label}>Vị trí vi phạm</Text>
      <TouchableOpacity style={[styles.button, styles.locationButton]} onPress={getCurrentLocation}>
        <MaterialCommunityIcons name="crosshairs-gps" size={20} color={COLORS.primary} />
        <Text style={styles.buttonText}>Lấy vị trí GPS hiện tại</Text>
      </TouchableOpacity>
      <Text style={styles.hintText}>...hoặc nhấn vào bản đồ bên dưới để ghim vị trí:</Text>
      
      {MapView ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 10.7769,
            longitude: 106.7009,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={onMapPress}
        >
          {location && (
            <Marker
              coordinate={location}
              title="Vị trí vi phạm"
              pinColor={COLORS.primary}
            />
          )}
        </MapView>
      ) : (
        <View style={styles.mapError}>
          <Text style={styles.mapErrorText}>TÍNH NĂNG BẢN ĐỒ KHÔNG ĐƯỢC HỖ TRỢ TRÊN WEB.</Text>
          <Text style={styles.mapErrorText}>(Vui lòng dùng nút "Lấy vị trí GPS")</Text>
        </View>
      )}


      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.submitButtonText}>Gửi Báo Cáo</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 15,
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  mediaPreview: {
    width: width - 30,
    height: 200,
    borderRadius: 8,
    marginTop: 15,
    backgroundColor: COLORS.lightGray,
  },
  locationButton: {
    alignSelf: 'flex-start',
  },
  hintText: {
    fontSize: 14,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  map: {
    width: width - 30,
    height: 250,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  mapError: {
    width: width - 30,
    height: 250,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  mapErrorText: {
    color: COLORS.gray,
    textAlign: 'center',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});