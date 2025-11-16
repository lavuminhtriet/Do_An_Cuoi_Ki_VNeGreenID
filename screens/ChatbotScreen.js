// screens/ChatbotScreen.js
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { COLORS } from '../constants/colors';
import * as Speech from 'expo-speech'; 

const GEMINI_API_KEY = 'AIzaSyD-4-98mFCtDPi8U5eRclB-UK4EwKf4FcU'; 

// Khởi tạo AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


const chatbotUser = {
  _id: 2,
  name: 'VNeGreen Bot',
  avatar: 'https://cdn-icons-png.flaticon.com/512/1053/1053093.png',
};


const humanUser = {
  _id: 1,
};

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);


  useEffect(() => {
    const welcomeMessage = {
      _id: 1,
      text: 'Chào bạn! Tôi là VNeGreen Bot. Tôi có thể giúp gì về môi trường, phân loại rác, hoặc luật bảo vệ môi trường?',
      createdAt: new Date(),
      user: chatbotUser,
    };
    setMessages([welcomeMessage]);
    

    Speech.speak(welcomeMessage.text, { language: 'vi-VN' });
  }, []);


  const onSend = useCallback((newMessages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages),
    );
    const userMessage = newMessages[0].text;
    callGeminiAPI(userMessage);
  }, []);


  const callGeminiAPI = async (prompt) => {
    setIsTyping(true);

    try {
      const fullPrompt = `
        Bạn là VNeGreen Bot, một trợ lý AI chuyên gia về môi trường tại Việt Nam. 
        Nhiệm vụ của bạn là trả lời các câu hỏi về: 
        1. Phân loại rác (ví dụ: pin, chai nhựa).
        2. Luật bảo vệ môi trường Việt Nam (các nghị định, mức phạt).
        3. Các mẹo sống xanh, tái chế, và các sự kiện môi trường.
        Hãy trả lời câu hỏi sau một cách ngắn gọn (dưới 100 từ), thân thiện và chính xác:
        
        Câu hỏi: "${prompt}"
      `;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      const aiMessage = {
        _id: Math.random().toString(),
        text: text,
        createdAt: new Date(),
        user: chatbotUser,
      };


      Speech.speak(text, { language: 'vi-VN' }); 

      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [aiMessage]),
      );

    } catch (error) {
      console.error("Lỗi gọi Gemini API:", error);
      const errorMessage = {
        _id: Math.random().toString(),
        text: 'Rất tiếc, tôi đang gặp lỗi kết nối. Bạn vui lòng thử lại sau nhé.',
        createdAt: new Date(),
        user: chatbotUser,
      };
      

      Speech.speak(errorMessage.text, { language: 'vi-VN' });
      
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [errorMessage]),
      );
    }
    
    setIsTyping(false);
  };

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={humanUser}
        placeholder="Nhập câu hỏi về môi trường..."
        isTyping={isTyping}
        renderLoading={() => (
          <ActivityIndicator size="large" color={COLORS.primary} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});