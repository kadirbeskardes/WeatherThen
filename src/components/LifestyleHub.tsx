import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CurrentWeather, DailyWeather } from '../types/weather';
import { calculateLifestyleScores, ActivityScore } from '../utils/lifestyleUtils';
import { Language } from '../types/settings';
import { getTranslations } from '../utils/translations';

interface LifestyleHubProps {
  current: CurrentWeather;
  daily: DailyWeather;
  language?: Language;
}

const DetailModal = ({ item, visible, onClose, language = 'tr' }: { item: ActivityScore | null, visible: boolean, onClose: () => void, language?: Language }) => {
  if (!item) return null;
  const t = getTranslations(language);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalContent}>
          <LinearGradient
            colors={[item.color, '#2C3E50']}
            style={styles.modalHeader}
          >
            <MaterialCommunityIcons name={item.icon as any} size={40} color="#FFF" />
            <Text style={styles.modalTitle}>{item.label}</Text>
          </LinearGradient>

          <View style={styles.modalBody}>
            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreNumber, { color: item.color }]}>{item.score}</Text>
              <Text style={styles.scoreTotal}>/10</Text>
            </View>

            <Text style={styles.modalDescription}>{item.description}</Text>

            <TouchableOpacity style={[styles.closeButton, { backgroundColor: item.color }]} onPress={onClose}>
              <Text style={styles.closeButtonText}>{language === 'tr' ? 'Tamam' : 'OK'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const LifestyleCard = ({ item, onPress }: { item: ActivityScore; onPress: (item: ActivityScore) => void }) => (
  <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.9}>
    <LinearGradient
      colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          <MaterialCommunityIcons name={item.icon as any} size={20} color="#FFF" />
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: item.color }]}>
          <Text style={styles.scoreText}>{item.score}</Text>
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.label}>{item.label}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

export const LifestyleHub: React.FC<LifestyleHubProps> = ({ current, daily, language = 'tr' }) => {
  const scores = calculateLifestyleScores(current, daily);
  const activities = Object.values(scores);
  const [selectedItem, setSelectedItem] = useState<ActivityScore | null>(null);
  const sectionTitle = language === 'tr' ? 'Yaşam & Aktivite' : 'Lifestyle & Activity';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{sectionTitle}</Text>
        <MaterialCommunityIcons name="heart-pulse" size={20} color="#FFF" style={{ opacity: 0.8 }} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activities.map((activity, index) => (
          <LifestyleCard
            key={index}
            item={activity}
            onPress={setSelectedItem}
          />
        ))}
      </ScrollView>

      <DetailModal
        item={selectedItem}
        visible={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        language={language}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    width: 140,
    height: 130,
    borderRadius: 20,
    padding: 12,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  textContainer: {
    gap: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  description: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 14,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalBody: {
    padding: 24,
    alignItems: 'center',
    gap: 20,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreTotal: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.5)',
  },
  modalDescription: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  closeButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
