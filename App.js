import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  TextInput,
  Modal,
  Alert,
  Animated,
  Easing,
  useColorScheme,
  Switch,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as LocalAuthentication from 'expo-local-authentication';

const { width, height } = Dimensions.get('window');
const STORAGE_KEY = '@user_data_app_v2';


const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400';

const INITIAL_USER_DATA = {
  fullName: 'ІВАНОВ ІВАН ІВАНОВИЧ',
  birthDate: '01.01.2000',
  docNumber: '000000000',
  taxCode: '1234567890',
  expiryDate: '01.01.2030',
  issueDate: '01.01.2020',
  authority: '0000',
  photoUri: DEFAULT_AVATAR,
  signatureIndex: 0,
  signatureUri: null,
};

const SIGNATURE_PATHS = [
  "M8 24 C 18 8, 22 32, 32 18 C 40 6, 38 28, 50 20 C 60 12, 64 26, 76 16 C 85 8, 88 24, 98 18 M 12 30 Q 50 36 95 28",
  "M10 20 Q 25 5, 35 25 T 60 15 T 85 22 T 100 10 M 15 32 L 90 28",
  "M5 15 C 20 35, 30 5, 45 25 C 55 10, 70 30, 85 12 C 90 20, 95 15, 100 25 M 5 28 C 35 38, 65 24, 95 30",
  "M12 28 C 10 10, 25 8, 30 22 C 40 12, 50 30, 65 15 C 75 8, 85 25, 95 12 M 20 34 L 80 34",
  "M10 25 Q 20 10, 30 28 T 50 12 T 70 26 T 90 14 T 100 22 M 10 32 Q 55 24, 95 32",
  "M8 18 C 15 5, 25 30, 40 10 C 50 25, 60 8, 75 22 C 85 14, 95 28, 102 10 M 15 30 L 98 25",
  "M10 12 C 5 25, 20 30, 35 15 C 45 32, 55 10, 70 25 C 80 12, 90 28, 98 16 M 8 32 C 40 28, 70 34, 98 28",
  "M15 22 Q 25 8, 35 28 Q 50 10, 60 25 Q 75 12, 85 24 T 100 18 M 10 33 L 90 31",
  "M8 26 C 20 10, 28 32, 42 16 C 52 28, 62 12, 78 24 C 88 10, 94 26, 102 14 M 14 34 Q 55 38, 96 30",
  "M12 20 C 25 10, 30 30, 45 15 C 55 25, 68 12, 80 22 C 90 10, 98 20, 105 12 M 10 30 L 95 30",
  "M6 22 Q 20 8, 38 26 T 65 14 T 88 28 T 104 16 M 12 34 Q 50 26, 92 34",
  "M14 16 C 22 30, 35 10, 48 24 C 60 12, 72 28, 86 16 M 10 30 L 90 26",
];

const DOC_TYPES = [
  { id: 'idCard', title: 'Паспорт\nгромадянина\nУкраїни', badge: 'ID-картка' },
  { id: 'passport', title: 'Паспорт для\nвиїзду за кордон', badge: 'Закордонний' },
  { id: 'driver', title: 'Посвідчення\nводія', badge: 'Посвідчення' },
  { id: 'taxCard', title: 'Картка платника\nподатків', badge: 'РНОКПП' },
  { id: 'studentCard', title: 'Студентський\nквиток', badge: 'Навчання' },
  { id: 'techPass', title: 'Свідоцтво про\nреєстрацію ТЗ', badge: 'Авто' },
];

const FEED_DATA = [
  {
    id: '1',
    title: 'Незламність 🛡️',
    subtitle: 'Мапа Пунктів Незламності, укриттів та графіки відключень світла.',
    btnText: 'Переглянути на мапі',
    tag: 'Важливо',
    bgColor: '#1E293B',
  },
  {
    id: '2',
    title: 'Військові облігації 🇺🇦',
    subtitle: 'Підтримайте Збройні Сили України. Купуйте облігації у декілька кліків.',
    btnText: 'Придбати облігацію',
    tag: 'Фінанси',
    bgColor: '#1E3A8A',
  },
  {
    id: '3',
    title: 'єВідновлення 🏠',
    subtitle: 'Подайте заяву про пошкоджене або знищене майно під час бойових дій.',
    btnText: 'Подати заяву',
    tag: 'Послуги',
    bgColor: '#065F46',
  },
  {
    id: '4',
    title: 'Кешбек «Зроблено в Україні» 🛍️',
    subtitle: 'Отримуйте 10% компенсації за купівлю товарів українського виробництва.',
    btnText: 'Перевірити баланс',
    tag: 'Новинка',
    bgColor: '#831843',
  },
  {
    id: '5',
    title: 'Оновлення автоцивілки 🚗',
    subtitle: 'Перевірте дійсність вашого страхового полісу у реєстрі МТСБУ.',
    btnText: 'Дізнатися більше',
    tag: 'Авто',
    bgColor: '#312E81',
  },
  {
    id: '6',
    title: 'Дія.Освіта 🎓',
    subtitle: 'Безкоштовні освітні серіали та гайди для зміни професії.',
    btnText: 'Розпочати навчання',
    tag: 'Освіта',
    bgColor: '#701A75',
  },
];

const SERVICES_DATA = [
  { id: '1', title: 'Допомога ЗСУ', icon: 'shield-checkmark-outline', category: 'Армія' },
  { id: '2', title: 'єОселя 3%', icon: 'home-outline', category: 'Нерухомість' },
  { id: '3', title: 'Штрафи авто', icon: 'car-outline', category: 'Авто' },
  { id: '4', title: 'Витяги та довідки', icon: 'document-text-outline', category: 'Документи' },
  { id: '5', title: 'Заміна посвідчення', icon: 'card-outline', category: 'Авто' },
  { id: '6', title: 'Судові справи', icon: 'briefcase-outline', category: 'Право' },
  { id: '7', title: 'Оплата податків', icon: 'wallet-outline', category: 'Фінанси' },
  { id: '8', title: 'Шлюб за добу', icon: 'heart-outline', category: 'Сімʼя' },
  { id: '9', title: 'єВорог бот', icon: 'hardware-chip-outline', category: 'Безпека' },
  { id: '10', title: 'Пенсійне підтвердження', icon: 'person-outline', category: 'Соціальні' },
  { id: '11', title: 'Земля та майно', icon: 'map-outline', category: 'Нерухомість' },
  { id: '12', title: 'Реєстрація ФОП', icon: 'business-outline', category: 'Бізнес' },
  { id: '13', title: 'Декларація про доходи', icon: 'stats-chart-outline', category: 'Фінанси' },
  { id: '14', title: 'єМалятко', icon: 'happy-outline', category: 'Сімʼя' },
  { id: '15', title: 'Перевірка ВПО', icon: 'location-outline', category: 'Соціальні' },
  { id: '16', title: 'Шеринг авто', icon: 'share-social-outline', category: 'Авто' },
];

const MENU_DATA = [
  { id: '1', title: 'Свідоцтво про народження', icon: 'body-outline' },
  { id: '2', title: 'Шлюб та розлучення', icon: 'rose-outline' },
  { id: '3', title: 'Сімейний лікар', icon: 'medkit-outline' },
  { id: '4', title: 'Пільги та субсидії', icon: 'ribbon-outline' },
  { id: '5', title: 'Бізнес та ФОП', icon: 'briefcase-outline' },
  { id: '6', title: 'Нерухомість та ділянки', icon: 'home-outline' },
  { id: '7', title: 'Транспортні засоби', icon: 'car-sport-outline' },
  { id: '8', title: 'Сплачені податки та збори', icon: 'cash-outline' },
  { id: '9', title: 'Налаштування застосунку', icon: 'settings-outline' },
  { id: '10', title: 'Безпека та Face ID', icon: 'lock-closed-outline' },
  { id: '11', title: 'Служба підтримки 24/7', icon: 'help-buoy-outline' },
  { id: '12', title: 'Умови використання', icon: 'information-circle-outline' },
];


const DynamicSignature = ({ index = 0, color = '#0F172A', style }) => {
  const pathD = SIGNATURE_PATHS[index % SIGNATURE_PATHS.length];
  return (
      <View style={style}>
        <Svg height="90" width="195" viewBox="0 0 110 38">
          <Path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
          />
        </Svg>
      </View>
  );
};

const AnimatedStatusBanner = () => {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      translateX.setValue(0);
      Animated.loop(
          Animated.timing(translateX, {
            toValue: -300,
            duration: 8000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
      ).start();
    };
    startAnimation();
  }, [translateX]);

  const statusText = "Документ оновлено о 12:00 | 01.01.2026 • Документ оновлено о 12:00 | 01.01.2026 • ";

  return (
      <View style={styles.statusBannerContainer}>
        <Animated.View style={[styles.statusBannerContent, { transform: [{ translateX }] }]}>
          <Text style={styles.statusBannerText}>{statusText}</Text>
        </Animated.View>
      </View>
  );
};


export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';


  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState('docs');
  const [activeDocIndex, setActiveDocIndex] = useState(0);


  const [userData, setUserData] = useState(INITIAL_USER_DATA);


  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailDoc, setSelectedDetailDoc] = useState(null);

  const [formName, setFormName] = useState(userData.fullName);
  const [formDate, setFormDate] = useState(userData.birthDate);
  const [formDocNumber, setFormDocNumber] = useState(userData.docNumber);
  const [formPhoto, setFormPhoto] = useState(userData.photoUri);
  const [formSignatureIndex, setFormSignatureIndex] = useState(userData.signatureIndex);
  const [formSignatureUri, setFormSignatureUri] = useState(userData.signatureUri);


  const [isFlipped, setIsFlipped] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData !== null) {
        const parsedData = JSON.parse(savedData);
        setUserData(parsedData);
        syncFormWithState(parsedData);
      }
    } catch (error) {
      console.error('Помилка завантаження даних:', error);
    }
  };

  const syncFormWithState = (data) => {
    setFormName(data.fullName);
    setFormDate(data.birthDate);
    setFormDocNumber(data.docNumber);
    setFormPhoto(data.photoUri);
    setFormSignatureIndex(data.signatureIndex ?? 0);
    setFormSignatureUri(data.signatureUri ?? null);
  };

  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Авторизація в застосунку Дія',
          fallbackLabel: 'Ввести PIN-код',
        });
        if (result.success) setIsAuthenticated(true);
      } else {
        setIsAuthenticated(true);
      }
    } catch (e) {
      setIsAuthenticated(true);
    }
  };

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const scaleInterpolate = animatedValue.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [1, 0.92, 1],
  });

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 180;
    Animated.timing(animatedValue, {
      toValue,
      duration: 450,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => setIsFlipped(!isFlipped));
  };

  const handlePinInput = (value) => {
    if (pin.length < 4) {
      const newPin = pin + value;
      setPin(newPin);
      if (newPin === '1111') setIsAuthenticated(true);
    }
  };

  const pickImage = async () => {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!res.granted) return Alert.alert('Помилка', 'Потрібен доступ до галереї');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });

    if (!result.canceled) setFormPhoto(result.assets[0].uri);
  };

  const pickSignatureImage = async () => {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!res.granted) return Alert.alert('Помилка', 'Потрібен доступ до галереї');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      setFormSignatureUri(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    const updatedUserData = {
      ...userData,
      fullName: formName,
      birthDate: formDate,
      docNumber: formDocNumber || '000000000',
      photoUri: formPhoto,
      signatureIndex: formSignatureIndex,
      signatureUri: formSignatureUri,
    };

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setIsEditModalOpen(false);
      Alert.alert('Успіх', 'Дані успішно оновлено!');
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося зберегти дані.');
    }
  };

  const openDocDetails = (typeItem) => {
    setSelectedDetailDoc(typeItem);
    setIsDetailModalOpen(true);
  };

  const theme = {
    bgGradients: isDark
        ? ['#0F172A', '#1E293B', '#0F172A', '#020617']
        : ['#E2EBF0', '#EAEFE9', '#D5E0EA', '#E3EAF2'],
    cardBg: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.92)',
    text: isDark ? '#F8FAFC' : '#000000',
    subText: isDark ? '#94A3B8' : '#334155',
    pinGradient: isDark
        ? ['#1E293B', '#0F172A', '#020617']
        : ['#A2E0C0', '#72C7A7', '#58B998'],
  };


  if (!isAuthenticated) {
    return (
        <LinearGradient colors={theme.pinGradient} style={styles.fullscreen}>
          <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
          <SafeAreaView style={styles.pinContainer}>
            <Text style={[styles.diyaLogoText, { color: theme.text }]}>дія</Text>
            <Text style={[styles.pinTitle, { color: theme.text }]}>Введіть код для входу</Text>

            <View style={styles.pinDotsRow}>
              {[0, 1, 2, 3].map((idx) => (
                  <View
                      key={idx}
                      style={[
                        styles.pinDot,
                        { borderColor: theme.text },
                        pin.length > idx && { backgroundColor: theme.text },
                      ]}
                  />
              ))}
            </View>

            <View style={styles.keypad}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((item, idx) => (
                  <TouchableOpacity
                      key={idx}
                      style={styles.keypadButton}
                      onPress={() => {
                        if (item === '⌫') setPin(pin.slice(0, -1));
                        else if (item !== '') handlePinInput(item);
                      }}
                  >
                    <Text style={[styles.keypadText, { color: theme.text }]}>{item}</Text>
                  </TouchableOpacity>
              ))}
            </View>

            <View style={styles.pinActionsRow}>
              <TouchableOpacity onPress={() => Alert.alert('Тестовий вхід', 'Стандартний PIN-код: 1111')}>
                <Text style={[styles.pinActionText, { color: theme.text }]}>Забули PIN-код?</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBiometricAuth}>
                <Text style={[styles.pinActionText, { color: theme.text }]}>Вхід за Face ID 👤</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
    );
  }


  return (
      <LinearGradient colors={theme.bgGradients} style={styles.fullscreen}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <SafeAreaView style={styles.mainContainer}>

          {/* 1. Вкладка "Стрічка" */}
          {activeTab === 'feed' && (
              <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.tabHeaderRow}>
                  <Text style={[styles.greetingHeader, { color: theme.text }]}>Стрічка подій 👋</Text>
                  <TouchableOpacity style={styles.iconCircleBtn}>
                    <Ionicons name="notifications-outline" size={20} color={theme.text} />
                  </TouchableOpacity>
                </View>

                {FEED_DATA.map((item) => (
                    <View key={item.id} style={[styles.feedCard, { backgroundColor: theme.cardBg }]}>
                      <View style={styles.feedCardBadgeRow}>
                        <Text style={styles.feedCardBadgeText}>{item.tag}</Text>
                      </View>
                      <Text style={[styles.feedCardTitle, { color: theme.text }]}>{item.title}</Text>
                      <Text style={[styles.feedCardSub, { color: theme.subText }]}>{item.subtitle}</Text>
                      <TouchableOpacity
                          style={[styles.feedCardBtn, { backgroundColor: item.bgColor }]}
                          onPress={() => Alert.alert(item.title, item.subtitle)}
                      >
                        <Text style={styles.feedCardBtnText}>{item.btnText}</Text>
                      </TouchableOpacity>
                    </View>
                ))}
                <View style={{ height: 40 }} />
              </ScrollView>
          )}

          {/* 2. Вкладка "Документи" (ГОЛОВНИЙ ЕКРАН) */}
          {activeTab === 'docs' && (
              <View style={styles.docsTabWrapper}>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => {
                      const offset = e.nativeEvent.contentOffset.x;
                      const index = Math.round(offset / width);
                      setActiveDocIndex(index);
                    }}
                    style={styles.horizontalScrollView}
                >
                  {DOC_TYPES.map((typeItem, index) => (
                      <View key={index} style={styles.cardWrapper}>
                        <TouchableOpacity activeOpacity={1} onPress={flipCard} style={styles.cardContainer}>

                          {/* ЛИЦЕВА СТОРОНА КАРТКИ */}
                          <Animated.View
                              style={[
                                styles.docCard,
                                { backgroundColor: theme.cardBg },
                                {
                                  transform: [
                                    { perspective: 1000 },
                                    { rotateY: frontInterpolate },
                                    { scale: scaleInterpolate },
                                  ],
                                },
                                { backfaceVisibility: 'hidden' },
                              ]}
                          >
                            {/* Заголовок документа */}
                            <View style={styles.docHeader}>
                              <Text style={[styles.docTitle, { color: theme.text }]}>
                                {typeItem.title}
                              </Text>
                              <View style={styles.typeBadge}>
                                <Text style={styles.typeBadgeText}>{typeItem.badge}</Text>
                              </View>
                            </View>

                            {/* Основний блок: Фото + Дані + Підпис */}
                            <View style={styles.docBody}>
                              <Image source={{ uri: userData.photoUri }} style={styles.avatar} />
                              <View style={styles.docDetails}>
                                <Text style={[styles.fieldLabel, { color: theme.subText }]}>Дата{"\n"}народження:</Text>
                                <Text style={[styles.fieldValue, { color: theme.text }]}>{userData.birthDate}</Text>

                                <Text style={[styles.fieldLabel, { color: theme.subText, marginTop: 8 }]}>Номер:</Text>
                                <Text style={[styles.fieldValue, { color: theme.text }]}>{userData.docNumber}</Text>

                                {/* ЗБІЛЬШЕНИЙ ТА ЗМІЩЕНИЙ ЛІВІШЕ БЛОК ПІДПИСУ */}
                                <View style={styles.signatureBox}>
                                  {userData.signatureUri ? (
                                      <Image
                                          source={{ uri: userData.signatureUri }}
                                          style={styles.customSignatureImage}
                                          resizeMode="contain"
                                      />
                                  ) : (
                                      <DynamicSignature index={userData.signatureIndex} color={theme.text} />
                                  )}
                                </View>
                              </View>
                            </View>

                            {/* Текстовий анімований бігунок */}
                            <AnimatedStatusBanner />

                            {/* Нижня частина: ВЕЛИКЕ ІМ'Я З АВТОМАШТАБУВАННЯМ + Кнопка меню */}
                            <View style={styles.docFooterBottom}>
                              <Text
                                  style={[styles.userName, { color: theme.text }]}
                                  numberOfLines={3}
                                  adjustsFontSizeToFit={true}
                                  minimumFontScale={0.35}
                              >
                                {userData.fullName ? userData.fullName.toUpperCase().trim().split(/\s+/).join('\n') : ''}
                              </Text>
                              <TouchableOpacity
                                  style={styles.moreOptionsBtn}
                                  onPress={() => openDocDetails(typeItem)}
                              >
                                <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
                              </TouchableOpacity>
                            </View>
                          </Animated.View>

                          {/* ЗВОРОТНА СТОРОНА КАРТКИ */}
                          <Animated.View
                              style={[
                                styles.docCard,
                                styles.docCardBack,
                                { backgroundColor: theme.cardBg },
                                {
                                  transform: [
                                    { perspective: 1000 },
                                    { rotateY: backInterpolate },
                                    { scale: scaleInterpolate },
                                  ],
                                },
                                { backfaceVisibility: 'hidden' },
                              ]}
                          >
                            <Text style={[styles.codeTitle, { color: theme.subText }]}>Натисніть для повернення</Text>

                            <View style={styles.qrContainer}>
                              <QRCode
                                  value={userData.docNumber}
                                  size={180}
                                  color={isDark ? '#FFFFFF' : '#000000'}
                                  backgroundColor="transparent"
                              />
                            </View>

                            <View style={styles.barcodeBox}>
                              <View style={styles.barcodeLines}>
                                {[...Array(34)].map((_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                          styles.barcodeLine,
                                          { backgroundColor: theme.text },
                                          { width: i % 4 === 0 ? 3.5 : 1.5, marginRight: i % 2 === 0 ? 3 : 2 },
                                        ]}
                                    />
                                ))}
                              </View>
                              <Text style={[styles.barcodeText, { color: theme.text }]}>{userData.docNumber}</Text>
                            </View>
                          </Animated.View>

                        </TouchableOpacity>
                      </View>
                  ))}
                </ScrollView>

                {/* Пагінація документів */}
                <View style={styles.paginationRow}>
                  {DOC_TYPES.map((_, idx) => (
                      <View
                          key={idx}
                          style={[
                            styles.paginationDot,
                            { backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' },
                            activeDocIndex === idx && { backgroundColor: theme.text, width: 22 },
                          ]}
                      />
                  ))}
                </View>
              </View>
          )}

          {/* 3. Вкладка "Сервіси" */}
          {activeTab === 'services' && (
              <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
                <Text style={[styles.greetingHeader, { color: theme.text }]}>Послуги та сервіси</Text>
                <View style={styles.servicesGrid}>
                  {SERVICES_DATA.map((item) => (
                      <TouchableOpacity
                          key={item.id}
                          style={[styles.serviceCardItem, { backgroundColor: theme.cardBg }]}
                          onPress={() => Alert.alert(item.title, `Сервіс із категорії «${item.category}»`)}
                      >
                        <Ionicons name={item.icon} size={28} color={theme.text} style={styles.serviceIconStyle} />
                        <Text style={[styles.serviceTextLabel, { color: theme.text }]}>{item.title}</Text>
                        <Text style={[styles.serviceCategoryText, { color: theme.subText }]}>{item.category}</Text>
                      </TouchableOpacity>
                  ))}
                </View>
                <View style={{ height: 40 }} />
              </ScrollView>
          )}

          {/* 4. Вкладка "Меню" */}
          {activeTab === 'menu' && (
              <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.profileHeader}>
                  <Image source={{ uri: userData.photoUri }} style={styles.menuAvatar} />
                  <Text style={[styles.menuUserName, { color: theme.text }]}>{userData.fullName}</Text>
                  <Text style={[styles.menuSubText, { color: theme.subText }]}>РНОКПП: {userData.taxCode}</Text>
                </View>

                <View style={[styles.menuList, { backgroundColor: theme.cardBg }]}>
                  {MENU_DATA.map((item) => (
                      <TouchableOpacity
                          key={item.id}
                          style={styles.menuListItem}
                          onPress={() => {
                            if (item.title.includes('Налаштування') || item.title.includes('ФОП')) {
                              setIsEditModalOpen(true);
                            } else {
                              Alert.alert('Розділ', item.title);
                            }
                          }}
                      >
                        <View style={styles.menuItemLeftRow}>
                          <Ionicons name={item.icon} size={20} color={theme.text} style={{ marginRight: 12 }} />
                          <Text style={[styles.menuListItemText, { color: theme.text }]}>{item.title}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={theme.subText} />
                      </TouchableOpacity>
                  ))}
                </View>
                <View style={{ height: 40 }} />
              </ScrollView>
          )}


          <Modal visible={isEditModalOpen} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Редагування документа</Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={[styles.inputLabel, { color: theme.subText }]}>ПІБ (Вводьте ім'я):</Text>
                  <TextInput
                      style={[styles.input, { color: theme.text, borderColor: isDark ? '#475569' : '#CBD5E1' }]}
                      value={formName}
                      onChangeText={setFormName}
                      multiline
                  />

                  <Text style={[styles.inputLabel, { color: theme.subText }]}>Дата народження:</Text>
                  <TextInput
                      style={[styles.input, { color: theme.text, borderColor: isDark ? '#475569' : '#CBD5E1' }]}
                      value={formDate}
                      onChangeText={setFormDate}
                  />

                  <Text style={[styles.inputLabel, { color: theme.subText }]}>Номер документа:</Text>
                  <TextInput
                      style={[styles.input, { color: theme.text, borderColor: isDark ? '#475569' : '#CBD5E1' }]}
                      value={formDocNumber}
                      onChangeText={setFormDocNumber}
                      keyboardType="numeric"
                  />

                  <Text style={[styles.inputLabel, { color: theme.subText }]}>Власний підпис (з галереї):</Text>
                  <View style={styles.customSignaturePickerContainer}>
                    {formSignatureUri ? (
                        <View style={styles.selectedSignaturePreview}>
                          <Image source={{ uri: formSignatureUri }} style={styles.customSignatureImageModal} resizeMode="contain" />
                          <TouchableOpacity
                              style={styles.removeSignatureBtn}
                              onPress={() => setFormSignatureUri(null)}
                          >
                            <Ionicons name="close-circle" size={22} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.photoPickerBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
                            onPress={pickSignatureImage}
                        >
                          <Text style={[styles.photoPickerBtnText, { color: theme.text }]}>✍️ Завантажити фото підпису</Text>
                        </TouchableOpacity>
                    )}
                  </View>

                  {!formSignatureUri && (
                      <>
                        <Text style={[styles.inputLabel, { color: theme.subText }]}>Або виберіть зі стандартних векторів:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.signaturePickerScroll}>
                          {SIGNATURE_PATHS.map((_, idx) => (
                              <TouchableOpacity
                                  key={idx}
                                  style={[
                                    styles.signatureOptionBox,
                                    { borderColor: isDark ? '#475569' : '#E2E8F0' },
                                    formSignatureIndex === idx && styles.signatureOptionSelected,
                                  ]}
                                  onPress={() => {
                                    setFormSignatureIndex(idx);
                                    setFormSignatureUri(null);
                                  }}
                              >
                                <DynamicSignature index={idx} color={theme.text} />
                                <Text style={[styles.sigNumberText, { color: theme.subText }]}>Стиль #{idx + 1}</Text>
                              </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </>
                  )}

                  <TouchableOpacity style={[styles.photoPickerBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} onPress={pickImage}>
                    <Text style={[styles.photoPickerBtnText, { color: theme.text }]}>📷 Змінити фото профілю</Text>
                  </TouchableOpacity>
                </ScrollView>

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                      style={[styles.modalBtn, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}
                      onPress={() => setIsEditModalOpen(false)}
                  >
                    <Text style={{ fontWeight: '600', color: theme.text }}>Скасувати</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                      style={[styles.modalBtn, { backgroundColor: isDark ? '#F8FAFC' : '#000' }]}
                      onPress={handleSaveProfile}
                  >
                    <Text style={{ color: isDark ? '#000' : '#FFF', fontWeight: '600' }}>Зберегти</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>



          <Modal visible={isDetailModalOpen} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {selectedDetailDoc?.title.replace('\n', ' ')}
                </Text>

                <View style={{ marginVertical: 10 }}>
                  <Text style={[styles.inputLabel, { color: theme.subText }]}>Статус документа:</Text>
                  <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 16 }}>Дійсний у державних реєстрах</Text>

                  <Text style={[styles.inputLabel, { color: theme.subText, marginTop: 12 }]}>Орган видачі:</Text>
                  <Text style={{ color: theme.text, fontSize: 14 }}>{userData.authority}</Text>

                  <Text style={[styles.inputLabel, { color: theme.subText, marginTop: 12 }]}>Дата видачі / Дійсний до:</Text>
                  <Text style={{ color: theme.text, fontSize: 14 }}>{userData.issueDate} / {userData.expiryDate}</Text>

                  <Text style={[styles.inputLabel, { color: theme.subText, marginTop: 12 }]}>РНОКПП:</Text>
                  <Text style={{ color: theme.text, fontSize: 14 }}>{userData.taxCode}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.photoPickerBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9', marginTop: 15 }]}
                    onPress={() => {
                      setIsDetailModalOpen(false);
                      setIsEditModalOpen(true);
                    }}
                >
                  <Text style={[styles.photoPickerBtnText, { color: theme.text }]}>✏️ Редагувати поля документа</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: isDark ? '#F8FAFC' : '#000', marginTop: 12, width: '100%' }]}
                    onPress={() => setIsDetailModalOpen(false)}
                >
                  <Text style={{ color: isDark ? '#000' : '#FFF', fontWeight: '600' }}>Закрити</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>



          <View style={[styles.bottomNav, { backgroundColor: isDark ? '#020617' : '#000000' }]}>
            <TouchableOpacity onPress={() => setActiveTab('feed')} style={styles.navItem}>
              <Ionicons name="newspaper-outline" size={22} color={activeTab === 'feed' ? '#FFF' : '#8E8E93'} />
              <Text style={[styles.navText, activeTab === 'feed' && styles.navActive]}>Стрічка</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('docs')} style={styles.navItem}>
              <Ionicons name="card-outline" size={22} color={activeTab === 'docs' ? '#FFF' : '#8E8E93'} />
              <Text style={[styles.navText, activeTab === 'docs' && styles.navActive]}>Документи</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('services')} style={styles.navItem}>
              <Ionicons name="flash-outline" size={22} color={activeTab === 'services' ? '#FFF' : '#8E8E93'} />
              <Text style={[styles.navText, activeTab === 'services' && styles.navActive]}>Сервіси</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('menu')} style={styles.navItem}>
              <Ionicons name="person-outline" size={22} color={activeTab === 'menu' ? '#FFF' : '#8E8E93'} />
              <Text style={[styles.navText, activeTab === 'menu' && styles.navActive]}>Меню</Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </LinearGradient>
  );
}



const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
  },
  pinContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diyaLogoText: {
    fontSize: 60,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  pinTitle: {
    fontSize: 18,
    marginBottom: 25,
    fontWeight: '500',
  },
  pinDotsRow: {
    flexDirection: 'row',
    marginBottom: 35,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    marginHorizontal: 8,
  },
  keypad: {
    width: 280,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  keypadButton: {
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  keypadText: {
    fontSize: 28,
    fontWeight: '600',
  },
  pinActionsRow: {
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  pinActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tabScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingHeader: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docsTabWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  horizontalScrollView: {
    flexGrow: 0,
    height: 590,
  },
  cardWrapper: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: width * 0.88,
    height: 575,
  },
  paginationRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  docCard: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    padding: 24,
    justifyContent: 'space-between',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  docCardBack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  docTitle: {
    fontSize: 27,
    fontWeight: '700',
    lineHeight: 31,
    letterSpacing: -0.4,
    flex: 1,
  },
  typeBadge: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  docBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  avatar: {
    width: 135,
    height: 172,
    borderRadius: 22,
    backgroundColor: '#CBD5E1',
  },
  docDetails: {
    marginLeft: 16,
    flex: 1,
    justifyContent: 'flex-start',
  },
  fieldLabel: {
    fontSize: 12,
    lineHeight: 15,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 1,
  },

  signatureBox: {
    marginTop: 4,
    height: 90,
    width: 195,
    marginLeft: -16,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  customSignatureImage: {
    width: 195,
    height: 90,
  },
  statusBannerContainer: {
    backgroundColor: '#9BEFA8',
    height: 30,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    marginVertical: 6,
  },
  statusBannerContent: {
    flexDirection: 'row',
    width: 600,
  },
  statusBannerText: {
    fontSize: 12,
    color: '#0F5128',
    fontWeight: '700',
  },
  docFooterBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 2,
  },

  userName: {
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 44,
    flex: 1,
    letterSpacing: -0.5,
    paddingRight: 4,
  },
  moreOptionsBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  feedCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },
  feedCardBadgeRow: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  feedCardBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  feedCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  feedCardSub: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  feedCardBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  feedCardBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  serviceCardItem: {
    width: '48%',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    alignItems: 'center',
  },
  serviceIconStyle: {
    marginBottom: 8,
  },
  serviceTextLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  serviceCategoryText: {
    fontSize: 10,
    marginTop: 2,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 15,
  },
  menuAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: 10,
  },
  menuUserName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuSubText: {
    fontSize: 12,
    marginTop: 2,
  },
  menuList: {
    borderRadius: 20,
    paddingVertical: 6,
    marginBottom: 15,
  },
  menuListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  menuItemLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuListItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    justifyContent: 'space-around',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 4,
  },
  navActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  codeTitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  qrContainer: {
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 20,
  },
  barcodeBox: {
    alignItems: 'center',
    width: '100%',
  },
  barcodeLines: {
    flexDirection: 'row',
    height: 42,
    alignItems: 'center',
  },
  barcodeLine: {
    height: '100%',
  },
  barcodeText: {
    marginTop: 8,
    fontSize: 14,
    letterSpacing: 3,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '88%',
    maxHeight: '84%',
    borderRadius: 24,
    padding: 22,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  customSignaturePickerContainer: {
    marginVertical: 4,
  },
  selectedSignaturePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
  },
  customSignatureImageModal: {
    width: 120,
    height: 40,
  },
  removeSignatureBtn: {
    padding: 4,
  },
  signaturePickerScroll: {
    marginVertical: 8,
  },
  signatureOptionBox: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  sigNumberText: {
    fontSize: 10,
    marginTop: 2,
  },
  photoPickerBtn: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  photoPickerBtnText: {
    fontWeight: '600',
    fontSize: 13,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalBtn: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
});