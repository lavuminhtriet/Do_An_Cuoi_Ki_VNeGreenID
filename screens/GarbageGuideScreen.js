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
  Pressable 
} from 'react-native';
import { COLORS } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GARBAGE_CATEGORIES } from '../data/garbageData'; 

export default function GarbageGuideScreen() {
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const handleCategoryPress = (category) => {
    setSelectedCategory(category); 
    setModalVisible(true); 
  };

  const filteredCategories = GARBAGE_CATEGORIES.filter(category => 
    category.name.toLowerCase().includes(searchText.toLowerCase()) ||
    category.examples.some(example => example.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color={COLORS.gray} style={{marginLeft: 10}} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên rác (ví dụ: pin, chai nhựa...)"
          placeholderTextColor={COLORS.gray}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

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

                <Text style={styles.sectionTitle}>Địa điểm thu gom (Giả lập):</Text>
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