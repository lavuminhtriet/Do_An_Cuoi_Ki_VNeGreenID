// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors'; 
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native'; 


const AQI_API_TOKEN = 'e048cbb0906d0aad51dc34b65bfbadeb4d7197a9'; 

export default function HomeScreen() {
  const { authState, logout } = useAuth();
  const navigation = useNavigation(); 
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCity, setSearchCity] = useState('');

 
  useEffect(() => {
    loadAqiByLocation();
  }, []);

 
  const loadAqiByLocation = async () => {
    setLoading(true);
    setError(null);
    setAqiData(null); 

    
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Bạn cần cấp quyền vị trí để xem AQI tại đây.');
      setLoading(false);
      return;
    }

    
    try {

      let location = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.High 
      });

      
      const { latitude, longitude } = location.coords;
      
      
      fetchAqiData(`geo:${latitude};${longitude}`);
    } catch (e) {
      setError('Không thể lấy vị trí hiện tại.');
      setLoading(false);
    }
  };

  const loadAqiByCity = () => {
    if (searchCity.trim() === '') {
      Alert.alert('Lỗi', 'Vui lòng nhập tên thành phố.');
      return;
    }
    setLoading(true);
    setError(null);
    setAqiData(null); 
    fetchAqiData(searchCity);
  };

 
  const fetchAqiData = async (query) => {
    try {
      const response = await fetch(
        `https://api.waqi.info/feed/${query}/?token=${AQI_API_TOKEN}`
      );
      const json = await response.json();

      if (json.status === 'ok') {
        setAqiData(json.data);
      } else {
        setError(json.data || 'Không tìm thấy trạm đo cho khu vực này.');
      }
    } catch (e) {
      setError('Lỗi kết nối đến máy chủ AQI.');
      console.error(e);
    }
    setLoading(false);
  };

 
  const getAqiInfo = (aqi) => {
    if (aqi <= 50) return { 
      color: COLORS.good, 
      text: 'Tốt', 
      recommendation: 'Chất lượng không khí tuyệt vời. Hãy tận hưởng các hoạt động ngoài trời!',
      icon: 'leaf' 
    };
    if (aqi <= 100) return { 
      color: COLORS.moderate, 
      text: 'Trung bình', 
      recommendation: 'Chất lượng không khí ở mức tương đối. Người nhạy cảm nên giảm hoạt động ngoài trời.',
      icon: 'weather-windy'
    };
    if (aqi <= 150) return { 
      color: COLORS.unhealthySensitive, 
      text: 'Kém', 
      recommendation: 'Người già, trẻ em và người có bệnh hô hấp nên ở trong nhà.',
      icon: 'blur'
    };
    if (aqi <= 200) return { 
      color: COLORS.unhealthy, 
      text: 'Xấu', 
      recommendation: 'Mọi người nên giảm hoạt động ngoài trời, đeo khẩu trang khi ra ngoài nếu có việc cần thiết.',
      icon: 'weather-fog'
    };
    if (aqi <= 300) return { 
      color: COLORS.veryUnhealthy, 
      text: 'Rất Xấu', 
      recommendation: 'Cảnh báo sức khỏe! Mọi người nên ở trong nhà.',
      icon: 'smog'
    };
    return { 
      color: COLORS.hazardous, 
      text: 'Nguy hiểm', 
      recommendation: 'Tình trạng khẩn cấp! Đóng tất cả cửa sổ và ở trong nhà.',
      icon: 'alert-octagon'
    };
  };

 
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    if (aqiData) {
      const aqiValue = aqiData.aqi;
      const aqiInfo = getAqiInfo(aqiValue);
      const city = aqiData.city.name.split('(')[0]; 

      return (
        <View style={styles.aqiCard}>

          <Text style={styles.cityText}>{city}</Text>
          <Text style={styles.updateText}>
            Cập nhật lúc: {new Date(aqiData.time.iso).toLocaleTimeString('vi-VN')}
          </Text>


          <View style={styles.aqiDisplay}>
            <MaterialCommunityIcons name={aqiInfo.icon} size={60} color={aqiInfo.color} />
            <Text style={[styles.aqiValue, { color: aqiInfo.color }]}>
              {aqiValue}
            </Text>
            <Text style={[styles.aqiText, { color: aqiInfo.color }]}>
              {aqiInfo.text}
            </Text>
          </View>


          <View style={styles.recommendationBox}>
            <MaterialCommunityIcons name="information-outline" size={24} color={COLORS.secondary} />
            <Text style={styles.recommendationText}>
              {aqiInfo.recommendation}
            </Text>
          </View>
        </View>
      );
    }
    return null; 
  };

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        
        <TouchableOpacity 
          style={styles.welcomeButton}
          onPress={() => navigation.jumpTo('ProfileTab', { screen: 'Profile' })} 
          disabled={authState.isGuest} 
        >
          <Text style={styles.welcomeText}>
            {authState.isGuest ? 'Chào Khách!' : `Chào, ${authState.user?.name}!`}
          </Text>
          {!authState.isGuest && (
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.primary} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={18} color={COLORS.gray} />
          <Text style={styles.logoutText}>
            {authState.isGuest ? 'Đăng nhập' : 'Đăng xuất'}
          </Text>
        </TouchableOpacity>
      </View>


      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm thành phố khác..."
          placeholderTextColor={COLORS.gray}
          value={searchCity}
          onChangeText={setSearchCity}
        />
        <TouchableOpacity style={styles.searchButton} onPress={loadAqiByCity}>
          <MaterialCommunityIcons name="magnify" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>


      <TouchableOpacity style={styles.locationButton} onPress={loadAqiByLocation}>
        <MaterialCommunityIcons name="crosshairs-gps" size={20} color={COLORS.primary} />
        <Text style={styles.locationButtonText}>Dùng vị trí hiện tại của tôi</Text>
      </TouchableOpacity>


      {renderContent()}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray, 
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50, 
    marginBottom: 15,
  },
 
  welcomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, 
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary, 
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  logoutText: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  searchButton: {
    width: 45,
    height: 45,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight, 
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  locationButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    textAlign: 'center',
    color: COLORS.unhealthy,
    fontSize: 16,
    marginTop: 30,
  },
  aqiCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cityText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  updateText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 15,
  },
  aqiDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  aqiValue: {
    fontSize: 72,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  aqiText: {
    fontSize: 18,
    fontWeight: '600',
  },
  recommendationBox: {
    backgroundColor: '#E3F2FD', 
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.secondary,
    marginLeft: 10,
    lineHeight: 22,
  },
});