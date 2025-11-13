// screens/GarbageGuideScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { COLORS } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GARBAGE_CATEGORIES } from '../data/garbageData';
import * as ImagePicker from 'expo-image-picker'; 

const IMAGGA_API_KEY = 'acc_c13726902ebeac3'; 
const IMAGGA_API_SECRET = 'f256d42b54bb2402b56377fbf09d504f'; 

export default function GarbageGuideScreen() {
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isScanning, setIsScanning] = useState(false); 

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  const filteredCategories = GARBAGE_CATEGORIES.filter(category => 
    category.name.toLowerCase().includes(searchText.toLowerCase()) ||
    category.examples.some(example => example.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleScanAI = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Bạn cần cấp quyền truy cập camera để sử dụng tính năng này.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, 
      quality: 0.5, 
      base64: true, 
    });

    if (!result.canceled) {
     
      setIsScanning(true); 
      callImaggaAPI(result.assets[0].base64);
    }
  };


  const callImaggaAPI = async (imageBase64) => {
   
    const formData = new FormData();
    formData.append('image_base64', imageBase64);


    const authCredentials = btoa(`${IMAGGA_API_KEY}:${IMAGGA_API_SECRET}`);
    
    try {
      const response = await fetch('https://api.imagga.com/v2/tags', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authCredentials}`,
        },
        body: formData,
      });

      const json = await response.json();

      if (json.status && json.status.type === 'success') {
        
        processImaggaResults(json.result.tags);
      } else {
        
        Alert.alert('Lỗi AI', 'Không thể phân tích hình ảnh. (Lỗi: ' + json.status.text + ')');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi Mạng', 'Không thể kết nối đến máy chủ AI.');
    }
    
    setIsScanning(false); 
  };


  const processImaggaResults = (tags) => {
    const topTags = tags.slice(0, 5).map(tag => tag.tag.en.toLowerCase());
    console.log("AI Tags:", topTags);

    let suggestion = null;

    if (topTags.includes('can') || topTags.includes('tin can') || topTags.includes('aluminum')) {
      suggestion = 'kim-loai';
    } else if (topTags.includes('bottle') || topTags.includes('plastic') || topTags.includes('cup')) {
      suggestion = 'nhua';
    } else if (topTags.includes('food') || topTags.includes('fruit') || topTags.includes('vegetable') || topTags.includes('peel')) {
      suggestion = 'huu-co';
    } else if (topTags.includes('battery') || topTags.includes('electronics') || topTags.includes('phone')) {
      suggestion = 'dien-tu';
    } else if (topTags.includes('syringe') || topTags.includes('mask') || topTags.includes('medical')) {
      suggestion = 'y-te';
    }

    if (suggestion) {
      const category = GARBAGE_CATEGORIES.find(c => c.id === suggestion);
      Alert.alert(
        'AI Gợi ý',
        `Hình như đây là "${category.name}". Bạn có muốn xem hướng dẫn xử lý không?`,
        [
          { text: 'Để sau' },
          { text: 'Xem ngay', onPress: () => handleCategoryPress(category) }
        ]
      );
    } else {
      Alert.alert('AI Không chắc chắn', 'Rất tiếc, AI không thể nhận diện được vật thể này. Bạn vui lòng tìm kiếm thủ công nhé.');
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color={COLORS.gray} style={{marginLeft: 10}} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo phân loại rác (ví dụ: pin, chai nhựa...)"
          placeholderTextColor={COLORS.gray}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <TouchableOpacity 
        style={styles.scanButton} 
        onPress={handleScanAI}
        disabled={isScanning} 
      >
        {isScanning ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <MaterialCommunityIcons name="camera-outline" size={24} color={COLORS.white} />
            <Text style={styles.scanButtonText}>Scan Rác Thải Bằng AI</Text>
          </>
        )}
      </TouchableOpacity>


      <ScrollView>
        {filteredCategories.map(category => (
          <TouchableOpacity 
            key={category.id} 
            style={[styles.categoryCard, { borderColor: category.color }]}
            onPress={() => handleCategoryPress(category)}
          >
            <MaterialCommunityIcons name={category.icon} size={40} color={category.color} />
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryDesc}>{category.description}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={30} color={COLORS.gray} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedCategory && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <View style={[styles.modalHeader, { backgroundColor: selectedCategory.color }]}>
                <MaterialCommunityIcons name={selectedCategory.icon} size={30} color={COLORS.white} />
                <Text style={styles.modalTitle}>{selectedCategory.name}</Text>
              </View>
              
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.sectionTitle}>Hướng dẫn xử lý:</Text>
                {selectedCategory.guidelines.map((item, index) => (
                  <Text key={index} style={styles.listItem}>• {item}</Text>
                ))}

                <Text style={styles.sectionTitle}>Ví dụ:</Text>
                <Text style={styles.exampleText}>{selectedCategory.examples.join(', ')}</Text>

                <Text style={styles.sectionTitle}>Địa điểm thu gom:</Text>
                {selectedCategory.dropOffPoints.map((item, index) => (
                  <Text key={index} style={styles.listItem}>• {item}</Text>
                ))}
              </ScrollView>
              
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    margin: 10,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: 45,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary, 
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 15,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  categoryDesc: {
    fontSize: 14,
    color: COLORS.gray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '75%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 10,
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 15,
    marginBottom: 5,
  },
  listItem: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 5,
    lineHeight: 22,
  },
  exampleText: {
    fontSize: 16,
    color: COLORS.black,
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});