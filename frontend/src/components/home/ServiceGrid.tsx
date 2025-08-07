import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SPACING } from '../../constants/spacing';
import ServiceCard from './ServiceCard';
import { Service } from '../../data/mockData';

interface ServiceGridProps {
  services: Service[];
  onServicePress: (service: Service) => void;
  onViewMorePress: () => void;
}

const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  onServicePress,
  onViewMorePress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {services.slice(0, 6).map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onPress={() => {
              if (service.title === 'View More') {
                onViewMorePress();
              } else {
                onServicePress(service);
              }
            }}
            style={styles.serviceCard}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  serviceCard: {
    width: '30%',
    marginBottom: 0,
  },
});

export default ServiceGrid; 